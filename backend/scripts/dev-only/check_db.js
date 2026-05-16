const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'barangay_complaint_system',
    });

    const [tables] = await conn.query('SHOW TABLES');
    console.log('TABLES:');
    tables.forEach((r) => console.log(Object.values(r)[0]));

    const [complaint] = await conn.query('SHOW COLUMNS FROM complaints');
    console.log('\ncomplaints columns:');
    complaint.forEach((c) => console.log(c.Field));

    for (const t of ['complaint_status_history', 'complaint_attachments', 'appointments']) {
      const [rows] = await conn.query(`SHOW TABLES LIKE '${t}'`);
      console.log(`\n${t}:`, rows.length ? 'exists' : 'missing');
    }

    await conn.end();
  } catch (err) {
    console.error('CONNECT_ERROR:', err.message);
    process.exit(1);
  }
})();
