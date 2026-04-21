import { useState } from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

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
        <div className="max-w-lg mx-auto px-6 py-16">
            <div className="bg-white rounded-2xl shadow-xl p-10">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout 📦</h1>
                <p className="text-gray-500 mb-8">Enter your shipping details</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-5">
                    {[
                        { key: 'shipping_address', label: 'Shipping Address', placeholder: '123 Main Street' },
                        { key: 'city', label: 'City', placeholder: 'New York' },
                        { key: 'postal_code', label: 'Postal Code', placeholder: '10001' },
                    ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={form[key]}
                                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                required
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Placing Order...' : 'Place Order 🎉'}
                    </button>
                </form>
            </div>
        </div>
    )
}
