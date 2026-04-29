import { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import DesignerLayout from '../components/DesignerLayout'
import './DesignerDesigns.css'

export default function DesignerDesigns() {
    const [designs, setDesigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)

    const fetchDesigns = () => {
        api.get('/designers/my-designs/')
            .then((res) => setDesigns(res.data))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchDesigns() }, [])

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this design?')) return
        setDeleting(id)
        try {
            await api.delete(`/designers/content/${id}/`)
            setDesigns(designs.filter(d => d.id !== id))
        } catch { alert('Failed to delete design. Please try again.') }
        finally { setDeleting(null) }
    }

    if (loading) return (
        <DesignerLayout title="My Designs" subtitle="Manage your creative portfolio">
            <div className="dl-spinner-wrap"><div className="dl-spinner" /></div>
        </DesignerLayout>
    )

    return (
        <DesignerLayout
            title="My Designs"
            subtitle={`${designs.length} design${designs.length !== 1 ? 's' : ''} in your portfolio`}
        >
            {/* ── Header Row ── */}
            <div className="dds-header">
                <div className="dds-count-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    {designs.length} total
                </div>
                <Link to="/designer/upload" className="dds-upload-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Upload New
                </Link>
            </div>

            {/* ── Empty State ── */}
            {designs.length === 0 ? (
                <div className="dl-empty">
                    <span className="dl-empty-icon">🎨</span>
                    <h3>No designs yet</h3>
                    <p style={{ marginBottom: 24 }}>Upload your first design to start selling</p>
                    <Link to="/designer/upload" className="dds-upload-btn">+ Upload Design</Link>
                </div>
            ) : (
                <div className="dds-grid">
                    {designs.map((d) => (
                        <div key={d.id} className="dds-card">
                            {/* ── Image ── */}
                            <div className="dds-img-wrap">
                                {d.image ? (
                                    <img
                                        src={d.image}
                                        alt={d.title}
                                        className="dds-img"
                                        onError={e => {
                                            e.currentTarget.style.display = 'none'
                                            e.currentTarget.nextSibling.style.display = 'flex'
                                        }}
                                    />
                                ) : null}
                                <div className="dds-img-fallback" style={{ display: d.image ? 'none' : 'flex' }}>
                                    🖼️
                                </div>

                                {/* Badges */}
                                <span className="dds-badge-live">✦ Live</span>
                                <span className="dds-badge-price">
                                    ₹{parseInt(d.price || 0)}
                                </span>

                                {/* Hover overlay */}
                                <div className="dds-overlay">
                                    <Link
                                        to={`/designer/designs/${d.id}/edit`}
                                        className="dds-overlay-btn dds-overlay-edit"
                                    >
                                        ✏️ Edit
                                    </Link>
                                    <button
                                        className="dds-overlay-btn dds-overlay-delete"
                                        onClick={() => handleDelete(d.id)}
                                        disabled={deleting === d.id}
                                    >
                                        {deleting === d.id ? '⏳' : '🗑️'} Delete
                                    </button>
                                </div>
                            </div>

                            {/* ── Info ── */}
                            <div className="dds-info">
                                <h3 className="dds-title">{d.title}</h3>
                                {d.description && (
                                    <p className="dds-desc">{d.description}</p>
                                )}
                                <div className="dds-meta">
                                    {d.category && (
                                        <span className="dds-cat">{d.category}</span>
                                    )}
                                    <span className="dds-price-text">₹{parseInt(d.price || 0)}</span>
                                </div>

                                {/* ── Action Buttons ── */}
                                <div className="dds-actions">
                                    <Link
                                        to={`/designer/designs/${d.id}/edit`}
                                        className="dds-btn dds-btn-edit"
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                        Edit
                                    </Link>
                                    <button
                                        className="dds-btn dds-btn-delete"
                                        onClick={() => handleDelete(d.id)}
                                        disabled={deleting === d.id}
                                    >
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                                        </svg>
                                        {deleting === d.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DesignerLayout>
    )
}
