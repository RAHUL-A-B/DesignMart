import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import DesignerLayout from '../components/DesignerLayout'

const CATEGORIES = [
    { value: 'WOMEN', label: '👗 Women' },
    { value: 'MEN',   label: '👔 Men' },
    { value: 'SHOES', label: '👟 Shoes' },
    { value: 'BAGS',  label: '👜 Bags' },
    { value: 'ACCESSORIES', label: '💍 Accessories' },
    { value: 'OTHER', label: '✦ Other' },
]

const DESIGN_TYPES = [
    { value: 'TRADITIONAL', label: 'Traditional' },
    { value: 'FORMAL',      label: 'Formal' },
    { value: 'CASUAL',      label: 'Casual' },
    { value: 'PARTY',       label: 'Party' },
    { value: 'SPORTS',      label: 'Sports' },
]

const inputStyle = {
    width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10,
    padding: '12px 14px 12px 38px', fontSize: 14, outline: 'none',
    fontFamily: 'inherit', color: '#111827', background: '#fafafa',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
}

function FormField({ label, required, children }) {
    return (
        <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#374151', marginBottom: 8 }}>
                {label} {required && <span style={{ color: '#ec4899' }}>*</span>}
            </label>
            {children}
        </div>
    )
}

export default function DesignerEditDesign() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [form, setForm]         = useState({ title: '', description: '', price: '', category: 'OTHER', design_type: 'CASUAL' })
    const [existingImg, setExistingImg] = useState(null)
    const [newImage, setNewImage] = useState(null)
    const [preview, setPreview]   = useState(null)
    const [loading, setLoading]   = useState(true)
    const [saving, setSaving]     = useState(false)
    const [error, setError]       = useState('')
    const [success, setSuccess]   = useState(false)
    const [dragOver, setDragOver] = useState(false)

    useEffect(() => {
        api.get(`/designers/content/${id}/`)
            .then(res => {
                const d = res.data
                setForm({
                    title:       d.title       || '',
                    description: d.description || '',
                    price:       d.price       || '',
                    category:    d.category    || 'OTHER',
                    design_type: d.design_type || 'CASUAL',
                })
                setExistingImg(d.image || null)
            })
            .catch(() => setError('Failed to load design. Please check the ID and try again.'))
            .finally(() => setLoading(false))
    }, [id])

    const handleImageChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setNewImage(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSaving(true)
        try {
            const fd = new FormData()
            fd.append('title',       form.title)
            fd.append('description', form.description)
            fd.append('price',       form.price)
            fd.append('category',    form.category)
            fd.append('design_type', form.design_type)
            if (newImage) fd.append('image', newImage)

            await api.patch(`/designers/content/${id}/`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setSuccess(true)
            setTimeout(() => navigate('/designer/designs'), 1400)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save changes. Please try again.')
        } finally { setSaving(false) }
    }

    if (loading) return (
        <DesignerLayout title="Edit Design" subtitle="Loading your design...">
            <div className="dl-spinner-wrap"><div className="dl-spinner" /></div>
        </DesignerLayout>
    )

    const displayImg = preview || existingImg

    return (
        <DesignerLayout title="Edit Design" subtitle="Update your listing details">
            <div style={{ maxWidth: 860, margin: '0 auto' }}>

                {error && (
                    <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: 12, padding: '13px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 500, fontSize: 14 }}>
                        ⚠️ {error}
                    </div>
                )}
                {success && (
                    <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', color: '#15803d', borderRadius: 12, padding: '13px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, fontSize: 14 }}>
                        ✅ Changes saved! Redirecting to your designs...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

                        {/* ══ LEFT: Image + Category ══ */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                            {/* Image Card */}
                            <div style={{ background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#fdf2f8,#faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid #fce7f3', flexShrink: 0 }}>🖼️</div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.92rem', margin: 0 }}>Design Image</p>
                                        <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: 0 }}>PNG, JPG, WEBP · Max 10MB</p>
                                    </div>
                                    {newImage && <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>✓ New</span>}
                                </div>

                                <label
                                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={e => { e.preventDefault(); setDragOver(false); handleImageChange(e.dataTransfer.files[0]) }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `2px dashed ${dragOver ? '#ec4899' : displayImg ? '#8b5cf6' : '#e5e7eb'}`,
                                        borderRadius: 12, cursor: 'pointer', minHeight: 240,
                                        overflow: 'hidden', position: 'relative', transition: 'all 0.25s ease',
                                        background: dragOver ? '#fdf2f8' : displayImg ? '#000' : '#fafafa',
                                    }}
                                >
                                    {displayImg ? (
                                        <>
                                            <img src={displayImg} alt="Preview" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
                                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                                onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                                <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', padding: '9px 18px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.2)' }}>
                                                    🔄 Change Image
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: 32 }}>
                                            <div style={{ fontSize: 38, marginBottom: 10 }}>{dragOver ? '📥' : '📸'}</div>
                                            <p style={{ fontWeight: 700, color: '#374151', margin: 0, fontSize: 14 }}>{dragOver ? 'Drop it here!' : 'Click or drag & drop'}</p>
                                            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>Replace the current image</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={e => handleImageChange(e.target.files[0])} style={{ display: 'none' }} />
                                </label>

                                {newImage && (
                                    <button type="button" onClick={() => { setNewImage(null); setPreview(null) }}
                                        style={{ marginTop: 10, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        ✕ Keep original image
                                    </button>
                                )}
                            </div>

                            {/* Category Card */}
                            <div style={{ background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
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

                            {/* Type Card */}
                            <div style={{ background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', marginTop: 18 }}>
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
                        </div>

                        {/* ══ RIGHT: Form Fields ══ */}
                        <div style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#fdf2f8,#faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid #fce7f3' }}>✏️</div>
                                <div>
                                    <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.92rem', margin: 0 }}>Design Details</p>
                                    <p style={{ fontSize: '0.73rem', color: '#9ca3af', margin: 0 }}>Update your listing information</p>
                                </div>
                            </div>

                            {/* Title */}
                            <FormField label="Title" required>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', display: 'flex' }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="15"/></svg>
                                    </span>
                                    <input type="text" required value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        placeholder="e.g. Luxe Summer Floral Dress"
                                        style={inputStyle}
                                        onFocus={e => e.currentTarget.style.borderColor = '#ec4899'}
                                        onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                    />
                                </div>
                            </FormField>

                            {/* Description */}
                            <FormField label="Description">
                                <textarea value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Describe your design — materials, style, sizing, inspiration..."
                                    rows={6}
                                    style={{ ...inputStyle, padding: '12px 14px', resize: 'vertical', lineHeight: 1.6 }}
                                    onFocus={e => e.currentTarget.style.borderColor = '#ec4899'}
                                    onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                />
                                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' }}>{form.description.length} characters</p>
                            </FormField>

                            {/* Price */}
                            <FormField label="Price (INR)" required>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ position: 'absolute', left: 13, fontWeight: 700, color: '#374151', fontSize: 15, pointerEvents: 'none' }}>₹</span>
                                    <input type="number" required min="0" step="1"
                                        value={form.price}
                                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                        placeholder="0"
                                        style={{ ...inputStyle, paddingLeft: 28, paddingRight: 52 }}
                                        onFocus={e => e.currentTarget.style.borderColor = '#ec4899'}
                                        onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                                    />
                                    <span style={{ position: 'absolute', right: 13, fontSize: 12, fontWeight: 700, color: '#9ca3af', pointerEvents: 'none' }}>INR</span>
                                </div>
                                {form.price && (
                                    <p style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>
                                        Customers will see: <strong style={{ color: '#10b981' }}>₹{parseInt(form.price || 0)}</strong>
                                    </p>
                                )}
                            </FormField>

                            <div style={{ height: 1, background: '#f3f4f6', margin: '8px 0 20px' }} />

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => navigate('/designer/designs')}
                                    style={{ flex: 1, padding: 13, borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#374151', fontFamily: 'inherit', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                                    ← Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    style={{
                                        flex: 2, padding: 13, borderRadius: 10, border: 'none',
                                        background: saving ? '#e5e7eb' : 'linear-gradient(135deg,#ec4899,#8b5cf6)',
                                        color: saving ? '#9ca3af' : '#fff', fontSize: 14, fontWeight: 700,
                                        cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: saving ? 'none' : '0 4px 14px rgba(236,72,153,0.35)',
                                        transition: 'all 0.25s ease',
                                    }}
                                    onMouseEnter={e => { if (!saving) e.currentTarget.style.transform = 'translateY(-1px)' }}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    {saving
                                        ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.15)', borderTopColor: '#9ca3af', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Saving...</>
                                        : '💾 Save Changes'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DesignerLayout>
    )
}
