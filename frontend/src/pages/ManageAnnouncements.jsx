// ── ManageAnnouncements.jsx ────────────────────────────────
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Modal, AlertMessage } from '../components/DashboardCard'
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

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
      <div className="page-header">
        <div><h1 className="page-title">Manage Announcements</h1><p className="page-subtitle">Post and manage barangay announcements.</p></div>
        <button className="btn btn-primary" onClick={openNew}><FiPlus/> New Announcement</button>
      </div>
      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {loading ? <div className="spinner-wrap"><div className="spinner"/></div>
          : announcements.length === 0 ? <div className="empty-state"><p>No announcements yet.</p></div>
          : announcements.map(a => (
            <div key={a.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ height: 3, background: a.priority === 'High' ? 'var(--danger)' : a.priority === 'Medium' ? 'var(--warning)' : 'var(--primary-500)' }}/>
              <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--gray-400)' }}>
                      {new Date(a.created_at).toLocaleString()} · {a.priority} Priority
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
