import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiLock, 
  FiArrowRight, FiUploadCloud, FiFileText, FiX, FiCheckCircle, FiShield 
} from 'react-icons/fi'

export default function ResidentRegister() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [documents, setDocuments] = useState([])
  const [form, setForm] = useState({
    first_name: '', last_name: '', dob: '', 
    email: '', phone: '', address: '', zone: '',
    gov_id_type: '', gov_id_number: '',
    password: '', password_confirmation: ''
  })


  const [errors, setErrors] = useState({})

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleFileChange = e => {
    const files = Array.from(e.target.files)
    setDocuments(prev => [...prev, ...files])
  }

  const removeDocument = index => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const formData = new FormData()
    Object.keys(form).forEach(key => formData.append(key, form[key]))
    documents.forEach(doc => formData.append('documents', doc))

    try {
      await axios.post('/api/auth/register', formData)
      setAlert({ type: 'success', message: 'Registration successful! Please check your email for the OTP.' })
      localStorage.setItem('verification_email', form.email)
      setTimeout(() => navigate('/verify-otp'), 2000)
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setAlert({ type: 'error', message: err.response?.data?.message || 'Registration failed.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'white' }}>
      {/* Left Side: Branding */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
        color: 'white',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }} className="auth-sidebar">
        <div style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ 
            width: 90, height: 90,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 32px'
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', background: 'transparent' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '3rem', marginBottom: 20, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            Join the Community
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', lineHeight: 1.6, fontWeight: 500 }}>
            Access efficient barangay services and stay connected. Please note that this portal is <strong>exclusively for residents of Barangay Bulua</strong>.
          </p>

          <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiCheckCircle size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Fast Processing</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Your requests are handled with priority and efficiency.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiShield size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Secure & Private</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Your data is protected with industry-standard security.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div style={{ flex: 1, padding: '60px 40px', overflowY: 'auto', background: 'white' }}>
        <div style={{ maxWidth: '580px', margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8, letterSpacing: '-0.02em' }}>Create Account</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '1.1rem' }}>Enter your details to register as a resident.</p>
          </div>

          {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

          <form onSubmit={handleSubmit}>
            <div style={{ borderLeft: '4px solid var(--primary-600)', paddingLeft: 16, marginBottom: 32 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Personal Information</h3>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <div style={{ position: 'relative' }}>
                  <FiUser style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                  <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} placeholder="Juan" style={{ paddingLeft: 40, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', fontSize: '0.9rem' }}/>
                </div>
                {errors.first_name && <div className="form-error">{errors.first_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <div style={{ position: 'relative' }}>
                  <FiUser style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                  <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Dela Cruz" style={{ paddingLeft: 40, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', fontSize: '0.9rem' }}/>
                </div>
                {errors.last_name && <div className="form-error">{errors.last_name}</div>}
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Date of Birth *</label>
                <input type="date" className="form-control" name="dob" value={form.dob} onChange={handleChange} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', paddingLeft: '14px', paddingRight: '14px', fontSize: '0.9rem' }}/>
                {errors.dob && <div className="form-error">{errors.dob}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Government ID Type *</label>
                <select className="form-select" name="gov_id_type" value={form.gov_id_type} onChange={handleChange} style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', paddingLeft: '14px', paddingRight: '40px', fontSize: '0.9rem' }}>


                  <option value="">Select ID Type</option>
                  <option value="SSS">SSS</option>
                  <option value="UMID">UMID</option>
                  <option value="Driver's License">Driver's License</option>
                  <option value="Passport">Passport</option>
                  <option value="PhilHealth">PhilHealth</option>
                  <option value="National ID">National ID</option>
                </select>
                {errors.gov_id_type && <div className="form-error">{errors.gov_id_type}</div>}
              </div>
            </div>


            <div className="form-group">
              <label className="form-label">Government ID Number *</label>
              <div style={{ position: 'relative' }}>
                <FiShield style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                <input className="form-control" name="gov_id_number" value={form.gov_id_number} onChange={handleChange} placeholder="ID Number" style={{ paddingLeft: 44, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', fontSize: '0.9rem' }}/>
              </div>
              {errors.gov_id_number && <div className="form-error">{errors.gov_id_number}</div>}
            </div>


            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="juan@email.com" style={{ paddingLeft: 40, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', fontSize: '0.9rem' }}/>
              </div>
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="09XXXXXXXXX" style={{ paddingLeft: 40, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', fontSize: '0.9rem' }}/>
              </div>
              {errors.phone && <div className="form-error">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Home Address *</label>
              <div style={{ position: 'relative' }}>
                <FiMapPin style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                <textarea className="form-control" name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House No., Street, Barangay..." style={{ paddingLeft: 40, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12 }}/>
              </div>
              {errors.address && <div className="form-error">{errors.address}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Barangay Zone *</label>
              <div style={{ position: 'relative' }}>
                <select 
                  className="form-select" 
                  name="zone" 
                  value={form.zone} 
                  onChange={handleChange} 
                  style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', paddingLeft: '14px', paddingRight: '40px', fontSize: '0.9rem' }}



                >
                  <option value="">Select your Zone</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={`Zone ${i+1}`}>Zone {i+1}</option>
                  ))}
                </select>
              </div>
              {errors.zone && <div className="form-error">{errors.zone}</div>}
            </div>


            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                  <input className="form-control" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" style={{ paddingLeft: 40, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', fontSize: '0.9rem' }}/>
                </div>
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', left: 14, top: 13, color: 'var(--gray-400)' }} />
                  <input className="form-control" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="••••••••" style={{ paddingLeft: 40, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 12, height: '42px', fontSize: '0.9rem' }}/>
                </div>
                {errors.password_confirmation && <div className="form-error">{errors.password_confirmation}</div>}
              </div>
            </div>

            <div style={{ borderLeft: '4px solid var(--primary-600)', paddingLeft: 16, marginTop: 40, marginBottom: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gray-900)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Proof of Residency</h3>
            </div>

            <div className="form-group">
              <div style={{
                border: '2px dashed var(--gray-200)', borderRadius: 16, padding: '32px',
                textAlign: 'center', cursor: 'pointer', background: 'var(--gray-50)',
                transition: 'all 0.2s', position: 'relative'
              }} 
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary-500)'; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
              onDrop={e => { e.preventDefault(); handleFileChange({ target: { files: e.dataTransfer.files } }); }}>
                <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} style={{ display: 'none' }} id="file-input"/>
                <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                  <FiUploadCloud size={32} style={{ color: 'var(--primary-600)', marginBottom: 12 }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>Drop documents or click to upload</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: 4 }}>JPG, PNG, PDF up to 5MB</div>
                </label>
              </div>

              {documents.length > 0 && (
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {documents.map((doc, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      background: 'white', border: '1px solid var(--gray-200)', borderRadius: 12
                    }}>
                      <FiFileText style={{ color: 'var(--primary-600)' }} />
                      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>{doc.name}</div>
                      <button type="button" onClick={() => removeDocument(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)' }}>
                        <FiX size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn-primary w-full" disabled={loading} style={{
              padding: '16px', borderRadius: 12, fontSize: '1rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', border: 'none',
              boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', marginTop: 24
            }}>
              {loading ? 'Processing...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  Create Account <FiArrowRight />
                </span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 30, borderTop: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: '1rem', color: 'var(--gray-500)' }}>
              Already have an account? {' '}
              <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 800, textDecoration: 'none' }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
