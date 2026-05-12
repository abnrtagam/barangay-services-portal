import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { AlertMessage } from '../components/DashboardCard'

export default function VerifyOTP() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [alert, setAlert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpRefs = useRef([])

  useEffect(() => {
    const storedEmail = localStorage.getItem('verification_email')
    if (!storedEmail) {
      navigate('/register')
      return
    }
    setEmail(storedEmail)
  }, [navigate])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = e => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setOtp(newOtp.slice(0, 6))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setAlert({ type: 'error', message: 'Please enter all 6 digits.' })
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/auth/verify-otp', { email, otp: otpCode })
      setAlert({ type: 'success', message: 'Email verified successfully! Redirecting to login...' })
      localStorage.removeItem('verification_email')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'OTP verification failed.' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    try {
      await axios.post('/api/auth/resend-otp', { email })
      setAlert({ type: 'success', message: 'New OTP sent to your email!' })
      setOtp(['', '', '', '', '', ''])
      setResendCooldown(60)
      otpRefs.current[0]?.focus()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to resend OTP.' })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--primary-50)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', color: 'white', fontSize: 32
          }}>
            🔐
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>Verify Your Email</h1>
          <p style={{ color: 'var(--gray-600)', fontSize: '.95rem' }}>
            We've sent a verification code to<br/>
            <strong>{email}</strong>
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <form onSubmit={handleSubmit}>
              {/* OTP Input Fields */}
              <div style={{ marginBottom: 32 }}>
                <label className="form-label" style={{ marginBottom: 16, display: 'block' }}>Enter 6-Digit Code</label>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12,
                  marginBottom: 12
                }}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => otpRefs.current[idx] = el}
                      type="text"
                      value={digit}
                      onChange={e => handleOTPChange(idx, e.target.value)}
                      onKeyDown={e => handleKeyDown(idx, e)}
                      onPaste={handlePaste}
                      maxLength="1"
                      style={{
                        width: '100%', padding: '16px', fontSize: '24px', fontWeight: 700,
                        textAlign: 'center', border: '2px solid var(--border-color)',
                        borderRadius: 8, transition: 'all 0.2s',
                        background: digit ? 'var(--primary-50)' : 'white',
                        borderColor: digit ? 'var(--primary-300)' : 'var(--border-color)'
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary-600)'}
                      onBlur={e => e.target.style.borderColor = digit ? 'var(--primary-300)' : 'var(--border-color)'}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                  💡 Tip: You can paste the code directly
                </div>
              </div>

              {/* Info Box */}
              <div style={{
                background: 'var(--primary-50)', border: '1px solid var(--primary-200)',
                padding: 16, borderRadius: 8, marginBottom: 24, fontSize: 14
              }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 18 }}>⏰</span>
                  <div>
                    <strong>Code expires in 10 minutes</strong>
                    <div style={{ color: 'var(--gray-600)', fontSize: 12, marginTop: 2 }}>
                      Check your email spam folder if you don't see the code
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary w-full" disabled={loading || otp.join('').length !== 6}>
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>

            {/* Resend OTP */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 12 }}>Didn't receive the code?</p>
              <button
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || resendLoading}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary-600)',
                  cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer', fontWeight: 600,
                  fontSize: 14, opacity: resendCooldown > 0 ? 0.6 : 1
                }}
              >
                {resendLoading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>

            {/* Links */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
                Wrong email? <Link to="/register" style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}>Register again</Link>
              </p>
              <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                Need help? <a href="mailto:support@barangay.gov" style={{ color: 'var(--primary-600)', textDecoration: 'none', fontWeight: 600 }}>Contact support</a>
              </p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div style={{ marginTop: 24, padding: 16, background: 'white', borderRadius: 8 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--gray-700)' }}>What happens next?</h3>
          <ul style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.8, paddingLeft: 20 }}>
            <li>✓ Your email will be verified</li>
            <li>✓ Your account will be pending admin review</li>
            <li>✓ You'll receive an email when approved</li>
            <li>✓ Then you can log in and access services</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
