import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'

export default function AdminForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState('request') // 'request' or 'reset'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)

  // Step 1: Request Password Reset OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setAlert({ type: 'error', message: 'Email is required.' })
      return
    }

    if (!email.includes('@')) {
      setAlert({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/admin-forgot-password', { email })
      setAlert({ 
        type: 'success', 
        message: 'Check your email for the password reset code. It will expire in 15 minutes.' 
      })
      setStep('reset')
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset code.'
      setAlert({ type: 'error', message: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!otp || !newPassword || !confirmPassword) {
      setAlert({ type: 'error', message: 'All fields are required.' })
      return
    }

    if (otp.length !== 6) {
      setAlert({ type: 'error', message: 'Reset code must be 6 digits.' })
      return
    }

    if (newPassword.length < 5) {
      setAlert({ type: 'error', message: 'Password must be at least 5 characters.' })
      return
    }

    if (newPassword !== confirmPassword) {
      setAlert({ type: 'error', message: 'Passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const { data } = await axios.post('/api/auth/admin-reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      })
      setAlert({ type: 'success', message: data.message })
      setTimeout(() => {
        navigate('/admin/login')
      }, 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Password reset failed.'
      setAlert({ type: 'error', message: errorMsg })
    } finally {
      setLoading(false)
    }
  }

  // Request OTP form
  if (step === 'request') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
            }}>
              <img src="/logo.png" alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6, color: 'white' }}>Admin Reset Password</h1>
            <p style={{ color: '#94a3b8', fontSize: '.9rem' }}>Enter your admin email to receive a reset code</p>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #334155' }}>
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
            
            <form onSubmit={handleRequestOTP}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>Email Address *</label>
                <input 
                  style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '0.95rem' }}
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@email.com"
                  autoFocus
                />
              </div>

              <button 
                style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>

            <div style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              padding: 12, 
              borderRadius: 8, 
              marginTop: 16,
              fontSize: '13px',
              color: '#93c5fd',
              lineHeight: '1.5'
            }}>
              <strong>💡 Tip:</strong> We'll send a 6-digit code to your email. Check your spam folder if you don't see it.
            </div>

            <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#94a3b8' }}>
              Remember your password? <Link to="/admin/login" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 700 }}>Sign in instead</Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Reset password form
  return (
    <div style={{
      minHeight: '100vh', background: '#0f172a',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 80, height: 80,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <img src="/logo.png" alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 6, color: 'white' }}>Create New Password</h1>
          <p style={{ color: '#94a3b8', fontSize: '.9rem' }}>Enter the code and your new admin password</p>
        </div>

        <div style={{ background: '#1e293b', borderRadius: '24px', padding: '32px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid #334155' }}>
          {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)}/>}
          
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>Reset Code *</label>
              <input 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '18px', letterSpacing: '8px', textAlign: 'center' }}
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                placeholder="000000"
                maxLength="6"
                autoFocus
              />
              <small style={{ color: '#64748b', marginTop: 4, display: 'block' }}>
                6-digit code from your email
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>New Password *</label>
              <input 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '0.95rem' }}
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="••••••••"
              />
              <small style={{ color: '#64748b', marginTop: 4, display: 'block' }}>
                Min. 5 characters
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>Confirm Password *</label>
              <input 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '0.95rem' }}
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="••••••••"
              />
            </div>

            <button 
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s' }}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem' }}>
            <button 
              type="button"
              onClick={() => {
                setStep('request')
                setOtp('')
                setNewPassword('')
                setConfirmPassword('')
                setAlert(null)
              }}
              style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
            >
              ← Use a different email
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
