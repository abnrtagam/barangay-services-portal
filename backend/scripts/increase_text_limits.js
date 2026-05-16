const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

(async () => {
  try {
    const conn = await mysql.createConnection({
      host:     process.env.DB_HOST || '127.0.0.1',
      user:     process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'barangay_complaint_system',
    });

    console.log('Connected to database. Altering tables...');

    // Add created_at if missing
    try {
      await conn.query('ALTER TABLE complaints ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status');
    } catch (e) { /* ignore if exists */ }
    
    try {
      await conn.query('ALTER TABLE appointments ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER status');
    } catch (e) { /* ignore if exists */ }

    // Change subject and details to TEXT to avoid any length limits
    await conn.query('ALTER TABLE complaints MODIFY subject TEXT');
    await conn.query('ALTER TABLE complaints MODIFY details LONGTEXT');
    
    // Also do appointments just in case
    await conn.query('ALTER TABLE appointments MODIFY purpose TEXT');
    await conn.query('ALTER TABLE appointments MODIFY notes LONGTEXT');

    console.log('SUCCESS: Schema updated and limits removed.');

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
