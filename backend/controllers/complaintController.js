const db = require('../config/db')

// GET /api/complaints/categories
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM complaint_categories ORDER BY name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories.' })
  }
}

// POST /api/complaints  (resident)
exports.create = async (req, res) => {
  const { category_id, subject, details } = req.body
  const resident_id = req.user.resident_id
  if (!category_id || !subject || !details) {
    return res.status(422).json({ message: 'Category, subject and details are required.' })
  }
  try {
    const attachment = req.file ? req.file.filename : null
    await db.query(
      'INSERT INTO complaints (resident_id, category_id, subject, details, attachment_path, status) VALUES (?,?,?,?,?,?)',
      [resident_id, category_id, subject, details, attachment, 'Pending']
    )
    res.status(201).json({ message: 'Complaint submitted successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to submit complaint.' })
  }
}

// GET /api/residents/complaints  (resident sees own)
exports.getMyComplaints = async (req, res) => {
  const { status, search, limit = 50, page = 1 } = req.query
  const resident_id = req.user.resident_id
  let where = 'WHERE c.resident_id = ?'
  const params = [resident_id]
  if (status) { where += ' AND c.status = ?'; params.push(status) }
  if (search) { where += ' AND (c.subject LIKE ? OR cc.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const [rows] = await db.query(
      `SELECT c.*, cc.name AS category_name
       FROM complaints c
       JOIN complaint_categories cc ON c.category_id = cc.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM complaints c JOIN complaint_categories cc ON c.category_id = cc.id ${where}`,
      params
    )
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch complaints.' })
  }
}
