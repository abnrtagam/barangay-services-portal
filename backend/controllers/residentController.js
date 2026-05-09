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
