const db = require('../config/db')
const emailService = require('../services/emailService')

/**
 * Get all pending resident accounts for verification
 * GET /api/admin/verifications/pending
 */
exports.getPendingAccounts = async (req, res) => {
  try {
    const [accounts] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.address,
              u.verification_documents, u.created_at, u.email_verified, u.status
       FROM users u
       WHERE u.role = 'resident' AND u.status = 'pending'
       ORDER BY u.created_at DESC`
    )

    res.json({ data: accounts })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch pending accounts.' })
  }
}

/**
 * Get all accounts with filtering
 * GET /api/admin/verifications
 */
exports.getAllAccounts = async (req, res) => {
  const { status, search } = req.query

  let where = 'WHERE u.role = "resident"'
  const params = []

  if (status && status !== 'all') {
    where += ' AND u.status = ?'
    params.push(status)
  }

  if (search) {
    where += ' AND (CONCAT(u.first_name, " ", u.last_name) LIKE ? OR u.email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  try {
    const [accounts] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.address,
              u.verification_documents, u.created_at, u.email_verified, u.status,
              u.updated_at
       FROM users u
       ${where}
       ORDER BY 
         CASE u.status
           WHEN 'pending' THEN 1
           WHEN 'approved' THEN 2
           WHEN 'rejected' THEN 3
           WHEN 'suspended' THEN 4
         END,
         u.created_at DESC`,
      params
    )

    res.json({ data: accounts })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch accounts.' })
  }
}

/**
 * Get account details by ID
 * GET /api/admin/verifications/:id
 */
exports.getAccountDetails = async (req, res) => {
  const { id } = req.params

  try {
    const [accounts] = await db.query(
      `SELECT u.*, r.id AS resident_id
       FROM users u
       LEFT JOIN residents r ON u.id = r.user_id
       WHERE u.id = ? AND u.role = 'resident'`,
      [id]
    )

    if (!accounts.length) {
      return res.status(404).json({ message: 'Account not found.' })
    }

    const account = accounts[0]
    const { password: _, ...safeAccount } = account

    // Get verification history
    const [history] = await db.query(
      `SELECT vn.*, CONCAT(u.first_name, ' ', u.last_name) AS admin_name
       FROM verification_notes vn
       JOIN admins a ON vn.admin_id = a.id
       JOIN users u ON a.user_id = u.id
       WHERE vn.user_id = ?
       ORDER BY vn.created_at DESC`,
      [id]
    )

    res.json({ account: safeAccount, history })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch account details.' })
  }
}

/**
 * Approve account
 * POST /api/admin/verifications/:id/approve
 */
exports.approveAccount = async (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  const adminId = req.user.admin_id

  try {
    // Get user details
    const [users] = await db.query(
      'SELECT first_name, last_name, email, status FROM users WHERE id = ? AND role = "resident"',
      [id]
    )

    if (!users.length) {
      return res.status(404).json({ message: 'Account not found.' })
    }

    const user = users[0]

    if (user.status === 'approved') {
      return res.status(400).json({ message: 'Account is already approved.' })
    }

    // Update status to approved
    await db.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      ['approved', id]
    )

    // Log the action
    await db.query(
      `INSERT INTO verification_notes (user_id, admin_id, action, notes)
       VALUES (?, ?, 'approved', ?)`,
      [id, adminId, notes || 'Account approved']
    )

    // Send approval email
    await emailService.sendApprovalEmail(user.email, user.first_name, true)

    res.json({ 
      message: 'Account approved successfully. User has been notified via email.',
      status: 'approved' 
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to approve account.' })
  }
}

/**
 * Reject account
 * POST /api/admin/verifications/:id/reject
 */
exports.rejectAccount = async (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  const adminId = req.user.admin_id

  if (!notes || notes.trim().length < 10) {
    return res.status(422).json({ 
      message: 'Please provide a reason for rejection (minimum 10 characters).' 
    })
  }

  try {
    // Get user details
    const [users] = await db.query(
      'SELECT first_name, last_name, email, status FROM users WHERE id = ? AND role = "resident"',
      [id]
    )

    if (!users.length) {
      return res.status(404).json({ message: 'Account not found.' })
    }

    const user = users[0]

    // Update status to rejected
    await db.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      ['rejected', id]
    )

    // Log the action
    await db.query(
      `INSERT INTO verification_notes (user_id, admin_id, action, notes)
       VALUES (?, ?, 'rejected', ?)`,
      [id, adminId, notes]
    )

    // Send rejection email
    await emailService.sendApprovalEmail(user.email, user.first_name, false)

    res.json({ 
      message: 'Account rejected. User has been notified via email.',
      status: 'rejected' 
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to reject account.' })
  }
}

/**
 * Suspend account
 * POST /api/admin/verifications/:id/suspend
 */
exports.suspendAccount = async (req, res) => {
  const { id } = req.params
  const { notes } = req.body
  const adminId = req.user.admin_id

  if (!notes || notes.trim().length < 10) {
    return res.status(422).json({ 
      message: 'Please provide a reason for suspension (minimum 10 characters).' 
    })
  }

  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [users] = await connection.query(
      'SELECT status FROM users WHERE id = ? AND role = "resident"',
      [id]
    )

    if (!users.length) {
      await connection.rollback()
      return res.status(404).json({ message: 'Account not found.' })
    }

    if (users[0].status === 'suspended') {
      await connection.rollback()
      return res.status(400).json({ message: 'Account is already suspended.' })
    }

    await connection.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      ['suspended', id]
    )

    await connection.query(
      `INSERT INTO verification_notes (user_id, admin_id, action, notes)
       VALUES (?, ?, 'suspended', ?)`,
      [id, adminId, notes]
    )

    await connection.commit()
    res.json({ 
      message: 'Account suspended successfully.',
      status: 'suspended' 
    })
  } catch (err) {
    console.error(err)
    if (connection) await connection.rollback()
    res.status(500).json({ message: 'Failed to suspend account.' })
  } finally {
    if (connection) connection.release()
  }
}

/**
 * Get verification statistics
 * GET /api/admin/verifications/stats
 */
exports.getVerificationStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended,
        SUM(CASE WHEN email_verified = TRUE THEN 1 ELSE 0 END) AS emailVerified,
        SUM(CASE WHEN email_verified = FALSE THEN 1 ELSE 0 END) AS emailNotVerified
      FROM users
      WHERE role = 'resident'
    `)

    res.json(stats[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch statistics.' })
  }
}

/**
 * Get reactivation requests
 * GET /api/admin/verifications/reactivation-requests
 */
exports.getReactivationRequests = async (req, res) => {
  try {
    const [tables] = await db.query("SHOW TABLES LIKE 'reactivation_requests'")
    if (!tables.length) {
      return res.json({ data: [] })
    }

    const [requests] = await db.query(`
      SELECT rr.*, u.first_name, u.last_name, u.email
      FROM reactivation_requests rr
      JOIN users u ON rr.user_id = u.id
      WHERE rr.status = 'pending'
      ORDER BY rr.requested_at DESC
    `)

    res.json({ data: requests })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch reactivation requests.' })
  }
}

/**
 * Reactivate account
 * POST /api/admin/verifications/:id/reactivate
 */
exports.reactivateAccount = async (req, res) => {
  const { id } = req.params
  const adminId = req.user.admin_id
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [users] = await connection.query(
      'SELECT status FROM users WHERE id = ? AND role = "resident"',
      [id]
    )

    if (!users.length) {
      await connection.rollback()
      return res.status(404).json({ message: 'Account not found.' })
    }

    await connection.query(
      'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
      ['approved', id]
    )

    const [tables] = await connection.query("SHOW TABLES LIKE 'reactivation_requests'")
    if (tables.length) {
      await connection.query(
        'UPDATE reactivation_requests SET status = ?, processed_at = NOW(), admin_id = ? WHERE user_id = ? AND status = "pending"',
        ['approved', adminId, id]
      )
    }

    await connection.query(
      `INSERT INTO verification_notes (user_id, admin_id, action, notes)
       VALUES (?, ?, 'reactivated', 'Account reactivated')`,
      [id, adminId]
    )

    await connection.commit()
    res.json({ 
      message: 'Account reactivated successfully.',
      status: 'approved' 
    })
  } catch (err) {
    console.error(err)
    if (connection) await connection.rollback()
    res.status(500).json({ message: 'Failed to reactivate account.' })
  } finally {
    if (connection) connection.release()
  }
}

module.exports = exports
