const db = require('../config/db')

// GET /api/announcements  (all authenticated users)
exports.getAll = async (req, res) => {
  const { limit = 30, page = 1 } = req.query
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const [rows] = await db.query(
      `SELECT a.*, CONCAT(u.first_name,' ',u.last_name) AS posted_by
       FROM announcements a
       JOIN users u ON a.created_by = u.id
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    )
    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM announcements')
    res.json({ data: rows, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch announcements.' })
  }
}

// POST /api/admin/announcements  (admin only)
exports.create = async (req, res) => {
  const { title, content, priority = 'Normal' } = req.body
  if (!title || !content) return res.status(422).json({ message: 'Title and content required.' })
  try {
    await db.query(
      'INSERT INTO announcements (title, content, priority, created_by) VALUES (?,?,?,?)',
      [title, content, priority, req.user.id]
    )
    res.status(201).json({ message: 'Announcement posted.' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to post announcement.' })
  }
}

// PUT /api/admin/announcements/:id  (admin only)
exports.update = async (req, res) => {
  const { id } = req.params
  const { title, content, priority } = req.body
  try {
    const [result] = await db.query(
      'UPDATE announcements SET title=?, content=?, priority=?, updated_at=NOW() WHERE id=?',
      [title, content, priority || 'Normal', id]
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Not found.' })
    res.json({ message: 'Announcement updated.' })
  } catch (err) {
    res.status(500).json({ message: 'Update failed.' })
  }
}

// DELETE /api/admin/announcements/:id  (admin only)
exports.remove = async (req, res) => {
  const { id } = req.params
  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [id])
    res.json({ message: 'Announcement deleted.' })
  } catch (err) {
    res.status(500).json({ message: 'Delete failed.' })
  }
}
