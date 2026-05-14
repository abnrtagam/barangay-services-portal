import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { StatusBadge, Modal } from '../components/DashboardCard'
import StatusTimeline from '../components/StatusTimeline'
import { FiEye, FiPlus } from 'react-icons/fi'
import { formatDate } from '../utils/date'

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const token = localStorage.getItem('resident_token')

  useEffect(() => {
    const params = statusFilter ? { status: statusFilter } : {}
    axios.get('/api/residents/appointments', { headers: { Authorization: `Bearer ${token}` }, params })
      .then(r => setAppointments(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter])

  const loadAppointmentDetail = async (id) => {
    try {
      const res = await axios.get(`/api/residents/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelected(res.data)
    } catch (err) {
      console.error('Failed to load appointment details:', err)
    }
  }

  const STATUS_OPTS = ['', 'Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointment History</h1>
          <p className="page-subtitle">View and track all your appointment requests.</p>
        </div>
        <Link to="/resident/appointments/book" className="btn btn-primary"><FiPlus/> Book Appointment</Link>
      </div>

      <div className="card mb-3">
        <div className="card-body" style={{ padding: '14px 24px' }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label">Filter by Status</label>
              <select className="form-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All'}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>No appointments found.</p>
            <Link to="/resident/appointments/book" className="btn btn-primary mt-2">Book an Appointment</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Purpose</th><th>Date</th><th>Time Slot</th>
                  <th>Status</th><th>Booked On</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{a.purpose}</td>
                    <td>{formatDate(a.appointment_date, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>{a.time_slot}</td>
                    <td><StatusBadge status={a.status}/></td>
                    <td style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>{formatDate(a.created_at)}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => loadAppointmentDetail(a.id)}>
                        <FiEye/> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!selected} onClose={() => setSelected(null)} title="Appointment Details"
        footer={<button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>}
      >
        {selected && (
          <div style={{ fontSize: '.9rem', lineHeight: 1.8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px 16px', marginBottom: 16 }}>
              {[['Status', <StatusBadge status={selected.status}/>],
                ['Date', formatDate(selected.appointment_date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
                ['Time Slot', selected.time_slot],
                ['Purpose', selected.purpose],
                ['Booked On', formatDate(selected.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })],
              ].map(([label, value]) => (
                <React.Fragment key={label}>
                  <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>{label}</span>
                  <span>{value}</span>
                </React.Fragment>
              ))}
            </div>
            {selected.notes && (
              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: '.85rem' }}>Notes</div>
                <div style={{ color: 'var(--gray-600)' }}>{selected.notes}</div>
              </div>
            )}
            {selected.admin_remarks && (
              <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--primary-700)', marginBottom: 4 }}>Admin Remarks</div>
                <div style={{ color: 'var(--gray-700)' }}>{selected.admin_remarks}</div>
              </div>
            )}
            {selected.history && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-200)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 16 }}>
                  Status History
                </div>
                <StatusTimeline history={selected.history} type="appointment" />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
