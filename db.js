// db.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres.bmvuqgfxczoytjwjpvcn',
  host: 'aws-0-us-west-1.pooler.supabase.com',
  database: 'postgres',
  password: 'm6H!DI!qV@lfLRL$',
  port: 6543,  // The default PostgreSQL port, can be different based on your Supabase configuration
  ssl: {
    rejectUnauthorized: false,  // This may be needed for some cloud providers like Heroku or Supabase
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

