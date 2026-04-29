import { useEffect, useState } from 'react'
import api from '../api/axios'
import './Orders.css'

const statusColor = {
    Pending: 'status-pending',
    Processing: 'status-processing',
    Shipped: 'status-shipped',
    Delivered: 'status-delivered',
    Refunded: 'status-refunded',
}

export default function Orders() {
    const [orders, setOrders] = useState([])
    const [tracking, setTracking] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/shoppers/orders/')
            .then((res) => setOrders(res.data))
            .finally(() => setLoading(false))
    }, [])

    const trackOrder = async (order_id) => {
        if (tracking[order_id]) {
            setTracking((prev) => { const n = { ...prev }; delete n[order_id]; return n })
            return
        }
        const res = await api.get(`/shoppers/orders/${order_id}/track/`)
        setTracking((prev) => ({ ...prev, [order_id]: res.data }))
    }

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    )

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h1 className="orders-title">My Orders</h1>
            </div>

            {orders.length === 0 ? (
                <div className="orders-empty">
                    <p className="empty-icon">📭</p>
                    <p className="empty-text">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-main">
                                <div className="order-info">
                                    <p className="order-id">Order #{order.id}</p>
                                    <p className="order-total">₹{order.total_amount}</p>
                                    <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="order-actions">
                                    <span className={`status-badge ${statusColor[order.status] || 'status-default'}`}>
                                        {order.status}
                                    </span>
                                    <button
                                        onClick={() => trackOrder(order.id)}
                                        className="track-btn"
                                    >
                                        {tracking[order.id] ? 'Hide Details' : 'Track Order'}
                                    </button>
                                </div>
                            </div>

                            {tracking[order.id] && (
                                <div className="tracking-details">
                                    <p className="shipping-address">
                                        <span>📍</span> {tracking[order.id].shipping_address}
                                    </p>
                                    <div className="tracking-items">
                                        {tracking[order.id].items.map((item, i) => (
                                            <div key={i} className="tracking-item">
                                                <div>
                                                    <p className="item-name">{item.design}</p>
                                                    <p className="item-tracking">Tracking: {item.tracking_number || 'N/A'}</p>
                                                </div>
                                                <span className={`status-badge ${statusColor[item.status] || 'status-default'}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
