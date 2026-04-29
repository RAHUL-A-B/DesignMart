import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './DesignerLayout.css'

const NAV_ITEMS = [
    {
        to: '/designer/dashboard',
        label: 'Dashboard',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        to: '/designer/designs',
        label: 'My Designs',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        ),
    },
    {
        to: '/designer/upload',
        label: 'Upload Design',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
        ),
    },
    {
        to: '/designer/orders',
        label: 'Orders',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
]

export default function DesignerLayout({ children, title, subtitle }) {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className={`dl-shell ${collapsed ? 'dl-collapsed' : ''}`}>
            {/* ── Sidebar ── */}
            <aside className="dl-sidebar">
                {/* Logo / Brand */}
                <div className="dl-brand">
                    <div className="dl-brand-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    {!collapsed && <span className="dl-brand-text">DesignMart</span>}
                    <button className="dl-toggle-btn" onClick={() => setCollapsed(c => !c)} aria-label="Toggle sidebar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {collapsed
                                ? <><polyline points="9 18 15 12 9 6" /></>
                                : <><polyline points="15 18 9 12 15 6" /></>
                            }
                        </svg>
                    </button>
                </div>

                {/* Designer Profile */}
                <div className="dl-profile">
                    <div className="dl-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                        <span className="dl-avatar-badge" />
                    </div>
                    {!collapsed && (
                        <div className="dl-profile-info">
                            <p className="dl-profile-name">{user?.name || 'Designer'}</p>
                            <p className="dl-profile-role">Creative Designer</p>
                        </div>
                    )}
                </div>

                {/* Nav Label */}
                {!collapsed && <p className="dl-nav-label">MAIN MENU</p>}

                {/* Navigation */}
                <nav className="dl-nav">
                    {NAV_ITEMS.map(item => {
                        const isActive = location.pathname === item.to
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`dl-nav-item ${isActive ? 'dl-nav-active' : ''}`}
                                title={collapsed ? item.label : ''}
                            >
                                <span className="dl-nav-icon">{item.icon}</span>
                                {!collapsed && <span className="dl-nav-label-text">{item.label}</span>}
                                {isActive && !collapsed && <span className="dl-nav-dot" />}
                            </Link>
                        )
                    })}
                </nav>

                {/* Divider & Bottom Actions */}
                <div className="dl-sidebar-bottom">
                    {!collapsed && <p className="dl-nav-label">ACCOUNT</p>}
                    <Link to="/feed" className="dl-nav-item" title={collapsed ? 'Go to Store' : ''}>
                        <span className="dl-nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </span>
                        {!collapsed && <span className="dl-nav-label-text">Visit Store</span>}
                    </Link>
                    <button className="dl-nav-item dl-logout-btn" onClick={handleLogout} title={collapsed ? 'Logout' : ''}>
                        <span className="dl-nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </span>
                        {!collapsed && <span className="dl-nav-label-text">Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main Area ── */}
            <div className="dl-main">
                {/* Top Header Bar */}
                <header className="dl-topbar">
                    <div className="dl-topbar-left">
                        {title && <h1 className="dl-page-title">{title}</h1>}
                        {subtitle && <p className="dl-page-subtitle">{subtitle}</p>}
                    </div>
                    <div className="dl-topbar-right">
                        <div className="dl-search-box">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input type="text" placeholder="Search anything..." />
                        </div>
                        <button className="dl-notif-btn" aria-label="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="dl-notif-badge">3</span>
                        </button>
                        <div className="dl-topbar-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="dl-content">
                    {children}
                </main>
            </div>
        </div>
    )
}
