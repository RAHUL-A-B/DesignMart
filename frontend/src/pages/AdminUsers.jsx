import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')

    const fetchUsers = () => {
        const url = filter ? `/admin/users/?role=${filter}` : '/admin/users/'
        api.get(url).then((res) => setUsers(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => { fetchUsers() }, [filter])

    const handleBan = async (id) => {
        await api.patch(`/admin/users/${id}/ban/`)
        fetchUsers()
    }

    const handleApprove = async (id) => {
        await api.patch(`/admin/users/${id}/approve/`)
        fetchUsers()
    }

    return (
        <AdminLayout title="Users" subtitle="Manage all platform users">
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {[{ label: 'All', value: '' }, { label: 'Shoppers', value: 'USER' }, { label: 'Designers', value: 'DESIGNER' }].map((f) => (
                    <button key={f.value} onClick={() => setFilter(f.value)} style={{
                        padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        background: filter === f.value ? '#6366f1' : '#e0e7ff', color: filter === f.value ? '#fff' : '#6366f1'
                    }}>{f.label}</button>
                ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            {['Name', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
                                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#111827' }}>{u.name}</td>
                                <td style={{ padding: '14px 20px', color: '#6b7280', fontSize: 14 }}>{u.phone_number}</td>
                                <td style={{ padding: '14px 20px' }}>
                                    <span style={{ background: u.role === 'DESIGNER' ? '#fdf2f8' : '#eef2ff', color: u.role === 'DESIGNER' ? '#ec4899' : '#6366f1', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{u.role}</span>
                                </td>
                                <td style={{ padding: '14px 20px' }}>
                                    <span style={{ background: u.is_active ? '#d1fae5' : '#fee2e2', color: u.is_active ? '#059669' : '#dc2626', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                        {u.is_active ? 'Active' : 'Banned'}
                                    </span>
                                </td>
                                <td style={{ padding: '14px 20px' }}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        {u.role === 'DESIGNER' && !u.is_active && (
                                            <button onClick={() => handleApprove(u.id)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#d1fae5', color: '#059669', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Approve</button>
                                        )}
                                        <button onClick={() => handleBan(u.id)} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: u.is_active ? '#fee2e2' : '#d1fae5', color: u.is_active ? '#dc2626' : '#059669', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                            {u.is_active ? 'Ban' : 'Unban'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    )
}
