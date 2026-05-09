import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { StatusBadge, Modal, AlertMessage } from '../components/DashboardCard'
import { FiEye, FiFilter, FiCheck, FiX, FiCalendar, FiCheckSquare } from 'react-icons/fi'

const STATUS_OPTS = ['', 'Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected']

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
    setNewStatus(c.status)
  }

  const handleUpdate = async () => {
    if (!newStatus) return
    setSubmitting(true)
    try {
      await axios.patch(`/api/admin/complaints/${selected.id}/status`, {
        status: newStatus, admin_remarks: remarks,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setAlert({ type: 'success', message: 'Complaint updated successfully.' })
      setSelected(null)
      load()
    } catch {
      setAlert({ type: 'error', message: 'Update failed.' })
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Complaints</h1>
          <p className="page-subtitle">Review, approve, and resolve resident complaints.</p>
        </div>
      </div>

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body" style={{ padding: '14px 24px' }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date Filed</label>
              <input className="form-control" type="date" value={filter.date} onChange={e => setFilter(p => ({ ...p, date: e.target.value }))}/>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Search</label>
              <input className="form-control" placeholder="Search by name or subject..." value={filter.search}
                onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
            </div>
            <div style={{ paddingBottom: 2 }}>
              <button className="btn btn-primary" onClick={load}><FiFilter/> Apply</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
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
                  : complaints.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '.88rem' }}>{c.resident_name}</td>
                      <td style={{ fontSize: '.85rem' }}>{c.category_name}</td>
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ fontWeight: 600, fontFamily: 'var(--font-heading)', fontSize: '.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.subject}
                        </div>
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--gray-500)' }}>{new Date(c.created_at).toLocaleDateString()}</td>
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
                  ))}
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
            <button className="btn btn-primary" onClick={handleUpdate} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px 14px', marginBottom: 18, fontSize: '.88rem' }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Resident</span><span>{selected.resident_name}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Category</span><span>{selected.category_name}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Filed</span><span>{new Date(selected.created_at).toLocaleString()}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 4 }}>{selected.subject}</div>
            <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 18, fontSize: '.88rem', color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>
              {selected.details}
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {STATUS_OPTS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Remarks</label>
              <textarea className="form-control" rows={3} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Add remarks for the resident..."/>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
