import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { DashboardCard, AlertMessage } from '../components/DashboardCard'
import { FiCheck, FiX, FiEye, FiClock, FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiRefreshCw } from 'react-icons/fi'
import { formatDate } from '../utils/date'

export default function AccountVerifications() {
  const [accounts, setAccounts] = useState([])
  const [reactivationRequests, setReactivationRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [notes, setNotes] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewingImage, setViewingImage] = useState(null)

  const token = localStorage.getItem('admin_token')
  const API_BASE = 'http://localhost:5000'

  const isNotesValid = notes.trim().length >= 10

  useEffect(() => {
    fetchStats()
    fetchAccounts()
    fetchReactivationRequests()
  }, [filter, search])

  const closeModal = () => {
    setShowModal(false)
    setSelectedAccount(null)
    setNotes('')
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/verifications/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter && filter !== 'all') params.append('status', filter)
      if (search) params.append('search', search)

      const res = await axios.get(`/api/admin/verifications?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAccounts(res.data.data)
    } catch (err) {
      console.error('Failed to fetch accounts:', err)
      setAlert({ type: 'error', message: 'Failed to load accounts' })
    } finally {
      setLoading(false)
    }
  }

  const fetchReactivationRequests = async () => {
    try {
      const res = await axios.get('/api/admin/verifications/reactivation-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReactivationRequests(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch reactivation requests:', err)
    }
  }

  const refreshData = async () => {
    await Promise.all([fetchAccounts(), fetchStats(), fetchReactivationRequests()])
  }

  const viewDetails = async (id) => {
    try {
      const res = await axios.get(`/api/admin/verifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedAccount(res.data.account)
      setNotes('')
      setShowModal(true)
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to load account details' })
    }
  }

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this account? The resident will be notified via email.')) return

    setActionLoading(true)
    try {
      const res = await axios.post(`/api/admin/verifications/${id}/approve`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAlert({ type: 'success', message: res.data.message })
      setShowModal(false)
      setSelectedAccount(prev => prev ? { ...prev, status: 'approved' } : prev)
      setNotes('')
      await refreshData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to approve account' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id) => {
    if (!notes.trim() || notes.length < 10) {
      setAlert({ type: 'error', message: 'Please provide a reason for rejection (minimum 10 characters)' })
      return
    }

    if (!window.confirm('Reject this account? The resident will be notified via email.')) return

    setActionLoading(true)
    try {
      const res = await axios.post(`/api/admin/verifications/${id}/reject`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAlert({ type: 'success', message: res.data.message })
      setShowModal(false)
      setSelectedAccount(prev => prev ? { ...prev, status: 'rejected' } : prev)
      setNotes('')
      await refreshData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reject account' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspend = async (id) => {
    if (!notes.trim() || notes.length < 10) {
      setAlert({ type: 'error', message: 'Please provide a reason for suspension (minimum 10 characters)' })
      return
    }

    if (!window.confirm('Suspend this account?')) return

    setActionLoading(true)
    try {
      const res = await axios.post(`/api/admin/verifications/${id}/suspend`, 
        { notes },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAlert({ type: 'success', message: res.data.message })
      setShowModal(false)
      setSelectedAccount(prev => prev ? { ...prev, status: 'suspended' } : prev)
      setNotes('')
      await refreshData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to suspend account' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivate = async (userId) => {
    if (!window.confirm('Reactivate this account?')) return

    setActionLoading(true)
    try {
      const res = await axios.post(`/api/admin/verifications/${userId}/reactivate`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAlert({ type: 'success', message: res.data.message })
      setShowModal(false)
      setSelectedAccount(prev => prev ? { ...prev, status: 'approved' } : prev)
      await refreshData()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to reactivate account' })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'var(--amber-100)', color: 'var(--amber-700)', icon: FiClock },
      approved: { bg: 'var(--green-100)', color: 'var(--green-700)', icon: FiCheck },
      rejected: { bg: 'var(--red-100)', color: 'var(--red-700)', icon: FiX },
      suspended: { bg: 'var(--gray-100)', color: 'var(--gray-700)', icon: FiX },
    }
    const s = styles[status] || styles.pending
    const Icon = s.icon

    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: '0.8rem',
        fontWeight: '600',
        background: s.bg,
        color: s.color,
      }}>
        <Icon size={14} /> {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const viewDocument = (filename) => {
    // FIXED: Properly construct the file URL to backend uploads directory
    const imageUrl = `${API_BASE}/uploads/${filename}`
    setViewingImage(imageUrl)
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
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>Account Verifications</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Review and manage resident account registrations.</p>
        </div>
      </div>

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Statistics Row (Elevated Cards) */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <DashboardCard title="Pending" value={stats.pending} icon={<FiClock/>} color="warning" />
          <DashboardCard title="Approved" value={stats.approved} icon={<FiCheck/>} color="green" />
          <DashboardCard title="Rejected" value={stats.rejected} icon={<FiX/>} color="red" />
          <DashboardCard title="Total Accounts" value={stats.total} icon={<FiUser/>} color="blue" />
        </div>
      )}

      {/* Reactivation Requests (Elevated Card) */}
      {reactivationRequests.length > 0 && (
        <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)', marginBottom: 24, background: 'var(--amber-50)', overflow: 'hidden' }}>
          <div className="card-body" style={{ padding: '24px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <FiRefreshCw size={20} style={{ color: 'var(--amber-700)' }} />
              <span style={{ color: 'var(--amber-900)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Pending Reactivation Requests ({reactivationRequests.length})</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reactivationRequests.map(req => (
                <div key={req.id} style={{
                  background: 'white',
                  padding: 16,
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', color: 'var(--gray-800)', fontFamily: 'var(--font-heading)' }}>
                      {req.first_name} {req.last_name} ({req.email})
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                      <strong>Reason:</strong> {req.reason}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                      Requested: {formatDate(req.requested_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    className="btn btn-success"
                    style={{ borderRadius: '8px', fontWeight: 700 }}
                    onClick={() => handleReactivate(req.user_id)}
                    disabled={actionLoading}
                  >
                    <FiCheck size={16} /> Reactivate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters (Elevated Card) */}
      <div className="card mb-3" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div className="card-body" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--gray-600)', fontSize: '.75rem', textTransform: 'uppercase' }}>Search Residents</label>
              <input
                type="text"
                className="form-control"
                style={{ borderRadius: '8px', border: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'pending', 'approved', 'rejected', 'suspended'].map(status => (
                <button
                  key={status}
                  className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFilter(status)}
                  style={{ textTransform: 'capitalize', borderRadius: '8px', fontWeight: 600, fontSize: '.85rem', padding: '10px 16px' }}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Accounts List (Elevated Card) */}
      <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <div className="card-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner"></div>
              <p style={{ marginTop: 16, color: 'var(--gray-500)' }}>Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <FiUser size={48} style={{ color: 'var(--gray-300)', marginBottom: 16 }} />
              <p style={{ color: 'var(--gray-500)' }}>No accounts found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Email Status</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account, idx) => {
                    if (!account) return null
                    return (
                      <tr key={account.id || idx}>
                      <td style={{ fontWeight: '500' }}>
                        {account.first_name} {account.last_name}
                      </td>
                      <td>{account.email}</td>
                      <td>{account.phone}</td>
                      <td>{formatDate(account.created_at)}</td>
                      <td>
                        {account.email_verified ? (
                          <span style={{ color: 'var(--green-600)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <FiCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span style={{ color: 'var(--amber-600)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <FiClock size={14} /> Pending
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(account.status)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => viewDetails(account.id)}
                        >
                          <FiEye size={16} /> View
                        </button>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Account Details Modal */}
      {showModal && selectedAccount && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h2>Account Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Personal Information */}
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 16, color: 'var(--gray-700)' }}>
                  Personal Information
                </h3>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FiUser size={16} style={{ color: 'var(--gray-500)' }} />
                      <strong style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Name:</strong>
                    </div>
                    <p style={{ margin: 0, paddingLeft: 24 }}>
                      {selectedAccount.first_name} {selectedAccount.last_name}
                    </p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FiMail size={16} style={{ color: 'var(--gray-500)' }} />
                      <strong style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Email:</strong>
                    </div>
                    <p style={{ margin: 0, paddingLeft: 24 }}>{selectedAccount.email}</p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FiPhone size={16} style={{ color: 'var(--gray-500)' }} />
                      <strong style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Phone:</strong>
                    </div>
                    <p style={{ margin: 0, paddingLeft: 24 }}>{selectedAccount.phone}</p>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FiClock size={16} style={{ color: 'var(--gray-500)' }} />
                      <strong style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Registered:</strong>
                    </div>
                    <p style={{ margin: 0, paddingLeft: 24 }}>
                      {formatDate(selectedAccount.created_at)}
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <FiMapPin size={16} style={{ color: 'var(--gray-500)' }} />
                    <strong style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>Address:</strong>
                  </div>
                  <p style={{ margin: 0, paddingLeft: 24 }}>{selectedAccount.address}</p>
                </div>
              </div>

              {/* Verification Documents - FIXED */}
              {selectedAccount.verification_documents && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: 16, color: 'var(--gray-700)' }}>
                    <FiFileText size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Verification Documents
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                    {(() => {
                      try {
                        const docs = typeof selectedAccount.verification_documents === 'string' 
                          ? JSON.parse(selectedAccount.verification_documents) 
                          : selectedAccount.verification_documents
                        return Array.isArray(docs) ? docs : []
                      } catch {
                        return []
                      }
                    })().map((filename, idx) => (
                      <button
                        key={idx}
                        onClick={() => viewDocument(filename)}
                        className="btn btn-sm btn-primary"
                        style={{ textDecoration: 'none' }}
                      >
                        <FiFileText size={14} style={{ marginRight: 6 }} />
                        View Document {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Info */}
              <div style={{ marginBottom: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-600)' }}>Account Status</p>
                    <div style={{ marginTop: 8 }}>{getStatusBadge(selectedAccount.status)}</div>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gray-600)' }}>Email Verification</p>
                    <p style={{ margin: '8px 0 0', fontWeight: '600' }}>
                      {selectedAccount.email_verified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Notes */}
              {(selectedAccount.status === 'pending' || selectedAccount.status === 'approved') && (
                <div style={{ marginBottom: 20 }}>
                  <label className="form-label">
                    Admin Notes (required for rejection or suspension)
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this decision..."
                  />
                  <small style={{ color: isNotesValid ? 'var(--green-700)' : 'var(--red-600)', display: 'block', marginTop: 8 }}>
                    Minimum 10 characters required for rejection or suspension.
                  </small>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {selectedAccount.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => handleApprove(selectedAccount.id)}
                      disabled={actionLoading}
                    >
                      <FiCheck size={18} /> {actionLoading ? 'Processing...' : 'Approve Account'}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleReject(selectedAccount.id)}
                      disabled={actionLoading || !isNotesValid}
                    >
                      <FiX size={18} /> {actionLoading ? 'Processing...' : 'Reject Account'}
                    </button>
                  </>
                )}
                {selectedAccount.status === 'approved' && (
                  <button
                    className="btn btn-warning"
                    onClick={() => handleSuspend(selectedAccount.id)}
                    disabled={actionLoading || !isNotesValid}
                  >
                    <FiX size={18} /> {actionLoading ? 'Processing...' : 'Suspend Account'}
                  </button>
                )}
                {selectedAccount.status === 'suspended' && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleReactivate(selectedAccount.id)}
                    disabled={actionLoading}
                  >
                    <FiCheck size={18} /> {actionLoading ? 'Processing...' : 'Reactivate Account'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal - FIXED */}
      {viewingImage && (
        <div className="modal-overlay" onClick={() => setViewingImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-header">
              <h2>Document Preview</h2>
              <button className="modal-close" onClick={() => setViewingImage(null)}>×</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <img 
                src={viewingImage} 
                alt="Verification Document" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '70vh',
                  borderRadius: 8,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextElementSibling.style.display = 'block'
                }}
              />
              <div style={{ display: 'none', padding: 40, color: 'var(--red-600)' }}>
                <FiX size={48} style={{ marginBottom: 16 }} />
                <p>Could not load image. The file may not exist or the path is incorrect.</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>URL: {viewingImage}</p>
              </div>
              <div style={{ marginTop: 16 }}>
                <a 
                  href={viewingImage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}