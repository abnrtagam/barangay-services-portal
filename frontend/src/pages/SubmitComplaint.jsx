import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'
import { FiUpload, FiX, FiSend } from 'react-icons/fi'

const INIT = { category_id: '', subject: '', details: '' }

export default function SubmitComplaint() {
  const navigate = useNavigate()
  const [form, setForm]       = useState(INIT)
  const [file, setFile]       = useState(null)
  const [categories, setCategories] = useState([])
  const [errors, setErrors]   = useState({})
  const [alert, setAlert]     = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('resident_token')
    axios.get('/api/complaints/categories', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCategories(r.data))
      .catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!form.category_id) e.category_id = 'Please select a category.'
    if (!form.subject.trim() || form.subject.length < 5) e.subject = 'Subject must be at least 5 characters.'
    if (!form.details.trim() || form.details.length < 20) e.details = 'Details must be at least 20 characters.'
    return e
  }

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleFile = e => {
    const f = e.target.files[0]
    if (f && f.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', message: 'File must be under 5MB.' }); return
    }
    setFile(f)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    setLoading(true)
    try {
      const token = localStorage.getItem('resident_token')
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (file) fd.append('attachment', file)
      await axios.post('/api/complaints', fd, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAlert({ type: 'success', message: 'Complaint submitted successfully!' })
      setTimeout(() => navigate('/resident/complaints/history'), 1800)
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Submission failed.' })
    } finally {
      setLoading(false)
    }
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: 'white' }}>File a Complaint</h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', letterSpacing: '0.02em' }}>Submit your complaint and we'll address it promptly.</p>
        </div>
      </div>

      <div style={{ maxWidth: 680 }}>
        <div className="card" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <div className="card-header">
            <span className="card-title">Complaint Details</span>
            <span style={{ fontSize: '.8rem', color: 'var(--gray-400)' }}>* Required fields</span>
          </div>
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Complaint Category *</label>
                <select className="form-control" name="category_id" value={form.category_id} onChange={handleChange}>
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.category_id && <div className="form-error">{errors.category_id}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Complaint Subject *</label>
                <input
                  className="form-control"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Brief description of your complaint"
                  maxLength={150}
                />
                <div style={{ fontSize: '.75rem', color: 'var(--gray-400)', textAlign: 'right', marginTop: 4 }}>
                  {form.subject.length}/150
                </div>
                {errors.subject && <div className="form-error">{errors.subject}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Complaint Details *</label>
                <textarea
                  className="form-control"
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Please provide a detailed description of your complaint, including relevant dates, locations, and any involved parties..."
                />
                {errors.details && <div className="form-error">{errors.details}</div>}
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">Supporting Document / Photo (optional)</label>
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 10, padding: '28px 20px',
                  border: '2px dashed var(--primary-200)', borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-50)', cursor: 'pointer',
                  transition: 'var(--transition)',
                }}>
                  <FiUpload size={28} color="var(--primary-400)" />
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, color: 'var(--primary-600)', fontSize: '.9rem' }}>
                    {file ? file.name : 'Click to upload file'}
                  </span>
                  <span style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>
                    JPG, PNG, PDF, DOCX (maximum 5MB)
                  </span>
                  <input type="file" hidden accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={handleFile}/>
                </label>
                {file && (
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      marginTop: 8, background: 'none', border: 'none',
                      color: 'var(--danger)', cursor: 'pointer', fontSize: '.82rem',
                      fontFamily: 'var(--font-heading)', fontWeight: 600,
                    }}
                  >
                    <FiX size={14}/> Remove file
                  </button>
                )}
              </div>

              {/* Notice */}
              <div style={{
                background: 'var(--primary-50)', border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px',
                fontSize: '.84rem', color: 'var(--primary-800)', marginBottom: 20,
                lineHeight: 1.6,
              }}>
                <strong>Note:</strong> Your complaint will be reviewed by barangay officials.
                You will be notified of any status updates. Please ensure all information is accurate.
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                  <FiSend /> {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}