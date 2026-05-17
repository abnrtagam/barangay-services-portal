import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { DashboardCard, StatusBadge } from '../components/DashboardCard'
import {
  FiUsers, FiAlertCircle, FiClock,
  FiCalendar, FiCheckCircle, FiClipboard, FiTrendingUp, FiActivity, FiMap, FiRefreshCw
} from 'react-icons/fi'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { format, subDays, startOfDay, isSameDay } from 'date-fns'

const EmptyState = ({ message }) => (
  <tr>
    <td colSpan={3}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 20px',
        color: '#94a3b8',
        gap: '12px',
      }}>
        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%' }}>
          <FiClipboard size={40} strokeWidth={1} />
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
      </div>
    </td>
  </tr>
)

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats]           = useState({})
  const [zoneStats, setZoneStats]   = useState([])
  const [dailyData, setDailyData]   = useState([])
  const [recentComplaints, setRC]   = useState([])
  const [recentAppointments, setRA] = useState([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const token = localStorage.getItem('admin_token')

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    const headers = { Authorization: `Bearer ${token}` }
    
    try {
      // Fetch core stats first
      const [sRes, zRes, cRes, aRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers }).catch(e => ({ data: {} })),
        axios.get('/api/admin/residents/zone-stats', { headers }).catch(e => ({ data: { data: [] } })),
        axios.get('/api/admin/complaints?limit=6', { headers }).catch(e => ({ data: { data: [] } })),
        axios.get('/api/admin/appointments?limit=6', { headers }).catch(e => ({ data: { data: [] } })),
      ])
      
      setStats(sRes.data || {})
      setZoneStats(zRes.data.data || [])
      setRC(cRes.data.data || [])
      setRA(aRes.data.data || [])

      // Fetch daily stats separately so it doesn't block the rest
      try {
        const dRes = await axios.get('/api/admin/daily-stats', { headers })
        const backendDaily = dRes.data.complaints || []
        
        const last7Days = [...Array(7)].map((_, i) => {
          const d = subDays(new Date(), 6 - i)
          return {
            name: format(d, 'EEE'),
            fullDate: format(d, 'yyyy-MM-dd'),
            count: 0
          }
        })

        const processed = last7Days.map(day => {
          const match = backendDaily.find(b => {
            const bDate = format(new Date(b.date), 'yyyy-MM-dd')
            return bDate === day.fullDate
          })
          return { name: day.name, count: match ? match.count : 0 }
        })
        setDailyData(processed)
      } catch (err) {
        console.warn("Daily stats failed, using empty chart", err)
        setDailyData([])
      }

    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 60000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" style={{ width: '50px', height: '50px' }} />
    </div>
  )

  const todayStr = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>

      {/* Header & Welcome */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #60a5fa 100%)',
        borderRadius: '32px',
        padding: '48px 48px',
        marginBottom: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 20px 40px rgba(37, 99, 235, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        color: 'white'
      }}>
        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        
        <div style={{ zIndex: 1 }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', 
            padding: '6px 14px', borderRadius: '10px', fontSize: '0.75rem', 
            fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: '16px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <FiActivity style={{ marginRight: '6px' }} /> {refreshing ? 'Refreshing...' : 'Live System Monitor'}
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 12px 0', letterSpacing: '-0.03em', color: 'white' }}>
            Good Day, Admin!
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: 500, maxWidth: '500px' }}>
            Welcome back to the command center. You have <span style={{ fontWeight: 800 }}>{stats.pendingComplaints || 0}</span> pending complaints that need your attention today.
          </p>
        </div>

        <div style={{ 
          background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', 
          padding: '24px 32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px'
        }}>
          <button 
            onClick={() => fetchData(true)}
            style={{ 
              background: 'none', border: 'none', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem',
              fontWeight: 700, marginBottom: '8px', justifyContent: 'flex-end', opacity: 0.8
            }}
          >
            <FiRefreshCw className={refreshing ? 'spin' : ''} /> Force Refresh
          </button>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Current Date</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{todayStr}</div>
        </div>
      </div>

      {/* Analytics Overview Section */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 8px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FiActivity color="#2563eb" /> System Insights
          </h2>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Last updated: Just now</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <DashboardCard 
            title="Total Population"    
            value={stats.totalResidents || 0} 
            icon={<FiUsers />}       
            color="blue"    
            sub="Registered residents" 
          />
          <DashboardCard 
            title="Pending Reports" 
            value={stats.pendingComplaints || 0} 
            icon={<FiAlertCircle />}       
            color="danger" 
            sub="Critical priority" 
          />
          <DashboardCard 
            title="Active Appointments"     
            value={stats.pendingAppointments || 0} 
            icon={<FiClock />} 
            color="warning"   
            sub="Scheduled for today" 
          />
        </div>
      </div>

      {/* Main Grid: Pulse Chart & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', marginBottom: '48px' }}>
        
        {/* Community Pulse Card */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Community Pulse</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Actual complaint activity for the last 7 days</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>{stats.totalComplaints || 0}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Total Complaints</div>
            </div>
          </div>
          
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis hide={true} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone Distribution Card */}
        <div style={{ background: '#0f172a', borderRadius: '32px', padding: '32px', color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
            <FiMap size={120} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiMap /> Zone Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {zoneStats.length === 0 ? (
              <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>No resident data by zone yet.</p>
            ) : (
              zoneStats.slice(0, 5).map((z, idx) => {
                const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe']
                const percentage = stats.totalResidents > 0 ? (z.count / stats.totalResidents) * 100 : 0
                return (
                  <div key={z.zone}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                      <span>{z.zone}</span>
                      <span>{z.count} Residents</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${percentage}%`, background: colors[idx % colors.length], borderRadius: '4px', transition: 'width 1s ease-in-out' }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/reports')}
            style={{ 
              marginTop: '32px', width: '100%', padding: '14px', borderRadius: '16px', 
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: 'white', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            View Full Reports
          </button>
        </div>
      </div>



      {/* Detailed Activity Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        
        {/* Complaints Card */}
        <div style={{ background: 'white', borderRadius: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Recent Complaints</h3>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '8px' }}>LIVE FEED</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={thStyle}>Resident</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.length === 0
                  ? <EmptyState message="No recent complaints." />
                  : recentComplaints.map(c => (
                    <tr key={c.id} style={{ transition: 'background 0.2s' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                            {c.resident_name?.[0]}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{c.resident_name}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.85rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.subject}
                      </td>
                      <td style={tdStyle}><StatusBadge status={c.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments Card */}
        <div style={{ background: 'white', borderRadius: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Upcoming Appointments</h3>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981', background: '#f0fdf4', padding: '4px 10px', borderRadius: '8px' }}>FRESH</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={thStyle}>Resident</th>
                  <th style={thStyle}>Schedule</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.length === 0
                  ? <EmptyState message="No recent appointments." />
                  : recentAppointments.map(a => (
                    <tr key={a.id} style={{ transition: 'background 0.2s' }}>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, color: '#475569' }}>
                            {a.resident_name?.[0]}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{a.resident_name}</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: '0.85rem', color: '#64748b' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{a.appointment_date}</div>
                        <div style={{ fontSize: '0.75rem' }}>{a.time_slot}</div>
                      </td>
                      <td style={tdStyle}><StatusBadge status={a.status} /></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

const thStyle = {
  padding: '16px 32px',
  fontSize: '0.75rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#94a3b8',
  textAlign: 'left',
  borderBottom: '1px solid #f1f5f9',
}

const tdStyle = {
  padding: '18px 32px',
  borderBottom: '1px solid #f8fafc',
}