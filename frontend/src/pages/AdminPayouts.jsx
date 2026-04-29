import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminPayouts() {
    const [payouts, setPayouts] = useState([])
    const [designers, setDesigners] = useState([])

    const fetchPayouts = () => api.get('/admin/payouts/').then((res) => setPayouts(res.data))
    const fetchDesigners = () => api.get('/admin/users/?role=DESIGNER').then((res) => setDesigners(res.data))

    useEffect(() => { fetchPayouts(); fetchDesigners() }, [])

    const handleCreate = async (designerId) => {
        await api.post(`/admin/payouts/designers/${designerId}/create/`)
        fetchPayouts()
    }

    const handleMarkPaid = async (payoutId) => {
        await api.patch(`/admin/payouts/${payoutId}/mark-paid/`)
        fetchPayouts()
    }

    return (
        <AdminLayout title="Payouts" subtitle="Manage designer earnings and payouts">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Create Payout */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontWeight: 800, color: '#111827', marginBottom: 16 }}>Create Payout</h3>
                    {designers.map((d) => (
                        <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{d.name}</p>
                                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{d.phone_number}</p>
                            </div>
                            <button onClick={() => handleCreate(d.id)}
                                style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#d1fae5', color: '#059669', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                Create
                            </button>
                        </div>
                    ))}
                </div>

                {/* Payout List */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontWeight: 800, color: '#111827', marginBottom: 16 }}>Payout Records</h3>
                    {payouts.length === 0 ? <p style={{ color: '#6b7280' }}>No payouts yet</p> :
                        payouts.map((p) => (
                            <div key={p.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{p.designer_name}</p>
                                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>₹{p.payout_amount} (after 10% commission)</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <span style={{ background: p.status === 'Paid' ? '#d1fae5' : '#fef3c7', color: p.status === 'Paid' ? '#059669' : '#d97706', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                            {p.status}
                                        </span>
                                        {p.status === 'Pending' && (
                                            <button onClick={() => handleMarkPaid(p.id)}
                                                style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                                                Mark Paid
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </AdminLayout>
    )
}
