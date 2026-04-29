import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [favorites, setFavorites] = useState([])
    const [tab, setTab] = useState('orders')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            api.get('/shoppers/orders/'),
            api.get('/shoppers/favorites/')
        ]).then(([ordersRes, favRes]) => {
            setOrders(ordersRes.data)
            setFavorites(favRes.data)
        }).finally(() => setLoading(false))
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const STATUS_COLORS = {
        Pending:    { bg: '#fef3c7', color: '#d97706' },
        Processing: { bg: '#dbeafe', color: '#2563eb' },
        Shipped:    { bg: '#ede9fe', color: '#7c3aed' },
        Delivered:  { bg: '#d1fae5', color: '#059669' },
        Refunded:   { bg: '#fee2e2', color: '#dc2626' },
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 24, padding: '32px', color: '#fff', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800 }}>
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>{user?.name}</h1>
                    <p style={{ margin: '4px 0 0', opacity: 0.85, fontSize: 14 }}>{user?.phone_number}</p>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginTop: 8, display: 'inline-block' }}>
                        {user?.role === 'USER' ? '🛍️ Shopper' : user?.role === 'DESIGNER' ? '🎨 Designer' : '⚙️ Admin'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {user?.role === 'DESIGNER' && (
                        <Link to="/designer/dashboard" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                            🎨 Dashboard
                        </Link>
                    )}
                    {(user?.role === 'ADMIN' || user?.is_staff) && (
                        <Link to="/admin/dashboard" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                            ⚙️ Admin Panel
                        </Link>
                    )}
                    <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '10px 20px', borderRadius: 12, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                        Log Out
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[
                    { key: 'orders', label: '📦 My Orders', count: orders.length },
                    { key: 'favorites', label: '❤️ Favorites', count: favorites.length },
                ].map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: 14,
                        background: tab === t.key ? '#6366f1' : '#e0e7ff',
                        color: tab === t.key ? '#fff' : '#6366f1'
                    }}>
                        {t.label} ({t.count})
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ width: 40, height: 40, border: '4px solid #e0e7ff', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
                </div>
            ) : tab === 'orders' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <p style={{ fontSize: 48, marginBottom: 12 }}>📭</p>
                            <p style={{ color: '#6b7280', fontSize: 16 }}>No orders yet</p>
                            <Link to="/feed" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Start Shopping →</Link>
                        </div>
                    ) : orders.map((order) => (
                        <div key={order.id} style={{ background: '#fff', borderRadius: 20, padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Order #{order.id} · {new Date(order.created_at).toLocaleDateString()}</p>
                                    <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#111827', fontSize: 20 }}>₹{order.total_amount}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>{order.items?.length} item(s)</p>
                                </div>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <span style={{ background: STATUS_COLORS[order.status]?.bg || '#f3f4f6', color: STATUS_COLORS[order.status]?.color || '#374151', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                                        {order.status}
                                    </span>
                                    <Link to="/orders" style={{ background: '#eef2ff', color: '#6366f1', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 13 }}>
                                        Track
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                    {favorites.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <p style={{ fontSize: 48, marginBottom: 12 }}>❤️</p>
                            <p style={{ color: '#6b7280', fontSize: 16 }}>No favorites yet</p>
                            <Link to="/feed" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Browse Designs →</Link>
                        </div>
                    ) : favorites.map((d) => (
                        <div key={d.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                            <img src={d.image} alt={d.title} style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' }} />
                            <div style={{ padding: 12 }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: 14 }}>{d.title}</p>
                                <p style={{ margin: '4px 0 0', color: '#6366f1', fontWeight: 700 }}>₹{d.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
