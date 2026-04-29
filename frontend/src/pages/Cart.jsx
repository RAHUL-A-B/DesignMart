import { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import DesignImage from '../components/DesignImage'
import './Cart.css'

export default function Cart() {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { loadCart } = useCart()
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    const getGuestCart = () => {
        const raw = JSON.parse(localStorage.getItem('guest_cart') || '[]')
        // normalize: support both string IDs and {id, qty} objects
        return raw.map(item => typeof item === 'string' ? { id: item, qty: 1 } : item)
    }

    const saveGuestCart = (items) => {
        localStorage.setItem('guest_cart', JSON.stringify(items))
    }

    const fetchCart = async (showLoader = true) => {
        if (showLoader) setLoading(true)
        if (user) {
            try {
                const res = await api.get('/shoppers/cart/')
                setCart(res.data)
            } catch { setCart({ items: [], total_price: 0 }) }
            finally { if (showLoader) setLoading(false) }
        } else {
            const guestItems = getGuestCart()
            if (guestItems.length === 0) {
                setCart({ items: [], total_price: 0 })
                if (showLoader) setLoading(false)
                return
            }
            try {
                const res = await axios.get('http://127.0.0.1:8000/api/designers/content/feed/')
                const allDesigns = res.data
                const items = guestItems.map((g, index) => {
                    const design = allDesigns.find(d => d.id === g.id)
                    return design ? { id: index, design: g.id, design_details: design, quantity: g.qty } : null
                }).filter(Boolean)
                const total = items.reduce((sum, i) => sum + (parseFloat(i.design_details?.price || 0) * i.quantity), 0)
                setCart({ items, total_price: total.toFixed(2) })
            } catch {
                setCart({ items: [], total_price: 0 })
            } finally { if (showLoader) setLoading(false) }
        }
    }

    useEffect(() => { fetchCart(true) }, [])

    const removeItem = async (design_id) => {
        if (user) {
            await api.delete('/shoppers/cart/', { data: { design_id } })
        } else {
            saveGuestCart(getGuestCart().filter(i => i.id !== design_id))
        }
        loadCart()
        fetchCart(false)
    }

    const updateQty = async (design_id, quantity) => {
        if (quantity < 1) return
        if (user) {
            await api.patch('/shoppers/cart/', { design_id, quantity })
        } else {
            const updated = getGuestCart().map(i => i.id === design_id ? { ...i, qty: quantity } : i)
            saveGuestCart(updated)
        }
        fetchCart(false)
    }

    if (loading) return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner"></div>
        </div>
    )

    const items = cart?.items || []

    return (
        <div className="cart-container animate-fade-in">
            <h1 className="page-title" style={{ marginBottom: '32px' }}>🛒 My Cart</h1>

            {!user && (
                <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#92400e' }}>
                    💡 You are shopping as a guest. <Link to="/login" style={{ color: '#d97706', fontWeight: 700 }}>Login</Link> to save your cart permanently.
                </div>
            )}

            {items.length === 0 ? (
                <div className="cart-empty glass-panel">
                    <span className="cart-empty-icon">🛍️</span>
                    <p className="cart-empty-text">Your cart is empty</p>
                    <Link to="/feed" className="btn-primary">Browse Designs</Link>
                </div>
            ) : (
                <div className="cart-items">
                    {items.map((item) => (
                        <div key={item.id} className="cart-item glass-panel">
                            <DesignImage
                                src={item.design_details?.image}
                                alt={item.design_details?.title}
                                className="cart-item-img"
                            />
                            <div className="cart-item-info">
                                <h3 className="cart-item-title">{item.design_details?.title}</h3>
                                <p className="cart-item-price">₹{item.design_details?.price}</p>
                            </div>
                            <div className="qty-controls">
                                <button onClick={() => updateQty(item.design, item.quantity - 1)} className="qty-btn">-</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button onClick={() => updateQty(item.design, item.quantity + 1)} className="qty-btn">+</button>
                            </div>
                            <p className="cart-item-total">₹{(parseFloat(item.design_details?.price) * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeItem(item.design)} className="cart-item-remove">✕</button>
                        </div>
                    ))}

                    <div className="cart-summary glass-panel">
                        <div>
                            <p className="summary-label">Total Amount</p>
                            <p className="summary-total">₹{cart.total_price}</p>
                        </div>
                        {user ? (
                            <button onClick={() => navigate('/checkout')} className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                                Checkout →
                            </button>
                        ) : (
                            <Link to="/login" className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', textDecoration: 'none' }}>
                                Login to Checkout →
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
