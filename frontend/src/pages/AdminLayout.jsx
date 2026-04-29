import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const sideLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/orders', icon: '📦', label: 'Orders' },
    { to: '/admin/designs', icon: '🎨', label: 'Designs' },
    { to: '/admin/reviews', icon: '⭐', label: 'Reviews' },
    { to: '/admin/payouts', icon: '💰', label: 'Payouts' },
]

export default function AdminLayout({ children, title, subtitle }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

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
                    {sideLinks.map((l) => {
                        const active = location.pathname === l.to
                        return (
                            <Link key={l.to} to={l.to} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 24px', color: active ? '#fff' : '#a5b4fc',
                                textDecoration: 'none', fontWeight: 600, fontSize: 14,
                                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderLeft: active ? '3px solid #a5b4fc' : '3px solid transparent',
                                transition: 'all 0.2s'
                            }}>
                                <span style={{ fontSize: 18 }}>{l.icon}</span> {l.label}
                            </Link>
                        )
                    })}
                </nav>
                <div style={{ padding: '24px' }}>
                    <div style={{ fontSize: 13, color: '#a5b4fc', marginBottom: 4 }}>Logged in as</div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.name}</div>
                    <Link to="/feed" style={{ marginTop: 12, width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        🌐 View Site
                    </Link>
                    <button onClick={() => { logout(); navigate('/login') }} style={{ marginTop: 8, width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                        Log Out
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ marginLeft: 240, flex: 1, padding: '40px 32px' }}>
                {title && (
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0 }}>{title}</h1>
                        {subtitle && <p style={{ color: '#6b7280', marginTop: 6 }}>{subtitle}</p>}
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}
