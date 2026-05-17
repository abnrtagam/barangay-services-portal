import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'
import { 
  FiMail, FiLock, FiArrowRight, FiShield, FiUser, FiCheckCircle 
} from 'react-icons/fi'

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
            Welcome Back
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.25rem', lineHeight: 1.6, fontWeight: 500 }}>
            Sign in to access your barangay services, track your requests, and stay connected.
          </p>

          <div style={{ marginTop: 60, display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiShield size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Secure Access</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Your account is protected with multi-layer security.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FiUser size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Personal Dashboard</div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Manage all your barangay transactions in one place.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div style={{ flex: 1, padding: '60px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
        <div style={{ maxWidth: '420px', width: '100%' }}>
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: 8, letterSpacing: '-0.02em' }}>Sign In</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '1.1rem' }}>Welcome back! Please enter your details.</p>
          </div>

          {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 16, top: 15, color: 'var(--gray-400)' }} />
                <input 
                  className="form-control" 
                  name="email"
                  type="email" 
                  value={form.email} 
                  onChange={handleChange}
                  placeholder="name@email.com" 
                  style={{ paddingLeft: 48, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 14, height: '52px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="form-label" style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-600)', fontWeight: 700, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: 16, top: 15, color: 'var(--gray-400)' }} />
                <input 
                  className="form-control" 
                  name="password"
                  type="password" 
                  value={form.password} 
                  onChange={handleChange}
                  placeholder="••••••••" 
                  style={{ paddingLeft: 48, background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 14, height: '52px' }}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary w-full" disabled={loading} style={{
              padding: '16px', borderRadius: 14, fontSize: '1rem', fontWeight: 700,
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)', border: 'none',
              boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', marginTop: 20
            }}>
              {loading ? 'Signing in...' : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  Sign In <FiArrowRight />
                </span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 30, borderTop: '1px solid var(--gray-100)' }}>
            <p style={{ fontSize: '1rem', color: 'var(--gray-500)' }}>
              Don't have an account? {' '}
              <Link to="/register" style={{ color: 'var(--primary-600)', fontWeight: 800, textDecoration: 'none' }}>
                Create one now
              </Link>
            </p>
            <div style={{ marginTop: 24 }}>
              <Link to="/admin/login" style={{ color: 'var(--gray-400)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <FiShield size={14} /> Admin Access
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
