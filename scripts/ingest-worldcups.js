const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '..', '..', 'worldcup-source');
const DEST_DIR = path.join(__dirname, '..', 'data', 'competitions', 'world-cups');

if (!fs.existsSync(SOURCE_DIR)) {
  console.error("Source directory not found. Did you clone the repo?");
  process.exit(1);
}

// Find all year directories (e.g., 1930, 2014, 2018)
const years = fs.readdirSync(SOURCE_DIR).filter(file => {
  return fs.statSync(path.join(SOURCE_DIR, file)).isDirectory() && /^\d{4}$/.test(file);
});

let totalMatches = 0;

years.forEach(year => {
  // We already did 2022 and 2026 manually with enrichments
  if (year === '2022' || year === '2026') return;

  const sourceFile = path.join(SOURCE_DIR, year, 'worldcup.json');
  if (!fs.existsSync(sourceFile)) return;

  try {
    const rawData = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
    
    // Transform into topbin schema
    const topbinData = {
      name: rawData.name,
      edition: parseInt(year) >= 1930 ? (parseInt(year) - 1930) / 4 + 1 : null, // rough calculation
      host: "Historical Data", // Will need manual or secondary enrichment later
      matches: []
    };

    if (rawData.rounds) {
      rawData.rounds.forEach(round => {
        round.matches.forEach(match => {
          
          let score = {};
          if (match.score) {
            score.ft = [match.score.score1, match.score.score2];
            if (match.score.score1i !== undefined) score.ht = [match.score.score1i, match.score.score2i];
            if (match.score.score1et !== undefined) score.et = [match.score.score1et, match.score.score2et];
            if (match.score.score1p !== undefined) score.p = [match.score.score1p, match.score.score2p];
          } else {
             // fallback for unplayed or different schema
             score.ft = [0,0];
          }

          let goals1 = [];
          let goals2 = [];
          
          if (match.goals1) {
            goals1 = match.goals1.map(g => ({ name: g.name, minute: String(g.minute), penalty: g.penalty || false, ownGoal: g.owngoal || false }));
          }
          if (match.goals2) {
            goals2 = match.goals2.map(g => ({ name: g.name, minute: String(g.minute), penalty: g.penalty || false, ownGoal: g.owngoal || false }));
          }

          topbinData.matches.push({
            round: round.name,
            date: match.date,
            time: match.time || "00:00",
            team1: match.team1?.name || match.team1 || "Unknown",
            team2: match.team2?.name || match.team2 || "Unknown",
            score: score,
            goals1: goals1,
            goals2: goals2,
            group: match.group || null,
            stadium: match.stadium?.name || match.stadium || "Unknown",
            city: match.city || "Unknown",
            attendance: null, // Openfootball doesn't have attendance in this schema
            referee: null
          });
          totalMatches++;
        });
      });
    }

    fs.writeFileSync(path.join(DEST_DIR, `${year}.json`), JSON.stringify(topbinData, null, 2));
    console.log(`✅ Ingested World Cup ${year} (${topbinData.matches.length} matches)`);

  } catch (e) {
    console.error(`❌ Error parsing ${year}:`, e.message);
  }
});

console.log(`\n🎉 Successfully ingested ${totalMatches} historical matches into topbin schema!`);
