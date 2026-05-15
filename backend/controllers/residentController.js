const db = require('../config/db')

// GET /api/residents/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  const resident_id = req.user.resident_id
  try {
    const [[{ totalComplaints }]] = await db.query(
      'SELECT COUNT(*) AS totalComplaints FROM complaints WHERE resident_id = ?', [resident_id]
    )
    const [[{ pendingComplaints }]] = await db.query(
      'SELECT COUNT(*) AS pendingComplaints FROM complaints WHERE resident_id = ? AND status = "Pending"', [resident_id]
    )
    const [[{ totalAppointments }]] = await db.query(
      'SELECT COUNT(*) AS totalAppointments FROM appointments WHERE resident_id = ?', [resident_id]
    )
    const [[{ upcomingAppointments }]] = await db.query(
      `SELECT COUNT(*) AS upcomingAppointments FROM appointments
       WHERE resident_id = ? AND appointment_date >= CURDATE() AND status IN ('Pending','Approved')`,
      [resident_id]
    )
    res.json({ totalComplaints, pendingComplaints, totalAppointments, upcomingAppointments })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load stats.' })
  }
}

// GET /api/residents/notifications
exports.getNotifications = async (req, res) => {
  const user_id = req.user.id
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [user_id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch notifications.' })
  }
}

// PATCH /api/residents/profile
exports.updateProfile = async (req, res) => {
  const user_id = req.user.id
  const { first_name, last_name, phone, address } = req.body

  if (!first_name || !last_name) {
    return res.status(400).json({ message: 'First name and last name are required.' })
  }

  try {
    await db.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
      [first_name, last_name, phone, address, user_id]
    )

    // Fetch updated user
    const [[updatedUser]] = await db.query(
      'SELECT id, first_name, last_name, email, phone, address, role FROM users WHERE id = ?',
      [user_id]
    )

    res.json({ 
      message: 'Profile updated successfully.',
      user: updatedUser
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update profile.' })
  }
}

