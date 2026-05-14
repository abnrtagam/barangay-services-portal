import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'

export default function ResidentLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setAlert({ type: 'error', message: 'Email and password are required.' }); return
    }
    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/login', form)
      localStorage.setItem('resident_token', data.token)
      localStorage.setItem('resident_user', JSON.stringify(data.user))
      navigate('/resident/dashboard')
    } catch (err) {
      const errorData = err.response?.data
      const status = errorData?.status
      
      // Handle different account statuses
      if (status === 'pending') {
        setAlert({ 
          type: 'warning', 
          message: 'Your account is pending admin verification. You will receive an email once approved.' 
        })
      } else if (status === 'rejected') {
        setAlert({ 
          type: 'error', 
          message: 'Your account was rejected. Please contact the barangay office for more information.' 
        })
      } else if (status === 'suspended') {
        setAlert({ 
          type: 'error', 
          message: 'Your account has been suspended. Please contact the barangay office.' 
        })
      } else if (errorData?.requiresOTP) {
        setAlert({ 
          type: 'warning', 
          message: 'Please verify your email first. You will be redirected to verify your OTP.' 
        })
        localStorage.setItem('verification_email', form.email)
        setTimeout(() => navigate('/verify-otp'), 2000)
      } else {
        setAlert({ type: 'error', message: errorData?.message || 'Invalid credentials.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--primary-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: 'var(--primary-600)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 4L4 11v2h24v-2L16 4zM6 14v10h4V14H6zm8 0v10h4V14h-4zm8 0v10h4V14h-4zM4 26h24v2H4v-2z" fill="white"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6 }}>Welcome Back</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '.9rem' }}>Sign in to your resident account</p>
        </div>

        <div className="card">
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" name="email" type="email" value={form.email} onChange={handleChange} placeholder="juan@email.com" autoFocus/>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-control" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••"/>
              </div>
              <div style={{ textAlign: 'right', marginBottom: 16 }}>
                <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--primary-600)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <button className="btn btn-primary w-full mt-2" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="text-center mt-3 text-sm text-muted">
              No account yet? <Link to="/register">Register here</Link>
            </p>
            <p className="text-center text-sm text-muted">
              <Link to="/admin/login" style={{ color: 'var(--gray-400)' }}>Admin Login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
