const db      = require('../config/db')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')

const sign = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// POST /api/auth/register
exports.register = async (req, res) => {
  const { first_name, last_name, email, phone, address, password } = req.body
  if (!first_name || !last_name || !email || !phone || !address || !password) {
    return res.status(422).json({ message: 'All fields are required.' })
  }
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length) return res.status(409).json({ message: 'Email already registered.' })

    const hash = await bcrypt.hash(password, 12)
    const [result] = await db.query(
      'INSERT INTO users (first_name, last_name, email, phone, address, password, role) VALUES (?,?,?,?,?,?,?)',
      [first_name, last_name, email, phone, address, hash, 'resident']
    )
    const userId = result.insertId
    await db.query('INSERT INTO residents (user_id) VALUES (?)', [userId])

    res.status(201).json({ message: 'Registration successful.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Registration failed.' })
  }
}

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(422).json({ message: 'Email and password required.' })
  try {
    const [rows] = await db.query(
      'SELECT u.*, r.id AS resident_id FROM users u LEFT JOIN residents r ON u.id = r.user_id WHERE u.email = ? AND u.role = "resident"',
      [email]
    )
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials.' })
    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' })

    const token = sign({ id: user.id, resident_id: user.resident_id, role: 'resident' })
    const { password: _, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Login failed.' })
  }
}

// POST /api/auth/admin-login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(422).json({ message: 'Email and password required.' })
  try {
    const [rows] = await db.query(
      'SELECT u.*, a.id AS admin_id FROM users u LEFT JOIN admins a ON u.id = a.user_id WHERE u.email = ? AND u.role = "admin"',
      [email]
    )
    if (!rows.length) return res.status(401).json({ message: 'Invalid admin credentials.' })
    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Invalid admin credentials.' })

    const token = sign({ id: user.id, admin_id: user.admin_id, role: 'admin', name: `${user.first_name} ${user.last_name}` })
    const { password: _, ...safeUser } = user
    res.json({ token, user: { ...safeUser, name: `${user.first_name} ${user.last_name}` } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Login failed.' })
  }
}
