const fs = require('fs');
const path = require('path');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { extractClub, getWikidataCandidates } = require('./lib/llm-extract');

// Setup Paths
const ROOT = path.join(__dirname, '..');

// Parse arguments: node scripts/ingest-clubs.js <country> [archiveRelativePath] [destRelativePath]
const args = process.argv.slice(2);
const country = args[0] || 'England';

const defaultArchive = country.toLowerCase() === 'england' ? 'data/clubs/archive/europe/england/eng.clubs.txt' :
                       country.toLowerCase() === 'spain' ? 'data/clubs/archive/europe/spain/es.clubs.txt' :
                       country.toLowerCase() === 'italy' ? 'data/clubs/archive/europe/italy/it.clubs.txt' : '';

const defaultDest = country.toLowerCase() === 'england' ? 'data/clubs/europe/england.json' :
                     country.toLowerCase() === 'spain' ? 'data/clubs/europe/spain.json' :
                     country.toLowerCase() === 'italy' ? 'data/clubs/europe/italy.json' : '';

const archiveRelPath = args[1] || defaultArchive;
const destRelPath = args[2] || defaultDest;

if (!archiveRelPath || !destRelPath) {
  console.error(`Usage: node scripts/ingest-clubs.js <country> [archive_relative_path] [dest_relative_path]`);
  process.exit(1);
}

const ARCHIVE_FILE = path.resolve(ROOT, archiveRelPath);
const DEST_FILE = path.resolve(ROOT, destRelPath);
const LOG_FILE = path.join(ROOT, 'scripts', 'ingestion-log.json');

// Prevent Path Traversal
if (!ARCHIVE_FILE.startsWith(ROOT + path.sep)) {
  console.error(`Security Error: Invalid archive path. Must be within repository.`);
  process.exit(1);
}
if (!DEST_FILE.startsWith(ROOT + path.sep)) {
  console.error(`Security Error: Invalid destination path. Must be within repository.`);
  process.exit(1);
}

// Check source file exists
if (!fs.existsSync(ARCHIVE_FILE)) {
  console.error(`Source archive file not found at: ${ARCHIVE_FILE}`);
  process.exit(1);
}

// Helper to normalize and slugify name
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    // Strip common suffixes
    .replace(/\b(fc|cf|sc|sl|fa|fk|club|de|futbol|soccer)\b/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper to match country descriptions in Wikidata
function checkCountryMatch(desc, country) {
  const descLower = desc.toLowerCase();
  const countryLower = country.toLowerCase();
  
  if (descLower.includes(countryLower)) return true;
  
  if (countryLower === 'england') {
    return descLower.includes('english') || descLower.includes('united kingdom') || descLower.includes('uk');
  }
  if (countryLower === 'spain') {
    return descLower.includes('spanish');
  }
  if (countryLower === 'italy') {
    return descLower.includes('italian');
  }
  if (countryLower === 'germany') {
    return descLower.includes('german');
  }
  if (countryLower === 'france') {
    return descLower.includes('french');
  }
  
  return false;
}

/**
 * Searches Wikidata for a club QID
 */
async function searchWikidata(clubName, country, aliases = []) {
  const cleanTerm = (term) => {
    return term
      .replace(/\b(fc|cf|sc|sl|fa|fk|club|de|futbol|soccer)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Build query candidates
  const queries = new Set();
  queries.add(clubName);
  queries.add(cleanTerm(clubName));
  aliases.forEach(a => {
    queries.add(a);
    queries.add(cleanTerm(a));
  });

  const matches = [];

  for (const query of queries) {
    if (!query || query.length < 2) continue;
    try {
      const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&type=item&limit=10`;
      const res = await fetch(url, { headers: { 'User-Agent': 'topbin-bot/1.0 (https://github.com/Ashborn-047/topbin)' } });
      if (!res.ok) continue;
      const data = await res.json();
      
      if (data.search && Array.isArray(data.search)) {
        for (const item of data.search) {
          const desc = (item.description || '').toLowerCase();
          const label = (item.label || '').toLowerCase();
          
          // Match description keywords for football clubs
          const isFootball = desc.includes('football club') ||
                             desc.includes('soccer club') ||
                             desc.includes('football team') ||
                             desc.includes('association football') ||
                             desc.includes('soccer team') ||
                             desc.includes('futbol club') ||
                             desc.includes('club de futbol') ||
                             desc.includes('club de football') ||
                             desc.includes('fussball-club') ||
                             desc.includes('fußballclub') ||
                             desc.includes('football association');
          
          // Verify country context (e.g. England, English, United Kingdom, UK)
          const isCountryMatch = checkCountryMatch(desc, country);

          if (isFootball && isCountryMatch) {
            matches.push({
              qid: item.id,
              label: item.label,
              description: item.description,
              score: (label === clubName.toLowerCase() ? 10 : 5) + (item.description ? 2 : 0)
            });
          }
        }
      }
    } catch (e) {
      console.warn(`  ⚠️  Wikidata search error for "${query}": ${e.message}`);
    }

    // If we have strong matches, we don't need to try all queries
    if (matches.length > 0) break;
  }

  // Fallback to LLM candidates ONLY if direct searches yield no matches
  const isReserveOrB = clubName.toLowerCase().includes(' b') ||
                        clubName.toLowerCase().startsWith('ii) ') ||
                        clubName.toLowerCase().startsWith('iii) ') ||
                        clubName.toLowerCase().includes(' reserve');

  if (matches.length === 0 && !isReserveOrB) {
    try {
      const llmCandidates = await getWikidataCandidates(clubName, country);
      if (Array.isArray(llmCandidates)) {
        for (const llmQuery of llmCandidates) {
          if (!llmQuery || llmQuery.length < 2 || queries.has(llmQuery)) continue;
          try {
            const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(llmQuery)}&language=en&format=json&type=item&limit=10`;
            const res = await fetch(url, { headers: { 'User-Agent': 'topbin-bot/1.0 (https://github.com/Ashborn-047/topbin)' } });
            if (!res.ok) continue;
            const data = await res.json();
            
            if (data.search && Array.isArray(data.search)) {
              for (const item of data.search) {
                const desc = (item.description || '').toLowerCase();
                const label = (item.label || '').toLowerCase();
                
                const isFootball = desc.includes('football club') ||
                                   desc.includes('soccer club') ||
                                   desc.includes('football team') ||
                                   desc.includes('association football') ||
                                   desc.includes('soccer team') ||
                                   desc.includes('futbol club') ||
                                   desc.includes('club de futbol') ||
                                   desc.includes('club de football') ||
                                   desc.includes('fussball-club') ||
                                   desc.includes('fußballclub') ||
                                   desc.includes('football association');
                
                const isCountryMatch = checkCountryMatch(desc, country);

                if (isFootball && isCountryMatch) {
                  matches.push({
                    qid: item.id,
                    label: item.label,
                    description: item.description,
                    score: (label === clubName.toLowerCase() ? 10 : 5) + (item.description ? 2 : 0)
                  });
                }
              }
            }
          } catch (e) {
            console.warn(`  ⚠️  Wikidata LLM search error for "${llmQuery}": ${e.message}`);
          }
          if (matches.length > 0) break;
        }
      }
    } catch (err) {
      console.warn(`  ⚠️  Failed to generate LLM candidates for Wikidata search: ${err.message}`);
    }
  }

  if (matches.length > 0) {
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    return matches[0].qid;
  }

  return null;
}

/**
 * Checks if a line contains words indicating historical discontinuities
 */
function hasDiscontinuityKeywords(text) {
  const words = ['founded', 'bankruptcy', 'bankrupted', 'merged', 'merger', 'successor', 'folded', 're-founded', 're-incorporated', 'bankrupt', 'name change', 'renamed', 'refounded'];
  const lower = text.toLowerCase();
  return words.some(w => lower.includes(w));
}

/**
 * Deterministically parses a standard club line
 */
function parseClubLine(line) {
  // Strip trailing comments (starting with ##)
  const commentIdx = line.indexOf('##');
  let cleanLine = commentIdx !== -1 ? line.substring(0, commentIdx) : line;
  
  // Also strip standard # comments
  const hashIdx = cleanLine.indexOf('#');
  cleanLine = hashIdx !== -1 ? cleanLine.substring(0, hashIdx) : cleanLine;

  const parts = cleanLine.split(',').map(p => p.trim());
  if (parts.length === 0 || !parts[0]) return null;

  const name = parts[0];
  let founded = null;
  let stadium = null;
  let city = null;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (/^\d{4}$/.test(part)) {
      founded = parseInt(part, 10);
    } else if (part.startsWith('@')) {
      stadium = part.substring(1).trim();
    } else {
      city = part;
    }
  }

  // Normalize city if it has parentheses (e.g. "London (Highbury)" -> "London")
  if (city) {
    city = city.replace(/\s*\([^)]+\)$/, '').trim();
  }

  return { name, founded, stadium, city };
}

/**
 * MAIN EXECUTION
 */
async function run() {
  console.log(`⚽ Starting Ingestion: ${country} Clubs`);
  console.log('==========================================');

  // Load existing clubs
  let existingClubs = [];
  if (fs.existsSync(DEST_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DEST_FILE, 'utf8'));
      existingClubs = data.clubs || [];
      console.log(`Loaded ${existingClubs.length} existing clubs from ${path.basename(DEST_FILE)}`);
    } catch (err) {
      console.warn(`⚠️ Failed to parse existing destination file: ${err.message}. Starting fresh.`);
    }
  }

  // Read raw lines
  const rawText = fs.readFileSync(ARCHIVE_FILE, 'utf8');
  const lines = rawText.split(/\r?\n/);
  
  const parsedClubs = [];
  let currentClub = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('=') || (trimmed.startsWith('#') && !trimmed.startsWith('# '))) {
      // Skip empty, headers, or section divider comments
      continue;
    }

    if (trimmed.startsWith('|')) {
      // Alias line for the current club
      if (currentClub) {
        // Strip comments from alias line
        const hashIdx = trimmed.indexOf('#');
        const contentPart = hashIdx !== -1 ? trimmed.substring(0, hashIdx) : trimmed;
        const commentPart = hashIdx !== -1 ? trimmed.substring(hashIdx + 1).trim() : '';

        const aliases = contentPart
          .split('|')
          .map(a => a.trim())
          .filter(a => a && a !== '|');

        currentClub.aliases.push(...aliases);

        if (commentPart && hasDiscontinuityKeywords(commentPart)) {
          currentClub.rawContext += `\nComment: ${commentPart}`;
          currentClub.hasComplexComment = true;
        }
      }
      continue;
    }

    // It's a new club line
    const parsed = parseClubLine(line);
    if (parsed) {
      // If we finished parsing a previous club, push it to parsed list
      if (currentClub) {
        parsedClubs.push(currentClub);
      }

      currentClub = {
        ...parsed,
        aliases: [],
        discontinuities: [],
        rawContext: line,
        hasComplexComment: false
      };

      // Check if the line itself has comments with discontinuity keywords
      const hashIdx = line.indexOf('#');
      if (hashIdx !== -1) {
        const comment = line.substring(hashIdx + 1).trim();
        if (hasDiscontinuityKeywords(comment)) {
          currentClub.rawContext += `\nComment: ${comment}`;
          currentClub.hasComplexComment = true;
        }
      }
    }
  }

  // Don't forget the last club
  if (currentClub) {
    parsedClubs.push(currentClub);
  }

  console.log(`Parsed ${parsedClubs.length} candidate clubs from text file.`);

  // Process and merge clubs
  let recordsAdded = 0;
  let recordsUpdated = 0;

  for (const parsed of parsedClubs) {
    // Generate id slug (e.g. "chelsea-fc" or "afc-wimbledon")
    let id = slugify(parsed.name);
    // Standardize slug to append "-fc" if the original name had FC/AFC and the base slug doesn't have it
    if (parsed.name.toLowerCase().includes('fc') && !id.endsWith('-fc')) {
      id = `${id}-fc`;
    }
    if (parsed.name.toLowerCase().startsWith('afc') && !id.startsWith('afc-')) {
      id = `afc-${id}`;
    }

    console.log(`Processing: "${parsed.name}" (Slug: ${id})...`);

    // Determine if we need to call LLM for discontinuity extraction
    let finalClubData = {
      id,
      name: parsed.name,
      country: country,
      city: parsed.city || null,
      founded: parsed.founded || null,
      stadium: parsed.stadium || null,
      aliases: [...new Set(parsed.aliases)],
      discontinuities: []
    };

    if (parsed.hasComplexComment) {
      console.log(`  🤖 Calling LLM to parse complex comments/discontinuities...`);
      try {
        const llmResult = await extractClub(parsed.rawContext, country);
        if (llmResult) {
          if (llmResult.city && !finalClubData.city) finalClubData.city = llmResult.city;
          if (llmResult.founded && !finalClubData.founded) finalClubData.founded = llmResult.founded;
          if (llmResult.stadium && !finalClubData.stadium) finalClubData.stadium = llmResult.stadium;
          if (llmResult.aliases && Array.isArray(llmResult.aliases)) {
            finalClubData.aliases = [...new Set([...finalClubData.aliases, ...llmResult.aliases])];
          }
          if (llmResult.discontinuities && Array.isArray(llmResult.discontinuities)) {
            finalClubData.discontinuities = llmResult.discontinuities;
          }
        }
      } catch (err) {
        console.error(`  ❌ LLM extraction failed: ${err.message}`);
      }
    }

    // Resolve Wikidata QID
    console.log(`  🔍 Resolving Wikidata QID...`);
    const qid = await searchWikidata(finalClubData.name, country, finalClubData.aliases);
    if (qid) {
      console.log(`  Found Wikidata QID: ${qid}`);
      finalClubData.wikidata_qid = qid;
    } else {
      console.log(`  No Wikidata QID found.`);
    }

    // Check if club already exists
    const existingIndex = existingClubs.findIndex(c => {
      return c.id === finalClubData.id || 
             c.name.toLowerCase() === finalClubData.name.toLowerCase() ||
             slugify(c.name) === slugify(finalClubData.name);
    });

    if (existingIndex !== -1) {
      // Merge
      const existing = existingClubs[existingIndex];
      console.log(`  🔄 Merging with existing record: "${existing.name}"`);
      
      existing.name = existing.name || finalClubData.name;
      existing.city = existing.city || finalClubData.city;
      existing.founded = existing.founded || finalClubData.founded;
      existing.stadium = existing.stadium || finalClubData.stadium;
      if (finalClubData.wikidata_qid) {
        existing.wikidata_qid = existing.wikidata_qid || finalClubData.wikidata_qid;
      }
      
      // Merge aliases
      const combinedAliases = new Set([...(existing.aliases || []), ...finalClubData.aliases]);
      existing.aliases = [...combinedAliases];

      // Merge discontinuities
      if (finalClubData.discontinuities.length > 0) {
        existing.discontinuities = existing.discontinuities || [];
        // prevent duplicate entries
        finalClubData.discontinuities.forEach(d => {
          const exists = existing.discontinuities.some(ed => ed.year === d.year && ed.type === d.type);
          if (!exists) existing.discontinuities.push(d);
        });
      }

      recordsUpdated++;
    } else {
      // Add new
      existingClubs.push(finalClubData);
      recordsAdded++;
    }
  }

  // Clean up null/undefined/empty array fields to satisfy schema validation
  existingClubs.forEach(c => {
    if (c.city === null || c.city === undefined) delete c.city;
    if (c.founded === null || c.founded === undefined) delete c.founded;
    if (c.stadium === null || c.stadium === undefined) delete c.stadium;
    if (c.wikidata_qid === null || c.wikidata_qid === undefined) delete c.wikidata_qid;
    if (c.aliases && c.aliases.length === 0) delete c.aliases;
    if (c.discontinuities && c.discontinuities.length === 0) delete c.discontinuities;
  });

  // Save back to JSON
  const outputJson = {
    clubs: existingClubs
  };
  
  fs.writeFileSync(DEST_FILE, JSON.stringify(outputJson, null, 2));
  console.log(`\nSaved updated clubs database to: ${DEST_FILE}`);
  console.log(`Added: ${recordsAdded} clubs`);
  console.log(`Updated: ${recordsUpdated} clubs`);

  // Log to ingestion history
  let log = { runs: [] };
  if (fs.existsSync(LOG_FILE)) {
    try {
      log = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    } catch (e) {}
  }
  
  log.runs.push({
    timestamp: new Date().toISOString(),
    script: 'ingest-clubs.js',
    target_file: path.relative(ROOT, ARCHIVE_FILE).replace(/\\/g, '/'),
    records_added: recordsAdded,
    records_updated: recordsUpdated,
    status: 'success'
  });
  
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
  console.log(`Logged ingestion run details to: ${LOG_FILE}`);
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
