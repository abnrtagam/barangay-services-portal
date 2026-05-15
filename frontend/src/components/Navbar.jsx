import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiLogOut, FiChevronDown, FiMenu, FiX } from 'react-icons/fi'

const parseLocalStorageJSON = value => {
  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

export default function Navbar() {
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const user = parseLocalStorageJSON(localStorage.getItem('resident_user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('resident_token')
    localStorage.removeItem('resident_user')
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-logo" style={{ overflow: 'hidden', borderRadius: '50%', width: 36, height: 36, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Barangay Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <span className="brand-name">Barangay Bulua</span>
          <span className="brand-sub">Online Appointment & Complaint System</span>
        </div>
      </div>

      <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
        <Link to="/resident/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/resident/complaints/submit" className="nav-link">File Complaint</Link>
        <Link to="/resident/appointments/book" className="nav-link">Book Appointment</Link>
        <Link to="/resident/announcements" className="nav-link">Announcements</Link>
      </div>

      <div className="navbar-actions">
        <div className="user-menu" onClick={() => setDropOpen(!dropOpen)}>
          <div className="avatar">{user.first_name?.[0] || 'R'}</div>
          <span className="user-name">{user.first_name || 'Resident'}</span>
          <FiChevronDown size={14} />
          {dropOpen && (
            <div className="dropdown">
              <Link to="/resident/dashboard" className="drop-item">
                <FiUser size={14}/> My Profile
              </Link>
              <div className="drop-divider"></div>
              <button className="drop-item danger" onClick={handleLogout}>
                <FiLogOut size={14}/> Logout
              </button>
            </div>
          )}
        </div>

        <button className="icon-btn mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <FiX size={20}/> : <FiMenu size={20}/>}
        </button>
      </div>

      <style>{`
        .navbar {
          position: sticky; top: 0; z-index: 100;
          height: var(--navbar-h);
          background: var(--primary-700);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 32px; gap: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,.15);
        }
        .navbar-brand { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
        .brand-logo { display: flex; }
        .brand-name { display: block; font-family: var(--font-heading); font-weight: 800; font-size: 1rem; color: white; line-height: 1.1; }
        .brand-sub  { display: block; font-size: .7rem; color: var(--primary-200); letter-spacing: .04em; }
        .navbar-links { display: flex; gap: 12px; }
        .nav-link {
          padding: 10px 16px; border-radius: var(--radius-md);
          font-family: var(--font-heading); font-weight: 600; font-size: .875rem;
          color: var(--primary-100); transition: var(--transition);
        }
        .nav-link:hover { background: rgba(255,255,255,.15); color: white; }
        .navbar-actions { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
        .icon-btn {
          position: relative; width: 36px; height: 36px; border: none;
          border-radius: var(--radius-md); background: rgba(255,255,255,.12);
          color: white; cursor: pointer; display: flex; align-items: center;
          justify-content: center; transition: var(--transition);
        }
        .icon-btn:hover { background: rgba(255,255,255,.22); }
        .user-menu {
          position: relative; display: flex; align-items: center; gap: 8px;
          padding: 6px 12px; border-radius: var(--radius-md);
          cursor: pointer; color: white; background: rgba(255,255,255,.12);
          transition: var(--transition);
        }
        .user-menu:hover { background: rgba(255,255,255,.22); }
        .avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--primary-400); color: white;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-heading); font-weight: 700; font-size: .85rem;
        }
        .user-name { font-family: var(--font-heading); font-weight: 600; font-size: .875rem; }
        .dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: white; border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg); border: 1px solid var(--gray-200);
          min-width: 180px; overflow: hidden; z-index: 200;
        }
        .drop-item {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; font-size: .88rem; font-family: var(--font-heading); font-weight: 500;
          color: var(--gray-700); cursor: pointer; border: none; background: none; width: 100%;
          text-align: left; transition: background .15s;
        }
        .drop-item:hover { background: var(--gray-50); }
        .drop-item.danger { color: var(--danger); }
        .drop-divider { height: 1px; background: var(--gray-100); margin: 4px 0; }
        .mobile-toggle { display: none; }
        @media (max-width: 768px) {
          .navbar-links { 
            display: none; position: fixed; top: var(--navbar-h); left: 0; right: 0;
            background: var(--primary-800); flex-direction: column; padding: 12px;
            box-shadow: var(--shadow-md);
          }
          .navbar-links.open { display: flex; }
          .mobile-toggle { display: flex; }
          .user-name { display: none; }
        }
      `}</style>
    </nav>
  )
}