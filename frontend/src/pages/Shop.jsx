import { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'

const CATEGORIES = [
    { label: 'All', value: '' },
    { label: '👗 Women', value: 'WOMEN' },
    { label: '👔 Men', value: 'MEN' },
    { label: '🧒 Kids', value: 'CHILDREN' },
]

export default function Shop() {
    const [designs, setDesigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState('')
    const [search, setSearch] = useState('')
    const [adding, setAdding] = useState(null)
    const { cartIds, addToCart } = useCart()

    useEffect(() => {
        setLoading(true)
        const url = category
            ? `http://127.0.0.1:8000/api/designers/content/feed/?category=${category}`
            : 'http://127.0.0.1:8000/api/designers/content/feed/'
        axios.get(url)
            .then((res) => setDesigns(Array.isArray(res.data) ? res.data : res.data.results || []))
            .finally(() => setLoading(false))
    }, [category])

    const handleAddToCart = async (design_id) => {
        if (cartIds.includes(design_id)) return
        setAdding(design_id)
        try { await addToCart(design_id) }
        catch { alert('Could not add to cart') }
        finally { setAdding(null) }
    }

    const filtered = designs.filter(d =>
        d.title?.toLowerCase().includes(search.toLowerCase()) ||
        d.designer_name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 36, fontWeight: 800, color: '#111827', margin: 0 }}>Shop All Designs</h1>
                <p style={{ color: '#6b7280', marginTop: 8 }}>{filtered.length} designs available</p>
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="🔍 Search designs or designers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e5e7eb', outline: 'none', fontSize: 15 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                    {CATEGORIES.map((cat) => (
                        <button key={cat.value} onClick={() => setCategory(cat.value)} style={{
                            padding: '10px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                            background: category === cat.value ? '#ec4899' : '#f3f4f6',
                            color: category === cat.value ? '#fff' : '#374151'
                        }}>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
                    <div style={{ width: 48, height: 48, border: '4px solid #f3f4f6', borderTop: '4px solid #ec4899', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ fontSize: 64, marginBottom: 16 }}>🎨</p>
                    <p style={{ fontSize: 20, color: '#6b7280' }}>No designs found</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
                    {filtered.map((d) => {
                        const inCart = cartIds.includes(d.id)
                        return (
                            <div key={d.id} style={{ background: '#fff', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)' }}>
                                <div style={{ position: 'relative', overflow: 'hidden' }}>
                                    <img
                                        src={d.image}
                                        alt={d.title}
                                        style={{ width: '100%', height: 240, objectFit: 'cover' }}
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80' }}
                                    />
                                    <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                                        {d.category || 'Fashion'}
                                    </span>
                                </div>
                                <div style={{ padding: 20 }}>
                                    <h3 style={{ fontWeight: 700, color: '#111827', margin: 0, marginBottom: 4, fontSize: 17 }}>{d.title}</h3>
                                    <p style={{ color: '#6b7280', fontSize: 13, margin: 0, marginBottom: 4 }}>By {d.designer_name}</p>
                                    <p style={{ color: '#9ca3af', fontSize: 13, margin: 0, marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.description}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#ec4899', fontWeight: 800, fontSize: 20 }}>₹{d.price}</span>
                                        <button
                                            onClick={() => handleAddToCart(d.id)}
                                            disabled={inCart || adding === d.id}
                                            style={{
                                                padding: '10px 20px', borderRadius: 12, border: 'none',
                                                fontWeight: 700, fontSize: 14, cursor: inCart ? 'not-allowed' : 'pointer',
                                                background: inCart ? '#d1fae5' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                                                color: inCart ? '#059669' : '#fff',
                                                transition: 'all 0.2s'
                                            }}>
                                            {inCart ? '✓ In Cart' : adding === d.id ? 'Adding...' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
