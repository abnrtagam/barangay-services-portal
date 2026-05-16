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
    console.log('DEBUG DATA (First Complaint):');
    console.log(JSON.stringify(rows[0], null, 2));
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
