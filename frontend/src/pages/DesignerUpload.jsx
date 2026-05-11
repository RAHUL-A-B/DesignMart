import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useNavigate, useParams } from 'react-router-dom'
import DesignerLayout from '../components/DesignerLayout'
import './DesignerUpload.css'

const CATEGORIES = [
    { value: 'WOMEN',       label: '👗 Women' },
    { value: 'MEN',         label: '👔 Men' },
    { value: 'CHILDREN',    label: '👶 Children' },
]

const DESIGN_TYPES = [
    { value: 'TRADITIONAL', label: 'Traditional' },
    { value: 'FORMAL',      label: 'Formal' },
    { value: 'CASUAL',      label: 'Casual' },
    { value: 'PARTY',       label: 'Party' },
    { value: 'SPORTS',      label: 'Sports' },
]

export default function DesignerUpload() {
    const navigate   = useNavigate()
    const { id }     = useParams()           // present only on edit route
    const isEdit     = Boolean(id)

    const [form, setForm]       = useState({ title: '', description: '', price: '', category: 'WOMEN', design_type: 'CASUAL' })
    const [image, setImage]     = useState(null)
    const [preview, setPreview] = useState(null)  // new file preview
    const [existingImg, setExistingImg] = useState(null) // loaded from server
    const [loading, setLoading] = useState(isEdit)       // true while fetching on edit
    const [saving, setSaving]   = useState(false)
    const [error, setError]     = useState('')
    const [success, setSuccess] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const [step, setStep]       = useState(isEdit ? 2 : 1)

    /* ── Load existing data when editing ── */
    useEffect(() => {
        if (!isEdit) return
        api.get(`/designers/content/${id}/`)
            .then(res => {
                const d = res.data
                setForm({
                    title:       d.title       || '',
                    description: d.description || '',
                    price:       d.price       || '',
                    category:    d.category    || 'WOMEN',
                    design_type: d.design_type || 'CASUAL',
                })
                setExistingImg(d.image || null)
            })
            .catch(() => setError('Could not load design data. Please go back and try again.'))
            .finally(() => setLoading(false))
    }, [id, isEdit])

    const handleImageChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setImage(file)
            setPreview(URL.createObjectURL(file))
            if (!isEdit) setStep(2)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!isEdit && !image) { setError('Please select a design image before publishing.'); return }
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('title',       form.title)
            fd.append('description', form.description)
            fd.append('price',       form.price)
            fd.append('category',    form.category)
            fd.append('design_type', form.design_type)
            if (image) fd.append('image', image)

            if (isEdit) {
                await api.patch(`/designers/content/${id}/`, fd)
            } else {
                await api.post('/designers/content/add/', fd)
            }
            setSuccess(true)
            setTimeout(() => navigate('/designer/designs'), 1200)
        } catch (err) {
            setError(err.response?.data?.error || `Failed to ${isEdit ? 'save changes' : 'upload design'}. Please try again.`)
        } finally { setSaving(false) }
    }

    if (loading) return (
        <DesignerLayout title="Edit Design" subtitle="Loading your design...">
            <div className="dl-spinner-wrap"><div className="dl-spinner" /></div>
        </DesignerLayout>
    )

    const displayImg = preview || existingImg

    return (
        <DesignerLayout
            title={isEdit ? 'Edit Design' : 'Upload New Design'}
            subtitle={isEdit ? 'Update your listing details' : 'Share your creation with the world'}
        >

                {/* ── Step Indicator (create only) ── */}
                {!isEdit && (
                    <div className="up-hero" style={{ marginBottom: 24 }}>
                        <div className="up-hero-steps">
                            {[
                                { n: 1, label: 'Choose Image' },
                                { n: 2, label: 'Add Details' },
                                { n: 3, label: 'Publish' },
                            ].map((s, i, arr) => (
                                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                    <div className={`up-step ${step >= s.n ? 'up-step-done' : ''}`}>
                                        <span className="up-step-num">{s.n}</span>
                                        <span className="up-step-label">{s.label}</span>
                                    </div>
                                    {i < arr.length - 1 && <div className="up-step-line" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Edit mode badge ── */}
                {isEdit && (
                    <div style={{
                        background: 'linear-gradient(135deg,#fdf2f8,#faf5ff)',
                        border: '1.5px solid #fce7f3', borderRadius: 12,
                        padding: '12px 18px', marginBottom: 20,
                        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#9d174d', fontWeight: 600,
                    }}>
                        ✏️ You are editing an existing design. Update the fields below and click <strong>"Save Changes"</strong>.
                    </div>
                )}

                {/* ── Error / Success ── */}
                {error && (
                    <div className="up-error">⚠️ {error}</div>
                )}
                {success && (
                    <div style={{
                        background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d',
                        borderRadius: 12, padding: '13px 18px', marginBottom: 20,
                        display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14,
                    }}>
                        ✅ {isEdit ? 'Changes saved!' : 'Design published!'} Redirecting to your designs...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="up-grid">

                        {/* ══ LEFT: Image + Category ══ */}
                        <div className="up-col-left">
                            <div className="up-card up-image-card">
                                <div className="up-card-header">
                                    <div className="up-card-icon">📸</div>
                                    <div>
                                        <h3 className="up-card-title">Design Image</h3>
                                        <p className="up-card-sub">PNG, JPG, WEBP · Max 10MB</p>
                                    </div>
                                    {isEdit && image && <span className="up-badge-ok">✓ New Image</span>}
                                    {!isEdit && image && <span className="up-badge-ok">✓ Ready</span>}
                                </div>

                                <label
                                    className={`up-dropzone ${dragOver ? 'up-dropzone-over' : ''} ${displayImg ? 'up-dropzone-filled' : ''}`}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); handleImageChange(e.dataTransfer.files[0]) }}
                                >
                                    {displayImg ? (
                                        <>
                                            <img src={displayImg} alt="Preview" className="up-preview-img" />
                                            <div className="up-preview-overlay">
                                                <div className="up-preview-change">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                                    </svg>
                                                    {isEdit ? 'Replace Image' : 'Change Image'}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="up-dropzone-inner">
                                            <div className={`up-drop-icon ${dragOver ? 'up-drop-icon-bounce' : ''}`}>
                                                {dragOver ? (
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                                    </svg>
                                                ) : (
                                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                                    </svg>
                                                )}
                                            </div>
                                            <p className="up-drop-title">{dragOver ? 'Drop it here!' : 'Drag & drop your image'}</p>
                                            <p className="up-drop-or">— or —</p>
                                            <span className="up-drop-btn">Browse Files</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={e => handleImageChange(e.target.files[0])} style={{ display: 'none' }} />
                                </label>

                                {image && (
                                    <button type="button" className="up-remove-btn"
                                        onClick={() => { setImage(null); setPreview(null); if (!isEdit) setStep(1) }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        {isEdit ? 'Keep original image' : 'Remove image'}
                                    </button>
                                )}
                            </div>

                            {/* Category Selector */}
                            <div className="up-card up-tips-card" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#374151', marginBottom: 12 }}>
                                    Category
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {CATEGORIES.map(cat => (
                                        <button key={cat.value} type="button"
                                            onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                                            style={{
                                                padding: '9px 10px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                                                border: `1.5px solid ${form.category === cat.value ? '#ec4899' : '#e5e7eb'}`,
                                                background: form.category === cat.value ? '#fdf2f8' : '#fafafa',
                                                color: form.category === cat.value ? '#ec4899' : '#6b7280',
                                                fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                                                transition: 'all 0.2s ease',
                                            }}>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type Selector */}
                            <div className="up-card up-tips-card" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', marginTop: 20 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#374151', marginBottom: 12 }}>
                                    Design Type
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {DESIGN_TYPES.map(type => (
                                        <button key={type.value} type="button"
                                            onClick={() => setForm(f => ({ ...f, design_type: type.value }))}
                                            style={{
                                                padding: '7px 12px', borderRadius: 20, cursor: 'pointer',
                                                border: `1.5px solid ${form.design_type === type.value ? '#8b5cf6' : '#e5e7eb'}`,
                                                background: form.design_type === type.value ? '#f3e8ff' : '#fafafa',
                                                color: form.design_type === type.value ? '#8b5cf6' : '#6b7280',
                                                fontWeight: 600, fontSize: 12, fontFamily: 'inherit',
                                                transition: 'all 0.2s ease',
                                            }}>
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tips (create only) */}
                            {!isEdit && (
                                <div className="up-card up-tips-card">
                                    <h4 className="up-tips-title"><span>💡</span> Tips for a great listing</h4>
                                    <ul className="up-tips-list">
                                        {[
                                            { icon: '🖼️', text: 'Use high-res images (min 1000×1000px)' },
                                            { icon: '✍️', text: 'Write a clear, keyword-rich title' },
                                            { icon: '📝', text: 'Include fabric, fit & care in description' },
                                            { icon: '💰', text: 'Price fairly — check similar designs' },
                                        ].map((tip, i) => (
                                            <li key={i} className="up-tip-item">
                                                <span className="up-tip-icon">{tip.icon}</span>
                                                <span>{tip.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* ══ RIGHT: Form Fields ══ */}
                        <div className="up-col-right">
                            <div className="up-card up-form-card">
                                <div className="up-card-header" style={{ marginBottom: 24 }}>
                                    <div className="up-card-icon">{isEdit ? '✏️' : '📋'}</div>
                                    <div>
                                        <h3 className="up-card-title">{isEdit ? 'Edit Details' : 'Design Details'}</h3>
                                        <p className="up-card-sub">{isEdit ? 'Update your listing information' : 'Fill in the information for your listing'}</p>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="up-field">
                                    <label className="up-label">Design Title <span className="up-required">*</span></label>
                                    <div className="up-input-wrap">
                                        <svg className="up-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="15"/>
                                        </svg>
                                        <input type="text" className="up-input" required
                                            placeholder="e.g. Luxe Summer Floral Dress"
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            onFocus={e => e.currentTarget.style.borderColor = '#ec4899'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="up-field">
                                    <label className="up-label">Description</label>
                                    <div className="up-textarea-wrap">
                                        <textarea className="up-textarea" rows={5}
                                            placeholder="Describe your design — materials, style, sizing, inspiration..."
                                            value={form.description}
                                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            onFocus={e => e.currentTarget.style.borderColor = '#ec4899'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                        />
                                    </div>
                                    <p className="up-field-hint">{form.description.length} / 500 characters</p>
                                </div>

                                {/* Price */}
                                <div className="up-field">
                                    <label className="up-label">Price (INR) <span className="up-required">*</span></label>
                                    <div className="up-input-wrap">
                                        <span className="up-price-prefix">₹</span>
                                        <input type="number" className="up-input up-input-price"
                                            required min="0" step="1" placeholder="0"
                                            value={form.price}
                                            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                            onFocus={e => e.currentTarget.style.borderColor = '#ec4899'}
                                            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                        />
                                        <span className="up-price-suffix">INR</span>
                                    </div>
                                    {form.price && (
                                        <p className="up-price-preview">
                                            Customers will see: <strong>₹{parseInt(form.price || 0)}</strong>
                                        </p>
                                    )}
                                </div>

                                <div className="up-divider" />

                                {/* Actions */}
                                <div className="up-actions">
                                    <button type="button" className="up-btn-cancel"
                                        onClick={() => navigate('/designer/designs')}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className={`up-btn-publish ${saving ? 'up-btn-loading' : ''}`}>
                                        {saving ? (
                                            <><span className="up-btn-spinner" /> {isEdit ? 'Saving...' : 'Publishing...'}</>
                                        ) : (
                                            <>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    {isEdit
                                                        ? <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>
                                                        : <><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></>
                                                    }
                                                </svg>
                                                {isEdit ? 'Save Changes' : 'Publish Design'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Live Preview Card */}
                            {displayImg && (
                                <div className="up-card up-preview-card">
                                    <h4 className="up-tips-title" style={{ marginBottom: 14 }}>
                                        <span>👁️</span> Listing Preview
                                    </h4>
                                    <div className="up-listing-preview">
                                        <img src={displayImg} alt="Preview" className="up-listing-thumb" />
                                        <div className="up-listing-info">
                                            <p className="up-listing-name">{form.title || 'Untitled Design'}</p>
                                            <p className="up-listing-desc">{form.description || 'No description yet...'}</p>
                                            <p className="up-listing-price">
                                                {form.price ? `₹${parseInt(form.price)}` : '₹0'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
        </DesignerLayout>
    )
}
