/**
 * topbin - Referential Integrity Checker
 * Verifies that all entity references (like player_ref in rosters, and club/stadium references in matches)
 * resolve to valid entity slugs in the database.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');

const ignoreDirs = ['archive'];

// Slugify helper that normalizes names and strips common suffixes like FC, CF, SC
function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(fc|cf|sc|sl|fa|fk|club|de|futbol|soccer)\b/g, '') // strip common suffixes/words
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getJsonFiles(dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (!ignoreDirs.includes(file.name)) {
        results.push(...getJsonFiles(filePath));
      }
    } else if (file.name.endsWith('.json')) {
      results.push(filePath);
    }
  }
  return results;
}

// 1. Build entity slug indexes
const playersSlugs = new Set();
const clubsSlugs = new Set();
const stadiumsSlugs = new Set();
const stadiumsNames = new Set();
const nationalTeamsSlugs = new Set();
const nationalTeamsNames = new Set();

const allJsonFiles = getJsonFiles(DATA_DIR);

for (const filePath of allJsonFiles) {
  const relPath = path.relative(DATA_DIR, filePath).replace(/\\/g, '/');

  if (!relPath.startsWith('players/') &&
      !relPath.startsWith('clubs/') &&
      !relPath.startsWith('stadiums/') &&
      !relPath.startsWith('national-teams/teams.json')) {
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    continue; // Skip invalid syntax JSON, let validate.js handle it
  }

  if (relPath.startsWith('players/')) {
    if (Array.isArray(data.players)) {
      data.players.forEach(p => { if (p.id) playersSlugs.add(p.id); });
    }
  } else if (relPath.startsWith('clubs/')) {
    if (Array.isArray(data.clubs)) {
      data.clubs.forEach(c => {
        if (c.id) {
          clubsSlugs.add(c.id);
          clubsSlugs.add(slugify(c.name));
        }
      });
    }
  } else if (relPath.startsWith('stadiums/')) {
    if (Array.isArray(data.stadiums)) {
      data.stadiums.forEach(s => {
        if (s.id) {
          stadiumsSlugs.add(s.id);
          stadiumsSlugs.add(slugify(s.name));
        }
        if (s.name) stadiumsNames.add(s.name);
      });
    }
  } else if (relPath.startsWith('national-teams/teams.json')) {
    if (Array.isArray(data.teams)) {
      data.teams.forEach(t => {
        if (t.id) {
          nationalTeamsSlugs.add(t.id);
          nationalTeamsSlugs.add(slugify(t.name));
        }
        if (t.name) nationalTeamsNames.add(t.name);
      });
    }
  }
}

console.log('⚽ topbin — Referential Integrity Checker');
console.log('==========================================');
console.log(`Loaded Slugs:`);
console.log(`  - Players:        ${playersSlugs.size}`);
console.log(`  - Clubs:          ${clubsSlugs.size}`);
console.log(`  - Stadiums:       ${stadiumsSlugs.size} (${stadiumsNames.size} names)`);
console.log(`  - National Teams: ${nationalTeamsSlugs.size}`);
console.log('');

let errors = 0;

// 2. Validate Rosters and Match files
for (const filePath of allJsonFiles) {
  const relPath = path.relative(DATA_DIR, filePath).replace(/\\/g, '/');

  if (!relPath.startsWith('rosters/') && !relPath.startsWith('competitions/world-cups/') && !relPath.startsWith('competitions/club-world-cup/')) {
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    continue;
  }

  // Validate rosters
  if (relPath.startsWith('rosters/')) {
    if (Array.isArray(data.players)) {
      data.players.forEach((p, idx) => {
        if (!playersSlugs.has(p.player_ref)) {
          console.error(`❌ ${relPath}: player_ref "${p.player_ref}" (at index ${idx}) is not defined in any player file.`);
          errors++;
        }
      });
    }
  }

  // Validate matches in competitions
  if (relPath.startsWith('competitions/world-cups/') || relPath.startsWith('competitions/club-world-cup/')) {
    if (Array.isArray(data.matches)) {
      data.matches.forEach((m, idx) => {
        // Handle TBD placeholders
        if (m.team1 === 'TBD' || m.team2 === 'TBD') {
          return;
        }

        // Clean names by stripping parentheses suffixes like "Al Ahly SC (EGY)" -> "Al Ahly SC"
        const cleanT1 = m.team1.replace(/\s*\([^)]+\)$/, '').trim();
        const cleanT2 = m.team2.replace(/\s*\([^)]+\)$/, '').trim();

        // Validate team 1
        const t1Slug = slugify(cleanT1);
        const t1Valid = nationalTeamsNames.has(cleanT1) || nationalTeamsSlugs.has(t1Slug) || clubsSlugs.has(t1Slug);
        if (!t1Valid) {
          console.error(`❌ ${relPath}: team1 "${m.team1}" (match index ${idx}) is not registered in teams or clubs database.`);
          errors++;
        }

        // Validate team 2
        const t2Slug = slugify(cleanT2);
        const t2Valid = nationalTeamsNames.has(cleanT2) || nationalTeamsSlugs.has(t2Slug) || clubsSlugs.has(t2Slug);
        if (!t2Valid) {
          console.error(`❌ ${relPath}: team2 "${m.team2}" (match index ${idx}) is not registered in teams or clubs database.`);
          errors++;
        }

        // Validate stadium (if defined)
        if (m.stadium) {
          const stadSlug = slugify(m.stadium);
          const stadValid = stadiumsNames.has(m.stadium) || stadiumsSlugs.has(stadSlug);
          if (!stadValid) {
            console.warn(`⚠️  ${relPath}: stadium "${m.stadium}" (match index ${idx}) is not registered in stadiums.json.`);
          }
        }
      });
    }
  }
}

console.log('==========================================');
if (errors > 0) {
  console.error(`Referential integrity FAILED with ${errors} error(s) ❌`);
  process.exit(1);
} else {
  console.log('Referential integrity checks PASSED! ✅ SIUUU! 🎯');
  process.exit(0);
}
