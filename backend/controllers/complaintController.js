const db = require('../config/db')

const getComplaintStatusHistory = async (complaint_id) => {
  const [rows] = await db.query(
    `SELECT id, old_status, new_status, notes, changed_at
     FROM complaint_status_history
     WHERE complaint_id = ?
     ORDER BY changed_at DESC`,
    [complaint_id]
  )
  return rows
}

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
  if (subject.length > 255) {
    return res.status(422).json({ message: 'Subject is too long (max 255 chars).' })
  }
  if (details.length > 5000) {
    return res.status(422).json({ message: 'Details are too long (max 5000 chars).' })
  }
  try {
    const attachment = req.file ? req.file.filename : null
    const [result] = await db.query(
      'INSERT INTO complaints (resident_id, category_id, subject, details, attachment_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [resident_id, category_id, subject, details, attachment, 'Pending']
    )
    const complaintId = result.insertId
    await db.query(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, changed_at)
       VALUES (?, NULL, ?, NULL, NOW())`,
      [complaintId, 'Pending']
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
      `SELECT c.*, c.created_at, cc.name AS category_name
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

    // Attach history to each complaint for the mobile app timeline
    for (let i = 0; i < rows.length; i++) {
      rows[i].history = await getComplaintStatusHistory(rows[i].id);
    }

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch complaints.' })
  }
}

// GET /api/residents/complaints/:id
exports.getMyComplaintById = async (req, res) => {
  const { id } = req.params
  const resident_id = req.user.resident_id
  try {
    const [[complaint]] = await db.query(
      `SELECT c.*, c.created_at, cc.name AS category_name
       FROM complaints c
       JOIN complaint_categories cc ON c.category_id = cc.id
       JOIN residents r ON c.resident_id = r.id
       WHERE c.id = ? AND r.id = ?`,
      [id, resident_id]
    )
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' })
    }

    const history = await getComplaintStatusHistory(id)
    res.json({ ...complaint, history })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch complaint.' })
  }
}
