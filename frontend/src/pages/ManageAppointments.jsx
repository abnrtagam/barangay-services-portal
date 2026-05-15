// ── ManageAppointments.jsx ─────────────────────────────────
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { StatusBadge, Modal, AlertMessage } from '../components/DashboardCard'
import { FiEye, FiCheck, FiX } from 'react-icons/fi'

const APPT_STATUSES = ['Pending', 'Approved', 'Completed', 'Cancelled', 'Rejected']
const FINAL_APPT_STATUSES = ['Completed', 'Cancelled', 'Rejected']

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)
  const [newStatus, setNewStatus]       = useState('')
  const [remarks, setRemarks]           = useState('')
  const [alert, setAlert]               = useState(null)
  const [submitting, setSubmitting]     = useState(false)
  const [filter, setFilter]             = useState({ status: '', date: '' })
  const token = localStorage.getItem('admin_token')

  const load = () => {
    setLoading(true)
    const params = {}
    if (filter.status) params.status = filter.status
    if (filter.date)   params.date   = filter.date
    axios.get('/api/admin/appointments', { headers: { Authorization: `Bearer ${token}` }, params })
      .then(r => setAppointments(r.data.data || []))
      .catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openModal = (a) => { setSelected(a); setNewStatus(a.status); setRemarks(a.admin_remarks || '') }

  const isFinalized = selected && FINAL_APPT_STATUSES.includes(selected.status)

  const handleUpdate = async () => {
    if (!newStatus || !selected || isFinalized) return

    setSubmitting(true)
    try {
      await axios.patch(`/api/admin/appointments/${selected.id}/status`,
        { status: newStatus, admin_remarks: remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAlert({ type: 'success', title: 'Appointment updated', message: 'The appointment status has been updated successfully.' })
      setSelected(null)
      load()
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update appointment. Please try again.'
      setAlert({ type: 'error', title: 'Update blocked', message })
    } finally {
      setSubmitting(false)
    }
  }

  const quick = async (id, status) => {
    await axios.patch(`/api/admin/appointments/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    load()
  }

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Manage Appointments</h1><p className="page-subtitle">Review and manage appointment requests.</p></div>
      </div>
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
      <div className="card mb-3">
        <div className="card-body" style={{ padding: '14px 24px' }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
                <option value="">All</option>
                {APPT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-control" type="date" value={filter.date} onChange={e => setFilter(p => ({ ...p, date: e.target.value }))}/>
            </div>
            <div style={{ paddingBottom: 2 }}>
              <button className="btn btn-primary" onClick={load}>Apply</button>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Resident</th><th>Purpose</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--gray-400)' }}>No appointments found.</td></tr>
                  : appointments.map((a, i) => (
                    <tr key={a.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '.88rem' }}>{a.resident_name}</td>
                      <td style={{ fontSize: '.85rem' }}>{a.purpose}</td>
                      <td style={{ fontSize: '.85rem' }}>{a.appointment_date}</td>
                      <td style={{ fontSize: '.85rem' }}>{a.time_slot}</td>
                      <td><StatusBadge status={a.status}/></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openModal(a)}><FiEye/></button>
                          {a.status === 'Pending' && <>
                            <button className="btn btn-success btn-sm" onClick={() => quick(a.id, 'Approved')}><FiCheck/></button>
                            <button className="btn btn-danger btn-sm" onClick={() => quick(a.id, 'Rejected')}><FiX/></button>
                          </>}
                          {a.status === 'Approved' && (
                            <button className="btn btn-sm" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }} onClick={() => quick(a.id, 'Completed')}>Done</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Appointment"
        footer={<>
          <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdate} disabled={submitting || selected?.status === 'Completed'}>
            {selected?.status === 'Completed' ? 'Finalized' : submitting ? 'Saving...' : 'Save'}
          </button>
        </>}
      >
        {selected && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 4 }}>{selected.purpose}</div>
                <div style={{ fontSize: '.88rem', color: 'var(--gray-500)' }}>{selected.appointment_date} · {selected.time_slot}</div>
              </div>
              {isFinalized && (
                <span style={{
                  background: 'var(--gray-100)',
                  color: 'var(--gray-700)',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '.75rem',
                  fontWeight: 700,
                  letterSpacing: '.02em'
                }}>
                  Finalized
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '6px 14px', marginBottom: 16, fontSize: '.88rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Resident</span><span>{selected.resident_name}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Date & Time</span><span>{selected.appointment_date} — {selected.time_slot}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Purpose</span><span>{selected.purpose}</span>
            </div>
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--gray-50)', border: '1px solid var(--gray-150)', color: 'var(--gray-700)' }}>
              {isFinalized
                ? 'This appointment has been finalized and is locked from further status changes.'
                : 'You can update the appointment status and remarks below.'}
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select
                className="form-control"
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                disabled={isFinalized}
                style={isFinalized ? { background: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
              >
                {APPT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <textarea
                className="form-control"
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                disabled={isFinalized}
                style={isFinalized ? { background: 'var(--gray-100)', cursor: 'not-allowed' } : {}}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
