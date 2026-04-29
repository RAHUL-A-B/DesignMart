import { useEffect, useState } from 'react'
import api from '../api/axios'
import DesignerLayout from '../components/DesignerLayout'

const STATUS_META = {
    Pending:    { bg: '#fef3c7', color: '#d97706', dot: '#f59e0b' },
    Processing: { bg: '#dbeafe', color: '#2563eb', dot: '#3b82f6' },
    Shipped:    { bg: '#ede9fe', color: '#7c3aed', dot: '#8b5cf6' },
    Delivered:  { bg: '#d1fae5', color: '#059669', dot: '#10b981' },
    Refunded:   { bg: '#fee2e2', color: '#dc2626', dot: '#ef4444' },
}

export default function DesignerOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)
    const [form, setForm] = useState({})
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('All')

    useEffect(() => {
        api.get('/designers/orders/')
            .then((res) => setOrders(res.data))
            .finally(() => setLoading(false))
    }, [])

    const handleUpdate = async (id) => {
        setUpdating(id)
        try {
            await api.patch(`/designers/orders/${id}/`, form[id] || {})
            const res = await api.get('/designers/orders/')
            setOrders(res.data)
            setForm(prev => { const n = { ...prev }; delete n[id]; return n })
        } catch { alert('Failed to update') }
        finally { setUpdating(null) }
    }

    if (loading) return (
        <DesignerLayout title="Orders" subtitle="Track and fulfill customer orders">
            <div className="dl-spinner-wrap"><div className="dl-spinner" /></div>
        </DesignerLayout>
    )

    const STATUS_TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Refunded']

    const filtered = orders.filter(o => {
        const matchStatus = filterStatus === 'All' || o.status === filterStatus
        const matchSearch = !search || o.design_title?.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search)
        return matchStatus && matchSearch
    })

    const pendingCount = orders.filter(o => o.status === 'Pending').length

    return (
        <DesignerLayout
            title="Orders"
            subtitle={`${orders.length} total order item${orders.length !== 1 ? 's' : ''}${pendingCount ? ` · ${pendingCount} pending` : ''}`}
        >
            {/* ── Summary Chips ── */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                {Object.entries(STATUS_META).map(([status, meta]) => {
                    const count = orders.filter(o => o.status === status).length
                    return (
                        <div key={status} style={{
                            background: meta.bg, borderRadius: 12,
                            padding: '10px 18px', display: 'flex',
                            alignItems: 'center', gap: 8,
                        }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: meta.dot, flexShrink: 0,
                            }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: meta.color }}>
                                {status}
                            </span>
                            <span style={{
                                fontSize: 13, fontWeight: 800, color: meta.color,
                                background: 'rgba(0,0,0,0.06)', borderRadius: 999,
                                padding: '1px 8px',
                            }}>{count}</span>
                        </div>
                    )
                })}
            </div>

            {/* ── Filters Row ── */}
            <div style={{
                background: '#fff', borderRadius: 12, padding: '16px 20px',
                marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
                {/* Search */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: '#f3f4f6', borderRadius: 8, padding: '8px 14px',
                    flex: 1, minWidth: 180,
                }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by order # or title..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%', fontFamily: 'inherit', color: '#111827' }}
                    />
                </div>
                {/* Status tabs */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {STATUS_TABS.map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                cursor: 'pointer', fontWeight: 600, fontSize: 12,
                                fontFamily: 'inherit', transition: 'all 0.2s',
                                background: filterStatus === s ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : '#f3f4f6',
                                color: filterStatus === s ? '#fff' : '#6b7280',
                                boxShadow: filterStatus === s ? '0 3px 10px rgba(236,72,153,0.3)' : 'none',
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Orders List ── */}
            {filtered.length === 0 ? (
                <div className="dl-empty">
                    <span className="dl-empty-icon">📭</span>
                    <h3>No orders found</h3>
                    <p>{search || filterStatus !== 'All' ? 'Try adjusting your filters.' : 'Orders will appear here when customers buy your designs.'}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {filtered.map((item) => {
                        const sc = STATUS_META[item.status] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' }
                        const itemForm = form[item.id] || {}
                        return (
                            <div
                                key={item.id}
                                className="dl-card"
                                style={{ transition: 'all 0.25s ease' }}
                            >
                                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                    {/* Image */}
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <img
                                            src={item.design_details?.image}
                                            alt={item.design_title}
                                            style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 12 }}
                                        />
                                        <span style={{
                                            position: 'absolute', bottom: -6, right: -6,
                                            background: sc.bg, color: sc.color,
                                            padding: '2px 8px', borderRadius: 20,
                                            fontSize: 10, fontWeight: 700,
                                            border: `1.5px solid ${sc.color}22`,
                                        }}>{item.status}</span>
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1, minWidth: 180 }}>
                                        <h3 style={{ fontWeight: 700, color: '#111827', margin: 0, marginBottom: 4, fontSize: '0.975rem' }}>
                                            {item.design_title}
                                        </h3>
                                        <p style={{ color: '#6b7280', fontSize: 13, margin: 0, marginBottom: 8 }}>
                                            Order <strong>#{item.id}</strong> · Price: <strong>₹{item.price}</strong>
                                        </p>
                                        {item.tracking_number && (
                                            <div style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                background: '#f0fdf4', color: '#059669',
                                                padding: '4px 10px', borderRadius: 6,
                                                fontSize: 12, fontWeight: 600,
                                            }}>
                                                📦 {item.tracking_number}
                                            </div>
                                        )}
                                    </div>

                                    {/* Update Form */}
                                    <div style={{
                                        display: 'flex', flexDirection: 'column',
                                        gap: 8, minWidth: 220,
                                    }}>
                                        <select
                                            value={itemForm.status || item.status}
                                            onChange={(e) => setForm(prev => ({ ...prev, [item.id]: { ...prev[item.id], status: e.target.value } }))}
                                            style={{
                                                padding: '9px 12px', borderRadius: 8,
                                                border: '1.5px solid #e5e7eb', fontSize: 13,
                                                outline: 'none', cursor: 'pointer',
                                                background: '#fafafa', fontFamily: 'inherit',
                                                color: '#374151', fontWeight: 500,
                                            }}
                                        >
                                            {['Pending', 'Processing', 'Shipped', 'Delivered'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Enter tracking number"
                                            value={itemForm.tracking_number || item.tracking_number || ''}
                                            onChange={(e) => setForm(prev => ({ ...prev, [item.id]: { ...prev[item.id], tracking_number: e.target.value } }))}
                                            style={{
                                                padding: '9px 12px', borderRadius: 8,
                                                border: '1.5px solid #e5e7eb', fontSize: 13,
                                                outline: 'none', fontFamily: 'inherit',
                                            }}
                                        />
                                        <button
                                            onClick={() => handleUpdate(item.id)}
                                            disabled={updating === item.id}
                                            style={{
                                                padding: '10px', borderRadius: 8, border: 'none',
                                                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                                color: '#fff', fontWeight: 700, fontSize: 13,
                                                cursor: updating === item.id ? 'not-allowed' : 'pointer',
                                                opacity: updating === item.id ? 0.7 : 1,
                                                fontFamily: 'inherit',
                                                boxShadow: '0 3px 10px rgba(236,72,153,0.25)',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={e => { if (updating !== item.id) e.currentTarget.style.transform = 'translateY(-1px)' }}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            {updating === item.id ? '⏳ Updating...' : '✓ Save Update'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </DesignerLayout>
    )
}
