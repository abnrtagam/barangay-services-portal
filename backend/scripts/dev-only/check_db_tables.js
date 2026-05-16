const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'barangay_complaint_system',
    });

    for (const t of ['complaint_status_history', 'appointment_status_history']) {
      try {
        const [rows] = await conn.query(`SHOW CREATE TABLE \`${t}\``);
        console.log(`SHOW CREATE ${t}:`);
        console.log(rows[0]['Create Table']);
        console.log('---');
      } catch (err) {
        console.log(`${t}: missing or error: ${err.message}`);
      }
    }

    await conn.end();
  } catch (err) {
    console.error('CONNECT_ERROR:', err.message);
    process.exit(1);
  }
})();
