import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLayout from './AdminLayout'

export default function AdminDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        api.get('/admin/analytics/')
            .then((res) => setData(res.data))
            .finally(() => setLoading(false))
    }, [])

    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

    const sideLinks = [
        { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
        { to: '/admin/users', icon: '👥', label: 'Users' },
        { to: '/admin/orders', icon: '📦', label: 'Orders' },
        { to: '/admin/designs', icon: '🎨', label: 'Designs' },
        { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
        { to: '/admin/payouts', icon: '💰', label: 'Payouts' },
    ]

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <div style={{ width: 240, background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', display: 'flex', flexDirection: 'column', padding: '32px 0', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
                <div style={{ padding: '0 24px 32px' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
                        <span style={{ color: '#a5b4fc' }}>Design</span>Mart
                    </div>
                    <div style={{ fontSize: 11, color: '#818cf8', marginTop: 4, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Admin Panel</div>
                </div>
                <nav style={{ flex: 1 }}>
                    {sideLinks.map((l) => (
                        <Link key={l.to} to={l.to} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px 24px', color: window.location.pathname === l.to ? '#fff' : '#a5b4fc',
                            textDecoration: 'none', fontWeight: 600, fontSize: 14,
                            background: window.location.pathname === l.to ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderLeft: window.location.pathname === l.to ? '3px solid #a5b4fc' : '3px solid transparent',
                            transition: 'all 0.2s'
                        }}>
                            <span style={{ fontSize: 18 }}>{l.icon}</span> {l.label}
                        </Link>
                    ))}
                </nav>
                <div style={{ padding: '24px' }}>
                    <div style={{ fontSize: 13, color: '#a5b4fc', marginBottom: 4 }}>Logged in as</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                    <button onClick={() => { logout(); navigate('/login') }} style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                        Log Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ marginLeft: 240, flex: 1, padding: '40px 32px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                        <div style={{ width: 48, height: 48, border: '4px solid #e0e7ff', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: 24, padding: '40px 32px', color: '#fff', marginBottom: 32, boxShadow: '0 10px 40px rgba(99,102,241,0.3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p style={{ margin: 0, opacity: 0.85, fontSize: 15 }}>{greeting} 👋</p>
                                    <h1 style={{ margin: '4px 0', fontSize: 28, fontWeight: 800 }}>{user?.name}</h1>
                                    <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>
                                        {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
                            {[
                                { icon: '💰', label: 'Total Revenue', value: `₹${data?.total_revenue || 0}`, color: '#10b981', bg: '#f0fdf4' },
                                { icon: '📦', label: 'Total Orders', value: data?.total_orders || 0, color: '#6366f1', bg: '#eef2ff' },
                                { icon: '👥', label: 'Total Users', value: data?.total_users || 0, color: '#f59e0b', bg: '#fffbeb' },
                                { icon: '🎨', label: 'Designers', value: data?.total_designers || 0, color: '#ec4899', bg: '#fdf2f8' },
                                { icon: '🖼️', label: 'Total Designs', value: data?.total_designs || 0, color: '#8b5cf6', bg: '#faf5ff' },
                            ].map((s, i) => (
                                <div key={i} style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}` }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 16 }}>{s.icon}</div>
                                    <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{s.value}</div>
                                    <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div style={{ marginBottom: 32 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 16 }}>Quick Actions</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                {[
                                    { to: '/admin/users', icon: '👥', title: 'Manage Users', desc: 'Ban, approve, manage roles', color: 'linear-gradient(135deg, #6366f1, #818cf8)' },
                                    { to: '/admin/orders', icon: '📦', title: 'All Orders', desc: 'View & resolve disputes', color: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
                                    { to: '/admin/designs', icon: '🎨', title: 'Moderate Designs', desc: 'Remove inappropriate content', color: 'linear-gradient(135deg, #ec4899, #f472b6)' },
                                    { to: '/admin/payouts', icon: '💰', title: 'Payouts', desc: 'Manage designer earnings', color: 'linear-gradient(135deg, #10b981, #34d399)' },
                                ].map((a, i) => (
                                    <Link key={i} to={a.to} style={{ background: a.color, borderRadius: 20, padding: 24, textDecoration: 'none', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'block' }}>
                                        <div style={{ fontSize: 36, marginBottom: 12 }}>{a.icon}</div>
                                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{a.title}</div>
                                        <div style={{ fontSize: 13, opacity: 0.85 }}>{a.desc}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Top Cities & Designers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ fontWeight: 800, color: '#111827', marginBottom: 16, fontSize: 16 }}>🏙️ Top Cities</h3>
                                {data?.top_cities?.length === 0 ? <p style={{ color: '#6b7280', fontSize: 14 }}>No data yet</p> :
                                    data?.top_cities?.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontWeight: 600, color: '#374151' }}>{c.city}</span>
                                            <span style={{ background: '#eef2ff', color: '#6366f1', padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{c.total} orders</span>
                                        </div>
                                    ))}
                            </div>
                            <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                                <h3 style={{ fontWeight: 800, color: '#111827', marginBottom: 16, fontSize: 16 }}>🏆 Top Designers</h3>
                                {data?.top_designers?.length === 0 ? <p style={{ color: '#6b7280', fontSize: 14 }}>No data yet</p> :
                                    data?.top_designers?.map((d, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#374151' }}>{d.name}</div>
                                                <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.total_designs} designs</div>
                                            </div>
                                            <span style={{ background: '#fdf2f8', color: '#ec4899', padding: '2px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>⭐ {d.avg_rating ? parseFloat(d.avg_rating).toFixed(1) : 'N/A'}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
