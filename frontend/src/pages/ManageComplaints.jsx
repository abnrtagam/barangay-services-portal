import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { StatusBadge, Modal, AlertMessage } from '../components/DashboardCard'
import { FiEye, FiFilter, FiCheck, FiX, FiCalendar, FiCheckSquare, FiAlertCircle } from 'react-icons/fi'
import { formatDate } from '../utils/date'

const STATUS_OPTS = ['', 'Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected']
const FINAL_COMPLAINT_STATUSES = ['Resolved', 'Rejected']
const COMPLAINT_TRANSITIONS = {
  'Pending':   ['Approved', 'Rejected'],
  'Approved':  ['Scheduled', 'Resolved'],
  'Scheduled': ['Resolved'],
  'Resolved':  [],
  'Rejected':  [],
}

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [alert, setAlert]           = useState(null)
  const [filter, setFilter]         = useState({ status: '', search: '', date: '' })
  const [remarks, setRemarks]       = useState('')
  const [newStatus, setNewStatus]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const token = localStorage.getItem('admin_token')

  const load = () => {
    setLoading(true)
    const params = {}
    if (filter.status) params.status = filter.status
    if (filter.search) params.search = filter.search
    if (filter.date)   params.date   = filter.date
    axios.get('/api/admin/complaints', { headers: { Authorization: `Bearer ${token}` }, params })
      .then(r => setComplaints(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openDetail = (c) => {
    setSelected(c)
    setRemarks(c.admin_remarks || '')
    const transitions = COMPLAINT_TRANSITIONS[c.status] || []
    setNewStatus(transitions[0] || c.status)
  }

  const isFinalized = selected && FINAL_COMPLAINT_STATUSES.includes(selected.status)

  const handleUpdate = async () => {
    if (!newStatus || !selected || isFinalized) return
    setSubmitting(true)
    try {
      await axios.patch(`/api/admin/complaints/${selected.id}/status`, {
        status: newStatus, admin_remarks: remarks,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setAlert({ type: 'success', title: 'Complaint updated', message: 'The complaint status has been updated successfully.' })
      setSelected(null)
      load()
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to update complaint. Please try again.'
      setAlert({ type: 'error', title: 'Update blocked', message })
    } finally {
      setSubmitting(false)
    }
  }

  const quickAction = async (id, status) => {
    try {
      await axios.patch(`/api/admin/complaints/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      load()
    } catch {}
  }

  return (
    <div>
      {/* Premium Gradient Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
        padding: '32px 40px',
        borderRadius: '16px',
        marginBottom: '24px',
        color: 'white',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>Manage Complaints</h1>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Review, approve, and resolve resident complaints.</p>
          </div>
        </div>
      </div>

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}

      {/* Filters (Elevated Card) */}
      <div className="card mb-3" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="card-body" style={{ padding: '18px 24px' }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>Status</label>
              <select className="form-control" style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }} value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>Date Filed</label>
              <input className="form-control" style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }} type="date" value={filter.date} onChange={e => setFilter(p => ({ ...p, date: e.target.value }))}/>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>Search</label>
              <input className="form-control" style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }} placeholder="Search by name or subject..." value={filter.search}
                onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
            </div>
            <div style={{ paddingBottom: 2 }}>
              <button className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: 700, padding: '10px 24px' }} onClick={load}><FiFilter/> Apply</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Resident</th><th>Category</th><th>Subject</th>
                  <th>Filed</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 30 }}>No complaints found.</td></tr>
                  : complaints.map((c, i) => {
                    if (!c) return null
                    return (
                      <tr key={c.id || i}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '.88rem' }}>{c.resident_name}</td>
                      <td style={{ fontSize: '.85rem' }}>{c.category_name}</td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.subject}
                        </div>
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>{formatDate(c.created_at)}</td>
                      <td><StatusBadge status={c.status}/></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openDetail(c)} title="View/Edit"><FiEye/></button>
                          {c.status === 'Pending' && <>
                            <button className="btn btn-success btn-sm" onClick={() => quickAction(c.id, 'Approved')} title="Approve"><FiCheck/></button>
                            <button className="btn btn-danger btn-sm" onClick={() => quickAction(c.id, 'Rejected')} title="Reject"><FiX/></button>
                          </>}
                          {c.status === 'Approved' && (
                            <button className="btn btn-sm" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }} onClick={() => quickAction(c.id, 'Resolved')} title="Resolve">
                              <FiCheckSquare/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        open={!!selected} onClose={() => setSelected(null)} title="Manage Complaint"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleUpdate}
              disabled={submitting || isFinalized}
            >
              {isFinalized ? 'Finalized' : submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {selected && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 4 }}>{selected.subject}</div>
                <div style={{ fontSize: '.88rem', color: 'var(--gray-500)' }}>{selected.resident_name} · {selected.category_name}</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px 14px', marginBottom: 18, fontSize: '.88rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Resident</span><span>{selected.resident_name}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Category</span><span>{selected.category_name}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Filed</span><span>{formatDate(selected.created_at)}</span>
            </div>
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 18, fontSize: '.88rem', color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>
              {selected.details}
            </div>
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--gray-50)', border: '1px solid var(--gray-150)', color: 'var(--gray-700)' }}>
              {isFinalized
                ? 'This complaint has been finalized and is locked from further status updates.'
                : 'You can update the status and remarks for this complaint.'}
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
                {(COMPLAINT_TRANSITIONS[selected.status] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Remarks</label>
              <textarea
                className="form-control"
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Add remarks for the resident..."
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
