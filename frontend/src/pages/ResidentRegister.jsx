import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'

const INIT = {
  first_name: '', last_name: '', email: '',
  phone: '', address: '', password: '', password_confirmation: '',
}

export default function ResidentRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INIT)
  const [documents, setDocuments] = useState([])
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.first_name.trim()) e.first_name = 'First name is required.'
    if (!form.last_name.trim())  e.last_name  = 'Last name is required.'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.'
    if (!form.phone.trim()) e.phone = 'Phone number is required.'
    if (!form.address.trim()) e.address = 'Address is required.'
    if (form.password.length < 5) e.password = 'Password must be at least 5 characters.'
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Passwords do not match.'
    return e
  }

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleFileChange = e => {
    const files = Array.from(e.target.files || [])
    if (documents.length + files.length > 3) {
      setAlert({ type: 'error', message: 'Maximum 3 documents allowed.' })
      return
    }
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    const validFiles = files.filter(f => {
      if (!validTypes.includes(f.type)) {
        setAlert({ type: 'error', message: `Invalid file type: ${f.name}. Only JPG, PNG, PDF allowed.` })
        return false
      }
      if (f.size > 5 * 1024 * 1024) {
        setAlert({ type: 'error', message: `File too large: ${f.name}. Max 5MB.` })
        return false
      }
      return true
    })
    setDocuments(p => [...p, ...validFiles])
  }

  const removeDocument = index => {
    setDocuments(p => p.filter((_, i) => i !== index))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('first_name', form.first_name)
      formData.append('last_name', form.last_name)
      formData.append('email', form.email)
      formData.append('phone', form.phone)
      formData.append('address', form.address)
      formData.append('password', form.password)
      documents.forEach((doc, idx) => {
        formData.append('documents', doc)
      })

      const res = await axios.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setAlert({ type: 'success', message: res.data.message })
      localStorage.setItem('verification_email', form.email)
      setTimeout(() => navigate('/verify-otp'), 1500)
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setAlert({ type: 'error', message: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--primary-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--primary-600)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path d="M16 4L4 11v2h24v-2L16 4zM6 14v10h4V14H6zm8 0v10h4V14h-4zm8 0v10h4V14h-4zM4 26h24v2H4v-2z" fill="white"/>
              </svg>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '.9rem' }}>Register to access barangay services</p>
        </div>

        <div className="card">
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Juan"/>
                  {errors.first_name && <div className="form-error">{errors.first_name}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Dela Cruz"/>
                  {errors.last_name && <div className="form-error">{errors.last_name}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="juan@email.com"/>
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="09XXXXXXXXX"/>
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Home Address *</label>
                <textarea className="form-control" name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House No., Street, Barangay..."/>
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-control" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 5 characters"/>
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input className="form-control" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Repeat password"/>
                  {errors.password_confirmation && <div className="form-error">{errors.password_confirmation}</div>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Verification Documents (Proof of Residency)</label>
                <div style={{
                  border: '2px dashed var(--primary-300)', borderRadius: 8, padding: 24,
                  textAlign: 'center', cursor: 'pointer', background: 'var(--primary-50)',
                  transition: 'all 0.2s'
                }} 
                onDragOver={e => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = 'var(--primary-600)'
                  e.currentTarget.style.background = 'var(--primary-100)'
                }}
                onDragLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--primary-300)'
                  e.currentTarget.style.background = 'var(--primary-50)'
                }}
                onDrop={e => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = 'var(--primary-300)'
                  e.currentTarget.style.background = 'var(--primary-50)'
                  handleFileChange({ target: { files: e.dataTransfer.files } })
                }}>
                  <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: 'none' }} id="file-input"/>
                  <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Drag files here or click to browse</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>JPG, PNG, PDF • Max 5MB each • Up to 3 files</div>
                  </label>
                </div>
                {documents.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    {documents.map((doc, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: 12, background: 'var(--gray-50)', borderRadius: 6, marginBottom: 8
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>📎</span>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{doc.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <button type="button" onClick={() => removeDocument(idx)} style={{
                          background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 18
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary w-full mt-2" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center mt-3 text-sm text-muted">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
