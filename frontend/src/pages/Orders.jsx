import { useEffect, useState } from 'react'
import api from '../api/axios'

const statusColor = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
    Refunded: 'bg-red-100 text-red-700',
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
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-600"></div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">📦 My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow">
                    <p className="text-6xl mb-4">📭</p>
                    <p className="text-xl text-gray-500">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl shadow overflow-hidden">
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">Order #{order.id}</p>
                                    <p className="text-xl font-bold text-gray-800">${order.total_amount}</p>
                                    <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                    </span>
                                    <button
                                        onClick={() => trackOrder(order.id)}
                                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-sm font-medium transition"
                                    >
                                        {tracking[order.id] ? 'Hide' : 'Track'}
                                    </button>
                                </div>
                            </div>

                            {tracking[order.id] && (
                                <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-3">
                                    <p className="text-sm text-gray-500 mb-3">📍 {tracking[order.id].shipping_address}</p>
                                    {tracking[order.id].items.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                                            <div>
                                                <p className="font-medium text-gray-800">{item.design}</p>
                                                <p className="text-sm text-gray-400">Tracking: {item.tracking_number}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[item.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
