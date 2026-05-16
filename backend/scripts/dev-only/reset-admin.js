// reset-admin.js
// Run this once with: node reset-admin.js
// This resets the admin password to: admin1234

require('dotenv').config()
const bcrypt = require('bcryptjs')
const mysql  = require('mysql2/promise')

async function resetAdmin() {
  console.log('Connecting to MySQL...')

  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || '127.0.0.1',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'barangay_complaint_system',
  })

  console.log('Connected!')

  // Generate bcrypt hash for admin1234
  const hash = await bcrypt.hash('admin1234', 12)
  console.log('Generated hash:', hash)

  // Check if admin user exists
  const [rows] = await db.execute(
    "SELECT id, email, role FROM users WHERE email = 'admin@barangay.gov.ph'"
  )

  if (rows.length === 0) {
    console.log('Admin not found. Creating admin user...')

    // Create the admin user
    const [result] = await db.execute(
      `INSERT INTO users (first_name, last_name, email, phone, address, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      ['Barangay', 'Admin', 'admin@barangay.gov.ph', '09000000000', 'Barangay Hall', hash, 'admin']
    )

    const userId = result.insertId

    // Create admins record
    await db.execute(
      'INSERT INTO admins (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
      [userId]
    )

    console.log('Admin user created successfully!')

  } else {
    console.log('Admin found. Updating password...')

    // Update existing admin password
    await db.execute(
      "UPDATE users SET password = ? WHERE email = 'admin@barangay.gov.ph'",
      [hash]
    )

    console.log('Password updated successfully!')
  }

  // Verify the update
  const [verify] = await db.execute(
    "SELECT id, email, role, password FROM users WHERE email = 'admin@barangay.gov.ph'"
  )

  if (verify.length > 0) {
    const isMatch = await bcrypt.compare('admin1234', verify[0].password)
    console.log('\nVerification:')
    console.log('   Email:', verify[0].email)
    console.log('   Role:', verify[0].role)
    console.log('   Password matches admin1234:', isMatch ? 'YES' : 'NO')
  }

  await db.end()
  console.log('\nDone! Now login with:')
  console.log('  Email:    admin@barangay.gov.ph')
  console.log('  Password: admin1234')
}

resetAdmin().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})