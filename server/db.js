const { Pool } = require('pg');

// Supabase requires SSL. max: 3 keeps serverless connections low.
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});
