import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminReviews() {
    const [reviews, setReviews] = useState([])

    const fetchReviews = () => api.get('/admin/reviews/').then((res) => setReviews(res.data))
    useEffect(() => { fetchReviews() }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this review?')) return
        await api.delete(`/admin/reviews/${id}/`)
        fetchReviews()
    }

    return (
        <AdminLayout title="All Reviews" subtitle="Remove abusive or fake reviews">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {reviews.map((r) => (
                    <div key={r.id} style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{r.user_name} → {r.design_title}</p>
                            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6b7280' }}>{r.comment}</p>
                            <div style={{ marginTop: 6 }}>
                                {'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                            </div>
                        </div>
                        <button onClick={() => handleDelete(r.id)}
                            style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </AdminLayout>
    )
}
