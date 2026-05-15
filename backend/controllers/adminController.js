const db = require('../config/db')

// ── Dashboard Stats ─────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const queries = {
      totalResidents:         'SELECT COUNT(*) c FROM residents',
      totalComplaints:        'SELECT COUNT(*) c FROM complaints',
      pendingComplaints:      'SELECT COUNT(*) c FROM complaints WHERE status="Pending"',
      approvedComplaints:     'SELECT COUNT(*) c FROM complaints WHERE status="Approved"',
      scheduledComplaints:    'SELECT COUNT(*) c FROM complaints WHERE status="Scheduled"',
      resolvedComplaints:     'SELECT COUNT(*) c FROM complaints WHERE status="Resolved"',
      rejectedComplaints:     'SELECT COUNT(*) c FROM complaints WHERE status="Rejected"',
      totalAppointments:      'SELECT COUNT(*) c FROM appointments',
      pendingAppointments:    'SELECT COUNT(*) c FROM appointments WHERE status="Pending"',
      approvedAppointments:   'SELECT COUNT(*) c FROM appointments WHERE status="Approved"',
      completedAppointments:  'SELECT COUNT(*) c FROM appointments WHERE status="Completed"',
      cancelledAppointments:  'SELECT COUNT(*) c FROM appointments WHERE status="Cancelled"',
      rejectedAppointments:   'SELECT COUNT(*) c FROM appointments WHERE status="Rejected"',
    }
    const results = {}
    await Promise.all(
      Object.entries(queries).map(async ([key, sql]) => {
        const [[row]] = await db.query(sql)
        results[key] = row.c
      })
    )
    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load stats.' })
  }
}

// ── Complaints ──────────────────────────────────────────────
exports.getComplaints = async (req, res) => {
  const { status, date, search, limit = 50, page = 1 } = req.query
  let where = 'WHERE 1=1'
  const params = []
  if (status) { where += ' AND c.status = ?'; params.push(status) }
  if (date)   { where += ' AND DATE(c.created_at) = ?'; params.push(date) }
  if (search) {
    where += ' AND (CONCAT(u.first_name," ",u.last_name) LIKE ? OR c.subject LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const [rows] = await db.query(
      `SELECT c.*, cc.name AS category_name,
              CONCAT(u.first_name,' ',u.last_name) AS resident_name
       FROM complaints c
       JOIN complaint_categories cc ON c.category_id = cc.id
       JOIN residents r ON c.resident_id = r.id
       JOIN users u ON r.user_id = u.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM complaints c
       JOIN complaint_categories cc ON c.category_id = cc.id
       JOIN residents r ON c.resident_id = r.id
       JOIN users u ON r.user_id = u.id
       ${where}`,
      params
    )
    res.json({ data: rows, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch complaints.' })
  }
}

exports.updateComplaintStatus = async (req, res) => {
  const { id } = req.params
  const { status, admin_remarks } = req.body
  const validStatuses = ['Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected']
  if (!validStatuses.includes(status)) {
    return res.status(422).json({ message: 'Invalid status value.' })
  }
  try {
    const [[complaintRow]] = await db.query(
      `SELECT c.status, c.subject, u.email, u.first_name
       FROM complaints c
       JOIN residents r ON c.resident_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE c.id = ?`,
      [id]
    )
    if (!complaintRow) return res.status(404).json({ message: 'Complaint not found.' })

    const finalComplaintStatuses = ['Resolved', 'Rejected']
  if (finalComplaintStatuses.includes(complaintRow.status)) {
      return res.status(400).json({
        success: false,
        message: 'This complaint has already been finalized and is locked from further updates.'
      })
    }

    const [result] = await db.query(
      'UPDATE complaints SET status = ?, admin_remarks = ?, updated_at = NOW() WHERE id = ?',
      [status, admin_remarks || null, id]
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Complaint not found.' })

    const adminId = req.user.admin_id || req.user.id
    await db.query(
      `INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by, notes, changed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, complaintRow.status, status, adminId, admin_remarks || null]
    )

    try {
      const emailService = require('../services/emailService')
      const emailResult = await emailService.sendComplaintStatusEmail(
        complaintRow.email,
        complaintRow.first_name,
        complaintRow.subject,
        status,
        admin_remarks || ''
      )
      if (!emailResult.success) {
        console.error('Complaint notification email failed:', emailResult.error)
      }
    } catch (notifyError) {
      console.error('Failed to send complaint status notification:', notifyError)
    }

    res.json({ message: 'Complaint updated successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Unable to update the complaint at this time. Please try again later.' })
  }
}

// ── Appointments ────────────────────────────────────────────
exports.getAppointments = async (req, res) => {
  const { status, date, limit = 50, page = 1 } = req.query
  let where = 'WHERE 1=1'
  const params = []
  if (status) { where += ' AND a.status = ?'; params.push(status) }
  if (date)   { where += ' AND a.appointment_date = ?'; params.push(date) }
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const [rows] = await db.query(
      `SELECT a.*, CONCAT(u.first_name,' ',u.last_name) AS resident_name
       FROM appointments a
       JOIN residents r ON a.resident_id = r.id
       JOIN users u ON r.user_id = u.id
       ${where}
       ORDER BY a.appointment_date DESC, a.time_slot ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM appointments a
       JOIN residents r ON a.resident_id = r.id
       JOIN users u ON r.user_id = u.id ${where}`,
      params
    )
    res.json({ data: rows, total })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch appointments.' })
  }
}

exports.updateAppointmentStatus = async (req, res) => {
  const { id } = req.params
  const { status, admin_remarks } = req.body
  const validStatuses = ['Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected']
  if (!validStatuses.includes(status)) {
    return res.status(422).json({ message: 'Invalid status.' })
  }
  try {
    const [[appointmentRow]] = await db.query(
      `SELECT a.status, a.appointment_date, a.time_slot, a.purpose, u.email, u.first_name
       FROM appointments a
       JOIN residents r ON a.resident_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE a.id = ?`,
      [id]
    )
    if (!appointmentRow) return res.status(404).json({ message: 'Appointment not found.' })

    const finalAppointmentStatuses = ['Completed', 'Cancelled', 'Rejected']
    if (finalAppointmentStatuses.includes(appointmentRow.status)) {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been finalized and is locked from further updates.'
      })
    }

    const [result] = await db.query(
      'UPDATE appointments SET status = ?, admin_remarks = ?, updated_at = NOW() WHERE id = ?',
      [status, admin_remarks || null, id]
    )
    if (!result.affectedRows) return res.status(404).json({ message: 'Appointment not found.' })

    const adminId = req.user.admin_id || req.user.id
    await db.query(
      `INSERT INTO appointment_status_history (appointment_id, old_status, new_status, changed_by, notes, changed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, appointmentRow.status, status, adminId, admin_remarks || null]
    )

    try {
      const emailService = require('../services/emailService')
      const emailResult = await emailService.sendAppointmentStatusEmail(
        appointmentRow.email,
        appointmentRow.first_name,
        appointmentRow.appointment_date,
        appointmentRow.time_slot,
        status,
        admin_remarks || ''
      )
      if (!emailResult.success) {
        console.error('Appointment notification email failed:', emailResult.error)
      }
    } catch (notifyError) {
      console.error('Failed to send appointment status notification:', notifyError)
    }

    res.json({ message: 'Appointment updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Unable to update the appointment at this time. Please try again later.' })
  }
}

// ── Residents ───────────────────────────────────────────────
exports.getResidents = async (req, res) => {
  const { search, limit = 50, page = 1 } = req.query
  let where = 'WHERE u.role = "resident"'
  const params = []
  if (search) {
    where += ' AND (CONCAT(u.first_name," ",u.last_name) LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  try {
    const offset = (parseInt(page) - 1) * parseInt(limit)
    const [rows] = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.address, u.created_at, r.id AS resident_id
       FROM users u LEFT JOIN residents r ON u.id = r.user_id
       ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    )
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM users u ${where}`, params
    )
    res.json({ data: rows, total })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch residents.' })
  }
}

// ── Reports ─────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  const { from, to } = req.query
  let dateWhere = ''
  const params = []
  if (from && to) {
    dateWhere = 'AND DATE(created_at) BETWEEN ? AND ?'
    params.push(from, to)
  }
  try {
    const queries = {
      totalResidents:         [`SELECT COUNT(*) c FROM residents`, []],
      totalComplaints:        [`SELECT COUNT(*) c FROM complaints WHERE 1=1 ${dateWhere}`, params],
      pendingComplaints:      [`SELECT COUNT(*) c FROM complaints WHERE status="Pending" ${dateWhere}`, params],
      approvedComplaints:     [`SELECT COUNT(*) c FROM complaints WHERE status="Approved" ${dateWhere}`, params],
      scheduledComplaints:    [`SELECT COUNT(*) c FROM complaints WHERE status="Scheduled" ${dateWhere}`, params],
      resolvedComplaints:     [`SELECT COUNT(*) c FROM complaints WHERE status="Resolved" ${dateWhere}`, params],
      rejectedComplaints:     [`SELECT COUNT(*) c FROM complaints WHERE status="Rejected" ${dateWhere}`, params],
      totalAppointments:      [`SELECT COUNT(*) c FROM appointments WHERE 1=1 ${dateWhere}`, params],
      pendingAppointments:    [`SELECT COUNT(*) c FROM appointments WHERE status="Pending" ${dateWhere}`, params],
      approvedAppointments:   [`SELECT COUNT(*) c FROM appointments WHERE status="Approved" ${dateWhere}`, params],
      completedAppointments:  [`SELECT COUNT(*) c FROM appointments WHERE status="Completed" ${dateWhere}`, params],
      cancelledAppointments:  [`SELECT COUNT(*) c FROM appointments WHERE status="Cancelled" ${dateWhere}`, params],
      rejectedAppointments:   [`SELECT COUNT(*) c FROM appointments WHERE status="Rejected" ${dateWhere}`, params],
    }
    const results = {}
    await Promise.all(
      Object.entries(queries).map(async ([key, [sql, p]]) => {
        const [[row]] = await db.query(sql, p)
        results[key] = row.c
      })
    )
    // Complaints by category
    const [byCategory] = await db.query(
      `SELECT cc.name, COUNT(c.id) AS total,
              SUM(c.status='Pending') AS pending,
              SUM(c.status='Resolved') AS resolved
       FROM complaint_categories cc
       LEFT JOIN complaints c ON cc.id = c.category_id
       GROUP BY cc.id, cc.name ORDER BY total DESC`
    )
    results.complaintsByCategory = byCategory
    res.json(results)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to generate report.' })
  }
}

exports.exportReport = async (req, res) => {
  const { type } = req.query
  try {
    let rows, headers
    if (type === 'complaints') {
      headers = 'ID,Resident,Category,Subject,Status,Filed\n'
      const [data] = await db.query(
        `SELECT c.id, CONCAT(u.first_name,' ',u.last_name) AS resident, cc.name AS category,
                c.subject, c.status, c.created_at
         FROM complaints c
         JOIN complaint_categories cc ON c.category_id = cc.id
         JOIN residents r ON c.resident_id = r.id
         JOIN users u ON r.user_id = u.id
         ORDER BY c.created_at DESC`
      )
      rows = data
    } else {
      headers = 'ID,Resident,Date,Time Slot,Purpose,Status,Booked\n'
      const [data] = await db.query(
        `SELECT a.id, CONCAT(u.first_name,' ',u.last_name) AS resident, a.appointment_date,
                a.time_slot, a.purpose, a.status, a.created_at
         FROM appointments a
         JOIN residents r ON a.resident_id = r.id
         JOIN users u ON r.user_id = u.id
         ORDER BY a.appointment_date DESC`
      )
      rows = data
    }
    const csv = headers + rows.map(r => Object.values(r).map(v => `"${v}"`).join(',')).join('\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`)
    res.send(csv)
  } catch (err) {
    res.status(500).json({ message: 'Export failed.' })
  }
}
