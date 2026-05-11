import { useEffect, useState } from 'react'
import api from '../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminBanners() {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    
    // States for the form
    const [title, setTitle] = useState('')
    const [image, setImage] = useState(null)
    const [linkUrl, setLinkUrl] = useState('')
    const [editingId, setEditingId] = useState(null) // New state for tracking edit mode

    useEffect(() => {
        fetchBanners()
    }, [])

    const fetchBanners = () => {
        api.get('/admin/banners/')
            .then(res => setBanners(res.data))
            .catch(err => console.error("Error fetching banners:", err))
            .finally(() => setLoading(false))
    }

    // 1. Handle Submit (Creates new OR Updates existing)
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // If creating new, image is required. If editing, it's optional.
        if (!editingId && !image) return alert("Please select an image!")

        const formData = new FormData()
        formData.append('title', title)
        formData.append('link_url', linkUrl)
        
        // Only append the image if the user selected a new one
        if (image) {
            formData.append('image', image)
        }

        try {
            if (editingId) {
                // Update existing banner
                await api.patch(`/admin/banners/${editingId}/`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                alert("Banner updated successfully!")
            } else {
                // Create new banner
                formData.append('is_active', 'true') // Active by default on creation
                await api.post('/admin/banners/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                alert("Banner uploaded successfully!")
            }
            
            resetForm()
            fetchBanners() // Refresh the list
        } catch (err) {
            console.error("Save failed", err)
            alert(editingId ? "Failed to update banner." : "Failed to upload banner.")
        }
    }

    // 2. Setup form for editing
    const handleEditClick = (banner) => {
        setEditingId(banner.id)
        setTitle(banner.title)
        setLinkUrl(banner.link_url || '')
        setImage(null) // Reset file input so it doesn't try to submit an old file object
        const fileInput = document.getElementById('banner-image-upload')
        if (fileInput) fileInput.value = '' 
        
        // Scroll to top so user sees the form
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    // 3. Reset Form
    const resetForm = () => {
        setEditingId(null)
        setTitle('')
        setImage(null)
        setLinkUrl('')
        const fileInput = document.getElementById('banner-image-upload')
        if (fileInput) fileInput.value = '' 
    }

    // 4. Toggle active status
    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/admin/banners/${id}/`, { is_active: !currentStatus })
            fetchBanners() 
        } catch (err) {
            console.error("Toggle failed", err)
            alert("Failed to update status.")
        }
    }

    // 5. Delete banner
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this banner?")) return

        try {
            await api.delete(`/admin/banners/${id}/`)
            if (editingId === id) resetForm() // Clear form if deleting the banner currently being edited
            fetchBanners() 
        } catch (err) {
            console.error("Delete failed", err)
            alert("Failed to delete banner.")
        }
    }

    return (
        <AdminLayout title="Banner Management" subtitle="Upload and control homepage banners">
            
            {/* Form Section */}
            <div style={{ background: '#fff', padding: 24, borderRadius: 20, marginBottom: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, color: '#111827' }}>
                    {editingId ? 'Edit Banner' : 'Upload New Banner'}
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input 
                        type="text" 
                        placeholder="Banner Title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}
                        required
                    />
                    <input 
                        type="url" 
                        placeholder="Link URL (Optional)" 
                        value={linkUrl} 
                        onChange={(e) => setLinkUrl(e.target.value)}
                        style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1, minWidth: '200px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input 
                            id="banner-image-upload"
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setImage(e.target.files[0])}
                            style={{ padding: '8px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            required={!editingId} // Only required if uploading a new banner
                        />
                        {editingId && <small style={{ color: '#64748b', fontSize: '12px' }}>Leave blank to keep current image</small>}
                    </div>
                    
                    <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {editingId ? 'Update Banner' : 'Upload Banner'}
                    </button>
                    
                    {editingId && (
                        <button type="button" onClick={resetForm} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Cancel
                        </button>
                    )}
                </form>
            </div>

            {/* Banner List Section */}
            <div style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                {loading ? (
                    <p style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading banners...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, textTransform: 'uppercase' }}>Image Preview</th>
                                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, textTransform: 'uppercase' }}>Details</th>
                                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 24px', color: '#64748b', fontSize: 13, textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {banners.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No banners uploaded yet.</td></tr>
                            ) : (
                                banners.map(b => (
                                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', background: editingId === b.id ? '#fefce8' : 'transparent' }}>
                                        <td style={{ padding: '16px 24px', verticalAlign: 'top', width: '200px' }}>
                                            <img src={b.image} alt={b.title} style={{ width: '100%', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
                                        </td>
                                        <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>{b.title}</div>
                                            {b.link_url && (
                                                <a href={b.link_url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#6366f1', textDecoration: 'none', display: 'block', marginTop: 4 }}>
                                                    🔗 {b.link_url}
                                                </a>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                                            <button 
                                                onClick={() => handleToggleActive(b.id, b.is_active)}
                                                style={{ 
                                                    background: b.is_active ? '#dcfce7' : '#fee2e2', 
                                                    color: b.is_active ? '#166534' : '#991b1b', 
                                                    border: 'none', 
                                                    padding: '6px 12px', 
                                                    borderRadius: '20px', 
                                                    fontWeight: 'bold', 
                                                    fontSize: '12px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {b.is_active ? '🟢 Active' : '🔴 Hidden'}
                                            </button>
                                        </td>
                                        <td style={{ padding: '16px 24px', verticalAlign: 'top' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button 
                                                    onClick={() => handleEditClick(b)}
                                                    style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(b.id)}
                                                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </AdminLayout>
    )
}