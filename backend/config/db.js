const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'barangay_complaint_system',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  dateStrings:        true,
})

// Test connection on startup
;(async () => {
  try {
    const conn = await pool.getConnection()
    console.log('✅ MySQL connected — database:', process.env.DB_NAME)
    conn.release()
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message)
    console.error('   Make sure XAMPP MySQL is running and the database exists.')
  }
})()

module.exports = pool
