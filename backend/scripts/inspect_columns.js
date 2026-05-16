const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host:     process.env.DB_HOST || '127.0.0.1',
      user:     process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: 'barangay_complaint_system',
    });

    const [rows] = await conn.query('SELECT * FROM complaints LIMIT 1');
    if (rows.length > 0) {
      console.log('COLUMNS IN complaints TABLE:');
      console.log(Object.keys(rows[0]));
    } else {
      console.log('No data in complaints table to inspect.');
    }
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
