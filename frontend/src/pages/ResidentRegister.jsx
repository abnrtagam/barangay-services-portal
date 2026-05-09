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
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (form.password !== form.password_confirmation) e.password_confirmation = 'Passwords do not match.'
    return e
  }

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) { setErrors(v); return }
    setLoading(true)
    try {
      await axios.post('/api/auth/register', form)
      setAlert({ type: 'success', message: 'Registration successful! Please log in.' })
      setTimeout(() => navigate('/login'), 1800)
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
                  <input className="form-control" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters"/>
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input className="form-control" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Repeat password"/>
                  {errors.password_confirmation && <div className="form-error">{errors.password_confirmation}</div>}
                </div>
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
