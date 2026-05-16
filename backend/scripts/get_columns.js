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

    console.log('--- COMPLAINTS TABLE ---');
    const [cols] = await conn.query('DESCRIBE complaints');
    console.log(cols.map(c => `${c.Field} (${c.Type})`).join(', '));
    
    console.log('--- APPOINTMENTS TABLE ---');
    const [cols2] = await conn.query('DESCRIBE appointments');
    console.log(cols2.map(c => `${c.Field} (${c.Type})`).join(', '));

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
