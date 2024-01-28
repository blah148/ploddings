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

async function getParentObject(threadId) {
  try {
		console.log(`this is the parentId: ${threadId}`);
    const result = await db.query(`
      SELECT thread_name, featured_img_alt_text, featured_img_200px, slug 
      FROM threads 
      WHERE thread_id = $1
    `, [threadId]);
		console.log('Query result:', result.rows); // Log the query result
    return result.rows[0];
  } catch (err) {
		console.error('Database error:', err);
    return null;
  }
}

module.exports = {
  fetchSlugsFromTable,
  fetchDataBySlug,
	getParentObject,
};

