import { useEffect, useState } from 'react'
import api from '../api/axios'
import DesignerLayout from '../components/DesignerLayout'
import './DesignerDashboard.css'

export default function DesignerDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/designers/dashboard/')
            .then((res) => setData(res.data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <DesignerLayout title="Dashboard" subtitle="">
            <div className="dl-spinner-wrap"><div className="dl-spinner" /></div>
        </DesignerLayout>
    )

    if (!data) return (
        <DesignerLayout title="Dashboard">
            <div className="dl-empty">
                <span className="dl-empty-icon">⚠️</span>
                <h3>Failed to load dashboard</h3>
                <p>Please try refreshing the page.</p>
            </div>
        </DesignerLayout>
    )

    const { designer_profile, overview_stats } = data
    const firstName = designer_profile.name.split(' ')[0]

    const now = new Date()
    const hour = now.getHours()
    const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

    const stats = [
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
            ),
            label: 'Total Designs',
            value: overview_stats.total_designs,
            accent: '#ec4899',
            lightBg: '#fdf2f8',
            iconColor: '#ec4899',
            desc: 'Published to marketplace',
        },
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
            ),
            label: 'Pending Orders',
            value: overview_stats.pending_orders,
            accent: '#f59e0b',
            lightBg: '#fffbeb',
            iconColor: '#f59e0b',
            desc: 'Awaiting your action',
        },
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
            ),
            label: 'Total Earnings',
            value: `₹${overview_stats.total_earnings || 0}`,
            accent: '#10b981',
            lightBg: '#f0fdf4',
            iconColor: '#10b981',
            desc: 'All time revenue',
        },
        {
            icon: (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
            ),
            label: 'Avg. Rating',
            value: overview_stats.average_rating || '—',
            accent: '#8b5cf6',
            lightBg: '#faf5ff',
            iconColor: '#8b5cf6',
            desc: 'Customer satisfaction',
        },
    ]

    const profileLinks = [
        { to: '/designer/designs', label: 'My Designs', icon: '🖼️', color: '#ec4899', count: overview_stats.total_designs },
        { to: '/designer/orders', label: 'Orders', icon: '📦', color: '#f59e0b', count: overview_stats.pending_orders },
        { to: '/designer/upload', label: 'Upload', icon: '➕', color: '#10b981', count: null },
    ]

    return (
        <DesignerLayout title="" subtitle="">
            {/* ══ Welcome Banner ══ */}
            <div className="db-banner">
                <div className="db-banner-bg" />
                <div className="db-banner-content">
                    <div className="db-banner-left">
                        <p className="db-greeting">{greeting} 👋</p>
                        <h1 className="db-welcome-name">{designer_profile.name}</h1>
                        <p className="db-welcome-sub">
                            Here's your store overview for today — {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <div className="db-banner-chips">
                            <span className="db-chip db-chip-green">✓ Verified Designer</span>
                            <span className="db-chip db-chip-pink">✦ DesignMart Pro</span>
                        </div>
                    </div>
                    <div className="db-banner-avatar-wrap">
                        <div className="db-banner-avatar">
                            {designer_profile.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="db-banner-avatar-ring" />
                    </div>
                </div>
            </div>

            {/* ══ Stats Grid ══ */}
            <div className="db-stats-grid">
                {stats.map((s, i) => (
                    <div key={i} className="db-stat-card" style={{ '--accent': s.accent, '--light': s.lightBg }}>
                        <div className="db-stat-top">
                            <div className="db-stat-icon" style={{ background: s.lightBg, color: s.iconColor }}>
                                {s.icon}
                            </div>
                            <span className="db-stat-badge" style={{ background: s.lightBg, color: s.iconColor }}>
                                Live
                            </span>
                        </div>
                        <div className="db-stat-value">{s.value}</div>
                        <div className="db-stat-label">{s.label}</div>
                        <div className="db-stat-desc">{s.desc}</div>
                        <div className="db-stat-bar">
                            <div className="db-stat-bar-fill" style={{ background: s.accent }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* ══ Two-column body ══ */}
            <div className="db-body-grid">

                {/* ── Left: Profile Card ── */}
                <div className="db-card db-profile-card">
                    <div className="db-profile-banner" />
                    <div className="db-profile-body">
                        <div className="db-profile-avatar">
                            {designer_profile.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="db-profile-name">{designer_profile.name}</h2>
                        <p className="db-profile-email">{designer_profile.email}</p>
                        <p className="db-profile-phone">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
                            </svg>
                            {designer_profile.phone_number}
                        </p>

                        <div className="db-profile-divider" />

                        <div className="db-profile-stats">
                            <div className="db-ps-item">
                                <span className="db-ps-val">{overview_stats.total_designs}</span>
                                <span className="db-ps-key">Designs</span>
                            </div>
                            <div className="db-ps-sep" />
                            <div className="db-ps-item">
                                <span className="db-ps-val">₹{overview_stats.total_earnings || 0}</span>
                                <span className="db-ps-key">Earned</span>
                            </div>
                            <div className="db-ps-sep" />
                            <div className="db-ps-item">
                                <span className="db-ps-val">{overview_stats.average_rating || '—'}</span>
                                <span className="db-ps-key">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: Performance + Navigation ── */}
                <div className="db-right-col">

                    {/* Performance Card */}
                    <div className="db-card db-perf-card">
                        <div className="db-section-hd">
                            <h3 className="db-section-title">Store Performance</h3>
                            <span className="db-section-tag">Overview</span>
                        </div>

                        <div className="db-perf-list">
                            {[
                                {
                                    label: 'Publish Rate',
                                    value: Math.min(overview_stats.total_designs * 10, 100),
                                    color: '#ec4899',
                                    note: `${overview_stats.total_designs} designs live`,
                                },
                                {
                                    label: 'Order Completion',
                                    value: overview_stats.pending_orders === 0 ? 100 : 60,
                                    color: '#10b981',
                                    note: `${overview_stats.pending_orders} pending`,
                                },
                                {
                                    label: 'Customer Score',
                                    value: overview_stats.average_rating
                                        ? Math.round((overview_stats.average_rating / 5) * 100)
                                        : 0,
                                    color: '#8b5cf6',
                                    note: overview_stats.average_rating ? `${overview_stats.average_rating} / 5 stars` : 'No ratings yet',
                                },
                            ].map((p, i) => (
                                <div key={i} className="db-perf-row">
                                    <div className="db-perf-top">
                                        <span className="db-perf-label">{p.label}</span>
                                        <span className="db-perf-note">{p.note}</span>
                                    </div>
                                    <div className="db-perf-track">
                                        <div
                                            className="db-perf-fill"
                                            style={{ width: `${p.value}%`, background: p.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Cards */}
                    <div className="db-nav-cards">
                        {[
                            {
                                href: '/designer/designs',
                                icon: (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                ),
                                title: 'My Designs',
                                sub: `${overview_stats.total_designs} published`,
                                accent: '#ec4899',
                                bg: 'linear-gradient(135deg, #fdf2f8, #fce7f3)',
                            },
                            {
                                href: '/designer/orders',
                                icon: (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                                    </svg>
                                ),
                                title: 'Manage Orders',
                                sub: `${overview_stats.pending_orders} pending`,
                                accent: '#f59e0b',
                                bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                            },
                            {
                                href: '/designer/upload',
                                icon: (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                ),
                                title: 'Upload Design',
                                sub: 'Add a new creation',
                                accent: '#10b981',
                                bg: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                            },
                        ].map((nav, i) => (
                            <a key={i} href={nav.href} className="db-nav-card" style={{ background: nav.bg }}>
                                <div className="db-nav-icon" style={{ color: nav.accent }}>
                                    {nav.icon}
                                </div>
                                <div>
                                    <p className="db-nav-title" style={{ color: nav.accent }}>{nav.title}</p>
                                    <p className="db-nav-sub">{nav.sub}</p>
                                </div>
                                <svg className="db-nav-arrow" style={{ color: nav.accent }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            </a>
                        ))}
                    </div>

                </div>
            </div>
        </DesignerLayout>
    )
}
