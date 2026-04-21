import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

const StatCard = ({ icon, label, value, color }) => (
    <div className={`bg-white rounded-2xl shadow p-6 border-l-4 ${color}`}>
        <p className="text-3xl mb-2">{icon}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
)

export default function DesignerDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/designers/dashboard/')
            .then((res) => setData(res.data))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-600"></div>
        </div>
    )

    const { designer_profile, overview_stats } = data

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
                <h1 className="text-3xl font-bold">Welcome back, {designer_profile.name} 👋</h1>
                <p className="text-pink-100 mt-1">{designer_profile.email} · {designer_profile.phone_number}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon="🎨" label="Total Designs" value={overview_stats.total_designs} color="border-pink-500" />
                <StatCard icon="📦" label="Pending Orders" value={overview_stats.pending_orders} color="border-yellow-500" />
                <StatCard icon="💰" label="Total Earnings" value={`$${overview_stats.total_earnings}`} color="border-green-500" />
                <StatCard icon="⭐" label="Avg Rating" value={overview_stats.average_rating} color="border-purple-500" />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { to: '/designer/upload', icon: '➕', label: 'Upload New Design', color: 'bg-pink-600 hover:bg-pink-700' },
                    { to: '/designer/designs', icon: '🖼️', label: 'My Designs', color: 'bg-purple-600 hover:bg-purple-700' },
                    { to: '/designer/orders', icon: '📋', label: 'My Orders', color: 'bg-indigo-600 hover:bg-indigo-700' },
                ].map(({ to, icon, label, color }) => (
                    <Link key={to} to={to} className={`${color} text-white rounded-2xl p-6 text-center font-semibold transition shadow`}>
                        <p className="text-4xl mb-2">{icon}</p>
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    )
}
