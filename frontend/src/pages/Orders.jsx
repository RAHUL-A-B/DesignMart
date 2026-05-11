import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../api/axios'
import './Orders.css'

const statusColor = {
    Pending: 'status-pending',
    Processing: 'status-processing',
    Shipped: 'status-shipped',
    Delivered: 'status-delivered',
    Refunded: 'status-refunded',
}

const TIMELINE_STEPS = [
    { label: 'Pending', desc: 'Order placed successfully', timeOffset: 0 },
    { label: 'Processing', desc: 'Your order is being prepared', timeOffset: 24 * 3600000 },
    { label: 'Shipped', desc: 'Dispatched to courier facility', timeOffset: 48 * 3600000 },
    { label: 'Delivered', desc: 'Package delivered to your address', timeOffset: 72 * 3600000 },
];

const getStatusIndex = (status) => {
    switch (status) {
        case 'Pending': return 0; 
        case 'Processing': return 1; 
        case 'Shipped': return 2; 
        case 'Delivered': return 3;
        case 'Refunded': return -1;
        default: return 0;
    }
}

const getTimelineData = (status, dateStr) => {
    const baseTime = new Date(dateStr).getTime();
    const activeIndex = getStatusIndex(status);

    if (status === 'Refunded') {
        return [
            { label: 'Pending', desc: 'Order placed successfully', dateStr: new Date(baseTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), timeStr: new Date(baseTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(), state: 'completed' },
            { label: 'Refunded', desc: 'Refund processed successfully', dateStr: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }), timeStr: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(), state: 'active' }
        ];
    }

    return TIMELINE_STEPS.map((step, idx) => {
        const stepDate = new Date(baseTime + step.timeOffset);
        
        let state = 'pending';
        if (idx < activeIndex) state = 'completed';
        else if (idx === activeIndex && status !== 'Delivered') state = 'active';
        
        if (status === 'Delivered' && idx <= 3) state = 'completed';

        return {
            ...step,
            dateStr: stepDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            timeStr: stepDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
            state
        }
    });
}

const BoxIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A0AAB2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
        <polyline points="8 5 12 7 16 5"></polyline>
    </svg>
)

export default function Orders() {
    const location = useLocation()
    const [orders, setOrders] = useState([])
    const [trackingOrder, setTrackingOrder] = useState(null)
    const [selectedItemIdx, setSelectedItemIdx] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/shoppers/orders/')
            .then((res) => setOrders(res.data))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (location.state?.trackOrderObj) {
            openTracking(location.state.trackOrderObj, 0)
        }
    }, [location.state?.trackOrderObj])

    const openTracking = async (order, itemIdx = 0) => {
        try {
            const res = await api.get(`/shoppers/orders/${order.id}/track/`)
            setTrackingOrder({ order, data: res.data })
            setSelectedItemIdx(itemIdx) // Set to the specific item you clicked!
        } catch (err) {
            console.error(err)
        }
    }

    const closeTracking = () => setTrackingOrder(null)

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
        </div>
    )

    return (
        <div className="orders-page">
            
            {!trackingOrder ? (
                <>
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
                                    <div className="order-main" style={{ paddingBottom: order.items?.length ? '20px' : '28px' }}>
                                        <div className="order-info">
                                            <p className="order-id">Order #{order.id}</p>
                                            <p className="order-total">₹{order.total_amount}</p>
                                            <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="order-actions">
                                            <span className={`status-badge ${statusColor[order.status] || 'status-default'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* NEW: SHOW ITEMS INSIDE THE ORDER BEFORE TRACKING */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="order-items-list" style={{ padding: '0 32px 28px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#64748b' }}>Items in this order:</h4>
                                            
                                            {order.items.map((item, idx) => (
                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#e2e8f0' }}>
                                                            {item.design_details?.image ? (
                                                                <img src={item.design_details.image} alt={item.design_details.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a' }}>{item.design_details?.title || 'Product'}</h4>
                                                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>₹{item.price}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* TRACK SPECIFIC ITEM BUTTON */}
                                                    <button
                                                        onClick={() => openTracking(order, idx)}
                                                        className="track-btn"
                                                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                                    >
                                                        Track Item
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="tracking-view fade-in">
                    <button className="back-to-orders-btn" onClick={closeTracking}>
                        ← Back to Orders
                    </button>
                    
                    <div className="tracking-header">
                        <h2>Order #{trackingOrder.order.id} Details</h2>
                        <p className="tracking-address">{trackingOrder.data.shipping_address}</p>
                    </div>

                    <div className="tracking-items-container">
                        {/* ONLY RENDER THE SPECIFIC PRODUCT SELECTED! (NO TABS!) */}
                        {trackingOrder.data.items[selectedItemIdx] && (
                            <div key={selectedItemIdx} className="product-tracking-card" style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                                <h3 className="product-title">{trackingOrder.data.items[selectedItemIdx].design}</h3>
                                <p className="product-status">Status: <strong>{trackingOrder.data.items[selectedItemIdx].status}</strong></p>

                                <div className="vertical-timeline">
                                    {getTimelineData(trackingOrder.data.items[selectedItemIdx].status, trackingOrder.order.created_at).map((step, stepIdx) => (
                                        <div key={stepIdx} className={`timeline-item ${step.state}`} style={{ animationDelay: `${stepIdx * 0.15}s` }}>
                                            
                                            <div className="timeline-icon-box">
                                                <BoxIcon />
                                            </div>

                                            <div className="timeline-track">
                                                <div className="timeline-line"></div>
                                                <div className="timeline-dot">
                                                    {step.state === 'active' && <div className="dot-inner"></div>}
                                                </div>
                                            </div>

                                            <div className="timeline-content">
                                                <h4 className="step-title">{step.label}</h4>
                                                <p className="step-time">{step.dateStr}, {step.timeStr}</p>
                                                {step.desc && <p className="step-desc" style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>{step.desc}</p>}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
