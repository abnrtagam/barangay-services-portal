const db = require('../config/db')

/**
 * Log an admin action to the activity log.
 * Call this from any controller after a successful admin operation.
 */
exports.logActivity = async (adminId, actionType, targetType, targetId, description) => {
  try {
    await db.query(
      `INSERT INTO admin_activity_log (admin_id, action_type, target_type, target_id, description, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [adminId, actionType, targetType, targetId || null, description]
    )
  } catch (err) {
    console.error('Failed to log admin activity:', err.message)
  }
}

/**
 * GET /api/admin/activity-log
 * Returns paginated admin activity feed
 */
exports.getActivityLog = async (req, res) => {
  const { page = 1, limit = 20, action_type } = req.query
  try {
    let where = 'WHERE 1=1'
    const params = []
    if (action_type) {
      where += ' AND al.action_type = ?'
      params.push(action_type)
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)
    const [rows] = await db.query(
      `SELECT al.*, CONCAT(u.first_name, ' ', u.last_name) AS admin_name
       FROM admin_activity_log al
       JOIN admins a ON al.admin_id = a.id
       JOIN users u ON a.user_id = u.id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM admin_activity_log al ${where}`, params
    )
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch activity log.' })
  }
}
