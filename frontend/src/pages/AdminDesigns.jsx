import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminDesigns() {
    const [designs, setDesigns] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchDesigns = () => api.get('/admin/designs/').then((res) => setDesigns(res.data)).finally(() => setLoading(false))

    useEffect(() => { fetchDesigns() }, [])

    const handleReject = async (id) => {
        const reason = window.prompt('Enter the reason for deleting this design (this will be emailed to the designer):');
        
        if (reason === null) return; // Action cancelled
        if (reason.trim() === '') {
            alert('A reason is required to notify the designer.');
            return;
        }
        
        if (!window.confirm('Are you sure you want to delete this design and notify the designer?')) return;

        try {
            await api.post(`/designs/${id}/reject/`, { reason });
            alert('Design deleted and email successfully sent to the designer.');
            fetchDesigns(); // Refresh the list
        } catch (error) {
            console.error(error);
            alert('Failed to reject design.');
        }
    }

    return (
        <AdminLayout title="All Designs" subtitle="Moderate content across the platform">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {designs.map((d) => (
                    <div key={d.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                        <img src={d.image} alt={d.title} style={{ width: '100%', height: 200, objectFit: 'cover' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' }} />
                        <div style={{ padding: 16 }}>
                            <h3 style={{ fontWeight: 700, color: '#111827', margin: 0, marginBottom: 4 }}>{d.title}</h3>
                            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, marginBottom: 4 }}>By {d.designer_name}</p>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#6366f1', margin: 0, marginBottom: 12 }}>₹{d.price}</p>
                            <button onClick={() => handleReject(d.id)}
                                style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: '#fee2e2', color: '#dc2626', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                                ⚠️ Reject & Notify Designer
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </AdminLayout>
    )
}
