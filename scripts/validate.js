/**
 * topbin - JSON Data & Schema Validator
 * Compiles schemas in /schemas and validates all data files in /data.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const ROOT = path.join(__dirname, '..');
const SCHEMAS_DIR = path.join(ROOT, 'schemas');
const DATA_DIR = path.join(ROOT, 'data');

// Load all schemas
const schemas = {
  club: JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'club.schema.json'), 'utf8')),
  match: JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'match.schema.json'), 'utf8')),
  player: JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'player.schema.json'), 'utf8')),
  stadium: JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'stadium.schema.json'), 'utf8')),
  team: JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'team.schema.json'), 'utf8')),
  roster: JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'roster.schema.json'), 'utf8')),
  leagueSummary: JSON.parse(fs.readFileSync(path.join(SCHEMAS_DIR, 'league-summary.schema.json'), 'utf8')),
};

// Add schemas to ajv
Object.keys(schemas).forEach(name => {
  ajv.addSchema(schemas[name], name);
});

// Helper to check if file should be skipped (e.g. archive folder)
const ignoreDirs = ['archive'];

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

// Determine target schema type for a file path
function getValidator(filePath) {
  const relPath = path.relative(DATA_DIR, filePath).replace(/\\/g, '/');

  if (relPath.startsWith('clubs/')) {
    // Club files contain an array: { "clubs": [...] }
    return (data) => {
      if (!data || !Array.isArray(data.clubs)) return [{ message: "must have a 'clubs' array" }];
      const validate = ajv.getSchema('club');
      let errors = [];
      data.clubs.forEach((club, index) => {
        if (!validate(club)) {
          errors.push(...validate.errors.map(e => ({ message: `clubs[${index}] ${e.instancePath} ${e.message}` })));
        }
      });
      return errors.length > 0 ? errors : null;
    };
  }

  if (relPath.startsWith('players/')) {
    // Player files contain an array: { "players": [...] }
    return (data) => {
      if (!data || !Array.isArray(data.players)) return [{ message: "must have a 'players' array" }];
      const validate = ajv.getSchema('player');
      let errors = [];
      data.players.forEach((player, index) => {
        if (!validate(player)) {
          errors.push(...validate.errors.map(e => ({ message: `players[${index}] ${e.instancePath} ${e.message}` })));
        }
      });
      return errors.length > 0 ? errors : null;
    };
  }

  if (relPath.startsWith('stadiums/')) {
    // Stadiums file contains an array: { "stadiums": [...] }
    return (data) => {
      if (!data || !Array.isArray(data.stadiums)) return [{ message: "must have a 'stadiums' array" }];
      const validate = ajv.getSchema('stadium');
      let errors = [];
      data.stadiums.forEach((stadium, index) => {
        if (!validate(stadium)) {
          errors.push(...validate.errors.map(e => ({ message: `stadiums[${index}] ${e.instancePath} ${e.message}` })));
        }
      });
      return errors.length > 0 ? errors : null;
    };
  }

  if (relPath.startsWith('national-teams/teams.json')) {
    // Teams file contains an array: { "teams": [...] }
    return (data) => {
      if (!data || !Array.isArray(data.teams)) return [{ message: "must have a 'teams' array" }];
      const validate = ajv.getSchema('team');
      let errors = [];
      data.teams.forEach((team, index) => {
        if (!validate(team)) {
          errors.push(...validate.errors.map(e => ({ message: `teams[${index}] ${e.instancePath} ${e.message}` })));
        }
      });
      return errors.length > 0 ? errors : null;
    };
  }

  if (relPath.startsWith('rosters/')) {
    // Roster files are direct matches to roster schema
    const validate = ajv.getSchema('roster');
    return (data) => {
      if (!validate(data)) return validate.errors;
      return null;
    };
  }

  if (relPath.startsWith('leagues/') && relPath.endsWith('summary.json')) {
    // League summary files are direct matches to leagueSummary schema
    const validate = ajv.getSchema('leagueSummary');
    return (data) => {
      if (!validate(data)) return validate.errors;
      return null;
    };
  }

  if (relPath.startsWith('competitions/world-cups/') || relPath.startsWith('competitions/club-world-cup/')) {
    // Competition files contain a matches array: { ..., "matches": [...] }
    return (data) => {
      if (!data || !Array.isArray(data.matches)) return [{ message: "must have a 'matches' array" }];
      const validate = ajv.getSchema('match');
      let errors = [];
      data.matches.forEach((match, index) => {
        if (!validate(match)) {
          errors.push(...validate.errors.map(e => ({ message: `matches[${index}] ${e.instancePath} ${e.message}` })));
        }
      });
      return errors.length > 0 ? errors : null;
    };
  }

  return null; // Skip file if no validation rule applies
}

let totalErrors = 0;
let validatedCount = 0;

console.log('');
console.log('⚽ topbin — JSON Schema Validator');
console.log('================================');

const jsonFiles = getJsonFiles(DATA_DIR);
console.log(`Found ${jsonFiles.length} JSON data files to validate...\n`);

for (const filePath of jsonFiles) {
  const relPath = path.relative(ROOT, filePath);
  const validator = getValidator(filePath);
  
  if (!validator) {
    console.log(`  ℹ️  ${relPath} (Skipped: no schema mapping)`);
    continue;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    const errors = validator(data);

    if (errors) {
      totalErrors += errors.length;
      console.error(`  ❌ ${relPath}`);
      errors.forEach(err => {
        console.error(`     - ${err.message}`);
      });
    } else {
      validatedCount++;
      console.log(`  ✅ ${relPath}`);
    }
  } catch (err) {
    totalErrors++;
    console.error(`  ❌ ${relPath} (Parse Error: ${err.message})`);
  }
}

console.log('\n================================');
console.log(`  Validated files: ${validatedCount}`);
console.log(`  Total errors:    ${totalErrors}`);
console.log('================================\n');

if (totalErrors > 0) {
  process.exit(1);
} else {
  console.log('All files schema compliant! ✅ SIUUU! 🎯');
  process.exit(0);
}
