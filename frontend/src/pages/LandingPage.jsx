import React from 'react'
import { Link } from 'react-router-dom'
import { FiFileText, FiCalendar, FiBell, FiArrowRight, FiShield } from 'react-icons/fi'

const FEATURES = [
  { icon: <FiFileText size={28}/>, title: 'File Complaints', desc: 'Submit and track your barangay complaints online with real-time status updates.' },
  { icon: <FiCalendar size={28}/>, title: 'Book Appointments', desc: 'Schedule visits to the barangay hall and manage your appointments easily.' },
  { icon: <FiBell size={28}/>,    title: 'View Announcements', desc: 'Stay updated with the latest news and announcements from your barangay.' },
  { icon: <FiShield size={28}/>,  title: 'Secure & Private',   desc: 'Your personal information is safe and only accessible by authorized officials.' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Hero */}
      <header style={{
        background: 'var(--primary-700)',
        color: 'white', padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ overflow: 'hidden', borderRadius: '8px', width: 44, height: 44, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
              <img src="/logo.png" alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>Barangay Bulua</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: 'white', border: '1.5px solid rgba(255,255,255,.3)' }}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ background: 'white', color: 'var(--primary-700)' }}>Register</Link>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '70px 0 100px', textAlign: 'center' }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: '50%', background: 'white', 
            margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)', padding: 12
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.12)', borderRadius: 'var(--radius-full)',
            padding: '8px 20px', marginBottom: 20, fontSize: '.82rem',
            fontFamily: 'var(--font-heading)', fontWeight: 600,
          }}>
            Official Barangay Online Services
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: 'white',
            lineHeight: 1.15, marginBottom: 20, maxWidth: 800, margin: '0 auto 20px'
          }}>
            Barangay Bulua: An Online Appointment and Complaint System
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--primary-200)', maxWidth: 650, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Empowering residents through digital innovation. Our mission is to provide efficient, transparent, and accessible barangay services for a smarter community.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
              Get Started <FiArrowRight />
            </Link>
            <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.15)', color: 'white', border: '1.5px solid rgba(255,255,255,.3)' }}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', marginBottom: 12 }}>Everything You Need</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '1rem' }}>Designed to make government services accessible to every resident.</p>
        </div>
        <div className="grid-4">
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ 
              padding: '40px 24px', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%',
              margin: 0,
              transition: 'var(--transition)',
              cursor: 'default'
            }}>
              <div style={{
                width: 68, height: 68, borderRadius: '20px',
                background: 'var(--primary-50)', color: 'var(--primary-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)'
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: 12, fontSize: '1.15rem', color: 'var(--primary-900)', letterSpacing: '-0.01em' }}>{f.title}</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '.92rem', lineHeight: 1.7, flexGrow: 1, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--primary-700)', color: 'white',
        padding: '80px 24px', textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2.2rem', marginBottom: 14, color: 'white' }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'var(--primary-100)', marginBottom: 36, fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 36px' }}>
          Create your free account and access all barangay services online. Empowering residents through efficient digital services.
        </p>
        <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-700)' }}>
          Create an Account <FiArrowRight />
        </Link>
      </section>

      <footer style={{
        background: 'var(--primary-900)', color: 'var(--primary-300)',
        padding: '32px 24px', textAlign: 'center', fontSize: '.85rem',
        borderTop: '1px solid rgba(255,255,255,.05)'
      }}>
        © {new Date().getFullYear()} Barangay Bulua: An Online Appointment and Complaint System · All rights reserved
      </footer>
    </div>
  )
}
