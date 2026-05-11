import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminMessages() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [replyText, setReplyText] = useState({}) // Stores text for each message ID

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = () => {
        api.get('/admin/messages/')
            .then(res => setMessages(res.data))
            .finally(() => setLoading(false))
    }

    const handleSendResponse = async (id) => {
        const response = replyText[id];
        if (!response || response.trim() === "") {
            alert("Please enter a response before sending.");
            return;
        }

        try {
            // This hits your ContactMessageRespondView (UpdateAPIView)
            await api.patch(`/admin/messages/${id}/respond/`, { 
                admin_response: response 
            });
            alert("Response sent successfully via email!");
            setReplyText({ ...replyText, [id]: "" }); // Clear input
            fetchMessages(); // Refresh list to show 'Resolved' status
        } catch (err) {
            console.error("Error sending response:", err);
            alert("Failed to send response.");
        }
    }

    const handleInputChange = (id, value) => {
        setReplyText({ ...replyText, [id]: value });
    }

    return (
        <AdminLayout title="Messages" subtitle="Reply to customer inquiries">
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                {loading ? <p style={{ padding: 20 }}>Loading...</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>Sender</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>Message Details</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>Admin Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((m) => (
                                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{m.name}</div>
                                        <div style={{ fontSize: 12, color: '#6366f1' }}>{m.email}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                            {new Date(m.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                                        <div style={{ fontWeight: 600, color: '#334155' }}>{m.subject}</div>
                                        <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{m.message}</div>
                                        
                                        {m.is_resolved && (
                                            <div style={{ marginTop: 12, padding: 10, background: '#f0fdf4', borderRadius: 8, borderLeft: '4px solid #22c55e' }}>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>YOUR RESPONSE:</div>
                                                <div style={{ fontSize: 13, color: '#15803d' }}>{m.admin_response}</div>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', verticalAlign: 'top', width: '300px' }}>
                                        {m.is_resolved ? (
                                            <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 13 }}>✅ Resolved</span>
                                        ) : (
                                            <div>
                                                <textarea 
                                                    placeholder="Type your reply..."
                                                    value={replyText[m.id] || ""}
                                                    onChange={(e) => handleInputChange(m.id, e.target.value)}
                                                    style={{ width: '100%', borderRadius: 8, border: '1px solid #e2e8f0', padding: 8, fontSize: 13, minHeight: 60, outline: 'none' }}
                                                />
                                                <button 
                                                    onClick={() => handleSendResponse(m.id)}
                                                    style={{ marginTop: 8, width: '100%', background: '#6366f1', color: '#fff', border: 'none', padding: '8px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    Send Email Reply
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    )
}