import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import './Cart.css'

export default function Cart() {
    const [cart, setCart] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    const fetchCart = () => {
        api.get('/shoppers/cart/')
            .then((res) => setCart(res.data))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchCart() }, [])

    const removeItem = async (design_id) => {
        await api.delete('/shoppers/cart/', { data: { design_id } })
        fetchCart()
    }

    const updateQty = async (design_id, quantity) => {
        if (quantity < 1) return
        await api.patch('/shoppers/cart/', { design_id, quantity })
        fetchCart()
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

            {items.length === 0 ? (
                <div className="cart-empty glass-panel">
                    <span className="cart-empty-icon">🛍️</span>
                    <p className="cart-empty-text">Your cart is empty</p>
                    <Link to="/feed" className="btn-primary">
                        Browse Designs
                    </Link>
                </div>
            ) : (
                <div className="cart-items">
                    {items.map((item) => (
                        <div key={item.id} className="cart-item glass-panel">
                            <img
                                src={`http://localhost:8000${item.design_details?.image}`}
                                alt={item.design_details?.title}
                                className="cart-item-img"
                            />
                            <div className="cart-item-info">
                                <h3 className="cart-item-title">{item.design_details?.title}</h3>
                                <p className="cart-item-price">${item.design_details?.price}</p>
                            </div>
                            <div className="qty-controls">
                                <button onClick={() => updateQty(item.design, item.quantity - 1)} className="qty-btn">-</button>
                                <span className="qty-value">{item.quantity}</span>
                                <button onClick={() => updateQty(item.design, item.quantity + 1)} className="qty-btn">+</button>
                            </div>
                            <p className="cart-item-total">${(item.design_details?.price * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeItem(item.design)} className="cart-item-remove">✕</button>
                        </div>
                    ))}

                    <div className="cart-summary glass-panel">
                        <div>
                            <p className="summary-label">Total Amount</p>
                            <p className="summary-total">${cart.total_price}</p>
                        </div>
                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-primary"
                            style={{ padding: '16px 32px', fontSize: '1.1rem' }}
                        >
                            Checkout →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
