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
        background: 'linear-gradient(135deg, var(--primary-900) 0%, var(--primary-700) 60%, var(--primary-500) 100%)',
        color: 'white', padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.15"/>
              <path d="M16 4L4 11v2h24v-2L16 4zM6 14v10h4V14H6zm8 0v10h4V14h-4zm8 0v10h4V14h-4zM4 26h24v2H4v-2z" fill="white"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem' }}>Barangay Portal</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: 'white', border: '1.5px solid rgba(255,255,255,.3)' }}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" style={{ background: 'white', color: 'var(--primary-700)' }}>Register</Link>
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '90px 0 100px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,.12)', borderRadius: 'var(--radius-full)',
            padding: '6px 18px', marginBottom: 24, fontSize: '.82rem',
            fontFamily: 'var(--font-heading)', fontWeight: 600,
          }}>
            🏛️ Official Barangay Online Services
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'white',
            lineHeight: 1.15, marginBottom: 20,
          }}>
            Serve Your Community<br />
            <span style={{ color: 'var(--primary-300)' }}>Smarter & Faster</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--primary-200)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            File complaints, book appointments, and stay connected with your barangay — all in one secure online portal.
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
            <div key={i} className="card" style={{ padding: 28, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-50)', color: 'var(--primary-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
              }}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 8, fontSize: '1rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '.88rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: 'var(--primary-700)', color: 'white',
        padding: '64px 24px', textAlign: 'center',
      }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', marginBottom: 14 }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'var(--primary-200)', marginBottom: 30, fontSize: '1rem' }}>
          Create your free account and access all barangay services online.
        </p>
        <Link to="/register" className="btn btn-lg" style={{ background: 'white', color: 'var(--primary-700)' }}>
          Create an Account <FiArrowRight />
        </Link>
      </section>

      <footer style={{
        background: 'var(--primary-900)', color: 'var(--primary-300)',
        padding: '24px', textAlign: 'center', fontSize: '.85rem',
      }}>
        © {new Date().getFullYear()} Barangay Complaint & Appointment System · All rights reserved
      </footer>
    </div>
  )
}
