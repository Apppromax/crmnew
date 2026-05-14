const { Pool } = require('pg');
const pool = new Pool({ connectionString: "postgresql://postgres.jhjojgjuonmwjgoxzicy:wCUbaBOT4wirD6dF@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true" });
pool.query('SELECT email, role FROM profiles', (err, res) => {
  if (err) console.error(err);
  else console.log(res.rows);
  pool.end();
});
