import { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'
import './Checkout.css'

export default function Checkout() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ shipping_address: '', city: '', postal_code: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCheckout = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const res = await api.post('/shoppers/checkout/', form)
            navigate('/orders')
        } catch (err) {
            setError(err.response?.data?.error || 'Checkout failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="checkout-page">
            <div className="checkout-card">
                <div className="checkout-header">
                    <h1 className="checkout-title">Checkout</h1>
                    <p className="checkout-subtitle">Enter your shipping details below</p>
                </div>

                {error && (
                    <div className="checkout-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleCheckout} className="checkout-form">
                    {[
                        { key: 'shipping_address', label: 'Shipping Address', placeholder: '123 Main Street' },
                        { key: 'city', label: 'City', placeholder: 'New York' },
                        { key: 'postal_code', label: 'Postal Code', placeholder: '10001' },
                    ].map(({ key, label, placeholder }) => (
                        <div key={key} className="form-group">
                            <label className="form-label">{label}</label>
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={form[key]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className="form-input"
                                required
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`checkout-btn ${loading ? 'loading' : ''}`}
                    >
                        {!loading && 'Complete Order'}
                    </button>
                </form>
            </div>
        </div>
    )
}
