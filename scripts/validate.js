/**
 * topbin - JSON Data Validator
 * Validates all JSON files in the data/ directory for syntax and basic structure.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
let errors = 0;
let validated = 0;

function findJsonFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function validateJsonFile(filePath) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Basic structure checks
    if (typeof data !== 'object' || data === null) {
      throw new Error('Root must be an object or array');
    }

    // Check for empty files
    if (Array.isArray(data) && data.length === 0) {
      console.warn(`  ⚠️  ${relativePath} — Empty array`);
    } else if (Object.keys(data).length === 0) {
      console.warn(`  ⚠️  ${relativePath} — Empty object`);
    }

    validated++;
    console.log(`  ✅ ${relativePath}`);
    return true;
  } catch (err) {
    errors++;
    console.error(`  ❌ ${relativePath} — ${err.message}`);
    return false;
  }
}

// Main
console.log('');
console.log('⚽ topbin — JSON Data Validator');
console.log('================================');
console.log('');

if (!fs.existsSync(DATA_DIR)) {
  console.error('❌ data/ directory not found!');
  process.exit(1);
}

const jsonFiles = findJsonFiles(DATA_DIR);
console.log(`Found ${jsonFiles.length} JSON files to validate:\n`);

for (const file of jsonFiles) {
  validateJsonFile(file);
}

console.log('');
console.log('================================');
console.log(`  ✅ Validated: ${validated}`);
console.log(`  ❌ Errors:    ${errors}`);
console.log('================================');
console.log('');

if (errors > 0) {
  console.error('Validation FAILED ❌');
  process.exit(1);
} else {
  console.log('All files valid! ✅ SIUUU! 🎯');
  process.exit(0);
}
