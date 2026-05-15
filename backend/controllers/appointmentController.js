const db = require('../config/db')

const getAppointmentStatusHistory = async (appointment_id) => {
  const [rows] = await db.query(
    `SELECT id, old_status, new_status, notes, changed_at
     FROM appointment_status_history
     WHERE appointment_id = ?
     ORDER BY changed_at ASC`,
    [appointment_id]
  )
  return rows
}

// GET /api/appointments/taken-slots?date=YYYY-MM-DD
exports.getTakenSlots = async (req, res) => {
  const { date } = req.query
  if (!date) return res.status(422).json({ message: 'Date is required.' })
  try {
    const [rows] = await db.query(
      `SELECT time_slot FROM appointments
       WHERE appointment_date = ? AND status NOT IN ('Cancelled','Rejected')`,
      [date]
    )
    res.json(rows.map(r => r.time_slot))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch taken slots.' })
  }
}

// POST /api/appointments  (resident)
exports.create = async (req, res) => {
  const { appointment_date, time_slot, purpose, notes } = req.body
  const resident_id = req.user.resident_id
  if (!appointment_date || !time_slot || !purpose) {
    return res.status(422).json({ message: 'Date, time slot and purpose are required.' })
  }
  // Prevent weekend booking
  const dow = new Date(appointment_date).getDay()
  if (dow === 0 || dow === 6) {
    return res.status(422).json({ message: 'Appointments are only available on weekdays.' })
  }
  try {
    // Check for duplicate slot
    const [existing] = await db.query(
      `SELECT id FROM appointments WHERE appointment_date = ? AND time_slot = ? AND status NOT IN ('Cancelled','Rejected')`,
      [appointment_date, time_slot]
    )
    if (existing.length) {
      return res.status(409).json({ message: 'This time slot is already taken. Please choose another.' })
    }
    // Check if resident already has a pending appointment on same day
    const [dup] = await db.query(
      `SELECT id FROM appointments WHERE resident_id = ? AND appointment_date = ? AND status NOT IN ('Cancelled','Rejected')`,
      [resident_id, appointment_date]
    )
    if (dup.length) {
      return res.status(409).json({ message: 'You already have an appointment on this date.' })
    }
    const [result] = await db.query(
      `INSERT INTO appointments (resident_id, appointment_date, time_slot, purpose, notes, status)
       VALUES (?,?,?,?,?,?)`,
      [resident_id, appointment_date, time_slot, purpose, notes || null, 'Pending']
    )
    const appointmentId = result.insertId
    await db.query(
      `INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, changed_at)
       VALUES (?, NULL, ?, NULL, NOW())`,
      [appointmentId, 'Pending']
    )
    res.status(201).json({ message: 'Appointment booked successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to book appointment.' })
  }
}

// GET /api/residents/appointments  (resident sees own)
exports.getMyAppointments = async (req, res) => {
  const { status, limit = 50, page = 1 } = req.query
  const resident_id = req.user.resident_id
  let where = 'WHERE a.resident_id = ?'
  const params = [resident_id]
  if (status) { where += ' AND a.status = ?'; params.push(status) }
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const [rows] = await db.query(
      `SELECT a.* FROM appointments a ${where} ORDER BY a.appointment_date DESC, a.time_slot ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM appointments a ${where}`, params
    )
    
    // Attach history to each appointment for the mobile app timeline
    for (let i = 0; i < rows.length; i++) {
      rows[i].history = await getAppointmentStatusHistory(rows[i].id);
    }

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments.' })
  }
}

// GET /api/residents/appointments/:id
exports.getMyAppointmentById = async (req, res) => {
  const { id } = req.params
  const resident_id = req.user.resident_id
  try {
    const [[appointment]] = await db.query(
      `SELECT a.* FROM appointments a
       JOIN residents r ON a.resident_id = r.id
       WHERE a.id = ? AND r.id = ?`,
      [id, resident_id]
    )
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' })
    }

    const history = await getAppointmentStatusHistory(id)
    res.json({ ...appointment, history })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch appointment.' })
  }
}
