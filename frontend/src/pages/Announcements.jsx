import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FiBell } from 'react-icons/fi'

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('resident_token')

  useEffect(() => {
    axios.get('/api/announcements', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setAnnouncements(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Latest news and updates from your barangay.</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner"/></div>
      ) : announcements.length === 0 ? (
        <div className="empty-state">
          <FiBell size={40} style={{ marginBottom: 12, color: 'var(--gray-300)' }}/>
          <p>No announcements available at this time.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{
                height: 4,
                background: a.priority === 'High'
                  ? 'var(--danger)'
                  : a.priority === 'Medium'
                  ? 'var(--warning)'
                  : 'var(--primary-500)',
              }}/>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: 'var(--radius-full)',
                        fontSize: '.72rem', fontFamily: 'var(--font-heading)', fontWeight: 700,
                        background: a.priority === 'High' ? '#fee2e2' : a.priority === 'Medium' ? '#fef3c7' : 'var(--primary-100)',
                        color: a.priority === 'High' ? '#991b1b' : a.priority === 'Medium' ? '#92400e' : 'var(--primary-800)',
                      }}>
                        {a.priority || 'Normal'} Priority
                      </span>
                      <span style={{ fontSize: '.78rem', color: 'var(--gray-400)' }}>
                        {new Date(a.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 10 }}>{a.title}</h3>
                    <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, fontSize: '.9rem' }}>{a.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
