// dbConfig.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER, 
  host: 'localhost',
  database: 'ploddings',
  password: process.env.DB_PASSWORD,
  port: 5432, // default PostgreSQL port
});

module.exports = pool;

