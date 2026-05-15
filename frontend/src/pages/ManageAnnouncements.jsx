// ── ManageAnnouncements.jsx ────────────────────────────────
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Modal, AlertMessage } from '../components/DashboardCard'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { formatDate } from '../utils/date'

const INIT_FORM = { title: '', content: '', priority: 'Normal' }

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]             = useState(true)
  const [showForm, setShowForm]           = useState(false)
  const [form, setForm]                   = useState(INIT_FORM)
  const [editId, setEditId]               = useState(null)
  const [alert, setAlert]                 = useState(null)
  const [submitting, setSubmitting]       = useState(false)
  const token = localStorage.getItem('admin_token')

  const load = () => {
    setLoading(true)
    axios.get('/api/announcements', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setAnnouncements(r.data.data || []))
      .catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew  = ()  => { setForm(INIT_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (a) => { setForm({ title: a.title, content: a.content, priority: a.priority }); setEditId(a.id); setShowForm(true) }

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setAlert({ type: 'error', message: 'Title and content are required.' }); return
    }
    setSubmitting(true)
    try {
      if (editId) {
        await axios.put(`/api/admin/announcements/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } })
      } else {
        await axios.post('/api/admin/announcements', form, { headers: { Authorization: `Bearer ${token}` } })
      }
      setAlert({ type: 'success', message: editId ? 'Announcement updated.' : 'Announcement posted.' })
      setShowForm(false); load()
    } catch { setAlert({ type: 'error', message: 'Failed to save.' })
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    await axios.delete(`/api/admin/announcements/${id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
    load()
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: '#ffffff' }}>Manage Announcements</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Post and manage barangay announcements.</p>
        </div>
        <button className="btn btn-primary" style={{ borderRadius: '8px', fontWeight: 700, padding: '12px 24px', background: 'white', color: 'var(--primary-700)', border: 'none' }} onClick={openNew}>
          <FiPlus/> New Announcement
        </button>
      </div>
      
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? <div className="spinner-wrap"><div className="spinner"/></div>
          : announcements.length === 0 ? <div className="empty-state"><p>No announcements yet.</p></div>
          : announcements.map(a => (
            <div key={a.id} className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
              <div style={{ height: 3, background: a.priority === 'High' ? 'var(--danger)' : a.priority === 'Medium' ? 'var(--warning)' : 'var(--primary-500)' }}/>
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gray-400)' }}>
                      {formatDate(a.created_at)} · {a.priority} Priority
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{a.title}</div>
                  <div style={{ color: 'var(--gray-600)', fontSize: '.88rem', lineHeight: 1.65 }}>{a.content}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(a)}><FiEdit2/></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}><FiTrash2/></button>
                </div>
              </div>
            </div>
          ))}
      </div>
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Announcement' : 'New Announcement'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Post'}</button></>}
      >
        <div className="form-group"><label className="form-label">Title *</label>
          <input className="form-control" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title..."/>
        </div>
        <div className="form-group"><label className="form-label">Priority</label>
          <select className="form-control" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
            <option>Normal</option><option>Medium</option><option>High</option>
          </select>
        </div>
        <div className="form-group"><label className="form-label">Content *</label>
          <textarea className="form-control" rows={6} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write the announcement content..."/>
        </div>
      </Modal>
    </div>
  )
}
