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

module.exports = {
  slugify
};
