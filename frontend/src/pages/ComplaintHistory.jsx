import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { StatusBadge, Modal } from '../components/DashboardCard'
import StatusTimeline from '../components/StatusTimeline'
import { FiEye, FiPlus, FiFilter } from 'react-icons/fi'
import { formatDate } from '../utils/date'

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [filter, setFilter]         = useState({ status: '', search: '' })

  const token = localStorage.getItem('resident_token')

  const load = () => {
    setLoading(true)
    const params = {}
    if (filter.status) params.status = filter.status
    if (filter.search) params.search = filter.search
    axios.get('/api/residents/complaints', { headers: { Authorization: `Bearer ${token}` }, params })
      .then(r => setComplaints(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter.status])

  const loadComplaintDetail = async (id) => {
    try {
      const res = await axios.get(`/api/residents/complaints/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelected(res.data)
    } catch (err) {
      console.error('Failed to load complaint details:', err)
    }
  }

  const STATUS_OPTS = ['', 'Pending', 'Approved', 'Scheduled', 'Resolved', 'Rejected']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Complaint History</h1>
          <p className="page-subtitle">Track all your filed complaints and their status.</p>
        </div>
        <Link to="/resident/complaints/submit" className="btn btn-primary">
          <FiPlus /> New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="card-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <div className="filter-bar">
            <div className="form-group">
              <label className="form-label">Filter by Status</label>
              <select className="form-control" value={filter.status} onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Search</label>
              <input className="form-control" placeholder="Search by subject..." value={filter.search}
                onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && load()}
              />
            </div>
            <div style={{ paddingBottom: 2 }}>
              <button className="btn btn-secondary" onClick={load}><FiFilter /> Filter</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner"/></div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found.</p>
            <Link to="/resident/complaints/submit" className="btn btn-primary mt-2">File Your First Complaint</Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Date Filed</th>
                  <th>Status</th>
                  <th>Remarks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: '.8rem' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{c.subject}</td>
                    <td>{c.category_name}</td>
                    <td>{formatDate(c.created_at, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td><StatusBadge status={c.status}/></td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '.85rem', maxWidth: 180 }}>
                      {c.admin_remarks || <span style={{ color: 'var(--gray-300)' }}>—</span>}
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => loadComplaintDetail(c.id)}>
                        <FiEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Complaint Details"
        footer={<button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>}
      >
        {selected && (
          <div style={{ fontSize: '.9rem', lineHeight: 1.8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', marginBottom: 16 }}>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Status</span>
              <span><StatusBadge status={selected.status}/></span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Category</span>
              <span>{selected.category_name}</span>
              <span style={{ color: 'var(--gray-500)', fontWeight: 600 }}>Filed</span>
              <span>{formatDate(selected.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 4 }}>{selected.subject}</div>
            <div style={{ color: 'var(--gray-600)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>{selected.details}</div>
            {selected.admin_remarks && (
              <div style={{
                background: 'var(--primary-50)', border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px',
              }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '.85rem', color: 'var(--primary-700)', marginBottom: 4 }}>
                  Admin Remarks
                </div>
                <div style={{ color: 'var(--gray-700)', fontSize: '.9rem' }}>{selected.admin_remarks}</div>
              </div>
            )}
            {selected.attachment_path && (
              <div style={{ marginTop: 14 }}>
                <a
                  href={`http://localhost:5000/uploads/${selected.attachment_path}`}
                  target="_blank" rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  View Attachment
                </a>
              </div>
            )}
            {selected.history && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-200)' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 16 }}>
                  Status History
                </div>
                <StatusTimeline history={selected.history} type="complaint" />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
