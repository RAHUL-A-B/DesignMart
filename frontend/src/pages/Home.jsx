import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Home() {
    const [designs, setDesigns] = useState([])
    const [banners, setBanners] = useState([])
    
    const { user } = useAuth()
    const { cartIds, addToCart } = useCart()
    const [adding, setAdding] = useState(null)
    
    // Fixed Favorites State: Now persists using localStorage so it doesn't disappear on reload
    const [favorites, setFavorites] = useState(() => {
        const savedFavs = localStorage.getItem('designmart_favorites')
        return savedFavs ? JSON.parse(savedFavs) : []
    })

    // Sync with backend if user is logged in
    useEffect(() => {
        if (user) {
            api.get('/shoppers/favorites/')
                .then(res => {
                    const ids = Array.isArray(res.data) ? res.data.map(d => d.id) : []
                    setFavorites(ids)
                })
                .catch(err => console.error('Failed to load favorites', err))
        }
    }, [user])

    // Automatically save favorites to local storage whenever they change
    useEffect(() => {
        localStorage.setItem('designmart_favorites', JSON.stringify(favorites))
    }, [favorites])

    useEffect(() => {
        // Fetch Designs
        axios.get('http://127.0.0.1:8000/api/designers/content/feed/')
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data.results || []
                setDesigns(data)
            })
            .catch((err) => console.error('Feed error:', err))

        // Fetch active banners
        axios.get('http://127.0.0.1:8000/api/shoppers/banners/active/')
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data.results || []
                setBanners(data)
            })
            .catch((err) => console.error('Banners error:', err))
    }, [])

    const getBannerImage = (image) => {
        if (!image) return ''
        if (image.startsWith('http')) return image
        return `http://127.0.0.1:8000${image}`
    }

    // Toggle favorite status
    const toggleFavorite = async (e, id) => {
        e.preventDefault() 
        e.stopPropagation()
        setFavorites(prev => 
            prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
        )

        // Save to backend if user is logged in
        if (user) {
            try {
                await api.post(`/shoppers/save/${id}/`)
            } catch (err) {
                console.error('Failed to toggle favorite', err)
            }
        }
    }

    // Handle Add to Cart
    const handleAddToCart = async (e, product) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (cartIds.includes(product.id)) return
        
        setAdding(product.id)
        try {
            await addToCart(product.id)
        } catch (err) {
            alert('Could not add to cart')
        } finally {
            setAdding(null)
        }
    }

    const renderBannerContent = (banner) => (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400, maxHeight: 500, display: 'flex', alignItems: 'center' }}>
            <img
                src={getBannerImage(banner.image)}
                alt={banner.title || 'DesignMart banner'}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                }}
            />
            {/* Colorful overlay for readability and aesthetics */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(236,72,153,0.6) 40%, rgba(0,0,0,0) 100%)',
                zIndex: 2
            }}></div>
            
            {/* Left side text */}
            <div style={{
                position: 'relative',
                zIndex: 3,
                marginLeft: '8%',
                maxWidth: '50%',
                textAlign: 'left',
                color: '#fff'
            }}>
                <h2 style={{
                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                    fontWeight: 900,
                    marginBottom: 16,
                    lineHeight: 1.1,
                    textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(90deg, #fff, #fbcfe8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    {banner.title || 'Discover Premium Fashion'}
                </h2>
                <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    fontWeight: 500,
                    marginBottom: 32,
                    color: '#f8fafc',
                    textShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }}>
                    Elevate your wardrobe with exclusive pieces from independent designers. 
                </p>
                <div style={{
                    display: 'inline-block',
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    color: '#fff',
                    padding: '14px 36px',
                    borderRadius: 50,
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    boxShadow: '0 10px 25px rgba(236,72,153,0.4)',
                    transition: 'transform 0.3s, box-shadow 0.3s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(236,72,153,0.5)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(236,72,153,0.4)'
                }}
                >
                    Explore Now
                </div>
            </div>
        </div>
    )

    // Reusable Product Card Component
    const renderProductCard = (d) => {
        const isFav = favorites.includes(d.id)
        const inCart = cartIds.includes(d.id)
        
        return (
            <div key={d.id} style={{
                background: '#fff', borderRadius: 24,
                boxShadow: '0 10px 30px rgba(0,0,0,0.04)', overflow: 'hidden',
                border: '1px solid rgba(226,232,240,0.8)',
                position: 'relative',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => { 
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(236,72,153,0.12)' 
            }}
            onMouseLeave={(e) => { 
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.04)' 
            }}
            >
                {/* Favorite Button */}
                <button 
                    onClick={(e) => toggleFavorite(e, d.id)}
                    style={{
                        position: 'absolute', top: 16, right: 16, zIndex: 10,
                        background: 'rgba(255,255,255,0.9)', border: 'none',
                        borderRadius: '50%', width: 40, height: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(4px)', transition: 'transform 0.2s ease'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill={isFav ? "#ec4899" : "none"} stroke={isFav ? "#ec4899" : "#64748b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'fill 0.3s ease, stroke 0.3s ease' }}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>

                {/* Clickable Image & Title Area */}
                <Link to={`/product/${d.id}`} style={{ textDecoration: 'none' }}>
                    <img
                        src={d.image}
                        alt={d.title}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' }}
                        style={{ width: '100%', height: 280, objectFit: 'cover' }}
                    />
                </Link>
                
                <div style={{ padding: 24 }}>
                    <Link to={`/product/${d.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6, fontSize: '1.15rem' }}>{d.title}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>By <span style={{color: '#8b5cf6', fontWeight: 600}}>{d.designer_name}</span></p>
                    </Link>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#0f172a', fontWeight: 900, fontSize: '1.3rem' }}>₹{d.price}</span>
                        
                        {/* New Add to Cart Button */}
                        <button 
                            onClick={(e) => handleAddToCart(e, d)}
                            disabled={inCart || adding === d.id}
                            style={{
                                background: inCart ? '#d1fae5' : 'linear-gradient(135deg, #ec4899, #8b5cf6)', 
                                color: inCart ? '#059669' : '#fff',
                                padding: '8px 20px', borderRadius: 50, border: 'none',
                                fontSize: '0.9rem', fontWeight: 700, cursor: inCart ? 'not-allowed' : 'pointer',
                                boxShadow: inCart ? 'none' : '0 4px 15px rgba(236,72,153,0.3)',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseDown={(e) => !inCart && (e.currentTarget.style.transform = 'scale(0.95)')}
                            onMouseUp={(e) => !inCart && (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {inCart ? '✓ In Cart' : adding === d.id ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Color palettes for the features section
    const featureColors = [
        { bg: '#fdf4ff', border: '#fae8ff', iconColor: '#d946ef' }, // Pink/Fuchsia
        { bg: '#eff6ff', border: '#dbeafe', iconColor: '#3b82f6' }, // Blue
        { bg: '#f0fdf4', border: '#dcfce7', iconColor: '#22c55e' }, // Green
        { bg: '#fffbeb', border: '#fef3c7', iconColor: '#f59e0b' }, // Amber
    ]

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 60 }}>
            
            {/* Dynamic Banners Section */}
            {banners.length > 0 && (
                <section style={{ padding: '40px 24px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        <div style={{
                            display: 'flex', overflowX: 'auto', gap: 24,
                            scrollSnapType: 'x mandatory', paddingBottom: 16,
                            scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch'
                        }}>
                            <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                            {banners.map(banner => (
                                <div key={banner.id} style={{
                                    flex: '0 0 100%', scrollSnapAlign: 'center',
                                    borderRadius: 24, overflow: 'hidden',
                                    boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
                                    border: '1px solid rgba(226,232,240,0.8)',
                                    background: '#fff', position: 'relative',
                                    height: '400px'
                                }}>
                                    {banner.link_url ? (
                                        <a href={banner.link_url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', height: '100%' }}>
                                            {renderBannerContent(banner)}
                                        </a>
                                    ) : (
                                        <div style={{ display: 'block', height: '100%' }}>{renderBannerContent(banner)}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {banners.length > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                                {banners.map((banner) => (
                                    <span key={`dot-${banner.id}`} style={{ width: 8, height: 8, borderRadius: '50%', background: '#cbd5e1', display: 'inline-block' }} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Home Page Collections */}
            {designs.length > 0 && (
                <section style={{ padding: '40px 24px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }} id="shop">

                        {/* 1. New Arrivals */}
                        <div style={{ marginBottom: 60 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                    <span style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>New</span> Arrivals
                                </h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
                                {designs.slice(0, 8).map(renderProductCard)}
                            </div>
                        </div>

                        {/* 2. Traditional */}
                        {(() => {
                            const traditionalDesigns = designs.filter(d => (d.design_type || 'CASUAL') === 'TRADITIONAL')
                            if (traditionalDesigns.length === 0) return null
                            return (
                                <div style={{ marginBottom: 60 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                            Traditional Collection
                                        </h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
                                        {traditionalDesigns.slice(0, 8).map(renderProductCard)}
                                    </div>
                                </div>
                            )
                        })()}

                        {/* 3. Party */}
                        {(() => {
                            const partyDesigns = designs.filter(d => (d.design_type || 'CASUAL') === 'PARTY')
                            if (partyDesigns.length === 0) return null
                            return (
                                <div style={{ marginBottom: 60 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                                        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                                            Party Collection
                                        </h2>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 32 }}>
                                        {partyDesigns.slice(0, 8).map(renderProductCard)}
                                    </div>
                                </div>
                            )
                        })()}

                    </div>
                </section>
            )}

            {/* Colorful Bento-Style Features */}
            <section style={{ padding: '60px 24px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginBottom: 48 }}>
                        Why Choose DesignMart?
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
                        {[
                            { icon: '🎨', title: 'Unique Designs', desc: 'Exclusive pieces from independent designers you won\'t find anywhere else.' },
                            { icon: '🚚', title: 'Fast Delivery', desc: 'Track your order in real-time from the designer straight to your doorstep.' },
                            { icon: '🔒', title: 'Secure Payments', desc: 'Your transactions are completely safe, encrypted, and protected at every step.' },
                            { icon: '⭐', title: 'Verified Designers', desc: 'All designers on our platform are thoroughly approved and verified by our team.' },
                        ].map((f, index) => (
                            <div key={f.title} style={{
                                background: featureColors[index % 4].bg,
                                border: `2px solid ${featureColors[index % 4].border}`,
                                borderRadius: 28, padding: 36,
                                boxShadow: '0 10px 30px rgba(15,23,42,0.03)', 
                                textAlign: 'left',
                                transition: 'transform 0.3s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ 
                                    fontSize: 36, marginBottom: 20, 
                                    background: '#fff', width: 64, height: 64, 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}>
                                    {f.icon}
                                </div>
                                <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: 12, fontSize: '1.25rem' }}>{f.title}</h3>
                                <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 500 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}
