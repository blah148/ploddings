// db-utilities.js
const db = require('./db');

async function fetchSlugsFromTable(tableName) {
  try {
    const result = await db.query(`SELECT slug FROM ${tableName}`);
    return result.rows.map(row => row.slug);
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchDataBySlug(tableName, slug) {
  try {
    const result = await db.query(`SELECT * FROM ${tableName} WHERE slug = $1`, [slug]);
    return result.rows[0];
  } catch (err) {
    console.error(err);
    return null;
  }
}

module.exports = {
  fetchSlugsFromTable,
  fetchDataBySlug,
};

