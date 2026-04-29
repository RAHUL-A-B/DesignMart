import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from './AdminLayout'

const STATUS_COLORS = {
    Pending:    { bg: '#fef3c7', color: '#d97706' },
    Processing: { bg: '#dbeafe', color: '#2563eb' },
    Shipped:    { bg: '#ede9fe', color: '#7c3aed' },
    Delivered:  { bg: '#d1fae5', color: '#059669' },
    Refunded:   { bg: '#fee2e2', color: '#dc2626' },
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(null)
    const [updating, setUpdating] = useState(null)
    const [itemStatus, setItemStatus] = useState({})

    useEffect(() => {
        api.get('/admin/orders/').then((res) => setOrders(res.data)).finally(() => setLoading(false))
    }, [])

    const handleUpdateItem = async (itemId) => {
        setUpdating(itemId)
        try {
            await api.patch(`/admin/orders/items/${itemId}/`, { status: itemStatus[itemId] })
            const res = await api.get('/admin/orders/')
            setOrders(res.data)
        } catch { alert('Failed to update') }
        finally { setUpdating(null) }
    }

    return (
        <AdminLayout title="All Orders" subtitle="View and manage all platform orders">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map((order) => (
                    <div key={order.id} style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Order #{order.id}</p>
                                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#111827', fontSize: 18 }}>₹{order.total_amount}</p>
                                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>{order.shopper_name} · {order.city}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                <span style={{ fontSize: 13, color: '#6b7280' }}>{new Date(order.created_at).toLocaleDateString()}</span>
                                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                                    style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#eef2ff', color: '#6366f1', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                    {expanded === order.id ? 'Hide' : 'View Items'}
                                </button>
                            </div>
                        </div>

                        {expanded === order.id && (
                            <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 24px', background: '#f8fafc' }}>
                                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>📍 {order.shipping_address}, {order.city}, {order.postal_code}</p>
                                {order.items.map((item) => {
                                    const sc = STATUS_COLORS[item.status] || { bg: '#f3f4f6', color: '#374151' }
                                    return (
                                        <div key={item.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{item.design_title}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>By {item.designer_name} · ₹{item.price}</p>
                                            </div>
                                            <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{item.status}</span>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <select value={itemStatus[item.id] || item.status}
                                                    onChange={(e) => setItemStatus(prev => ({ ...prev, [item.id]: e.target.value }))}
                                                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none' }}>
                                                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Refunded'].map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => handleUpdateItem(item.id)} disabled={updating === item.id}
                                                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                                    {updating === item.id ? '...' : 'Update'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    )
}
