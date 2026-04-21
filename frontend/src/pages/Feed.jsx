import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import './Feed.css'

export default function Feed() {
    const { user } = useAuth()
    const [designs, setDesigns] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/designers/content/feed/')
            .then((res) => setDesigns(res.data))
            .finally(() => setLoading(false))
    }, [])

    const addToCart = async (design_id) => {
        try {
            if (user) {
                await api.post('/shoppers/cart/', { design_id })
            } else {
                const cart = JSON.parse(localStorage.getItem('guest_cart') || '[]')
                if (!cart.includes(design_id)) {
                    cart.push(design_id)
                    localStorage.setItem('guest_cart', JSON.stringify(cart))
                }
            }
            alert('Added to cart!')
        } catch (err) {
            alert(err.response?.data?.message || 'Could not add to cart')
        }
    }

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div className="spinner"></div>
        </div>
    )

    return (
        <div className="animate-fade-in">
            {/* Split Hero Section */}
            <div className="hero-section">
                <div className="hero-text-block">
                    <h1 className="hero-title">Jackets for the Modern Man</h1>
                    <p className="hero-subtitle">Discover our exclusive collection of premium designer jackets.</p>
                    <button className="btn-white">Discovery Now</button>
                </div>
                <div className="hero-image-block">
                    {/* Placeholder image resembling Image 2's blue clothing aesthetic */}
                    <img 
                        src="https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                        alt="Hero Jacket" 
                        className="hero-image"
                    />
                </div>
            </div>

            <div className="container">
                {/* Section Header & Category Nav */}
                <div className="new-arrivals-header">
                    <h2 className="section-title">New Arrivals</h2>
                    <div className="category-nav">
                        <span className="cat-link active">WOMEN</span>
                        <span className="cat-link">MEN</span>
                        <span className="cat-link">SHOES</span>
                        <span className="cat-link">BAGS</span>
                        <span className="cat-link">ACCESSORIES</span>
                    </div>
                </div>

                {/* Product Grid */}
                {designs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                        <p style={{ fontSize: '1.2rem' }}>No designs available currently.</p>
                    </div>
                ) : (
                    <div className="feed-grid">
                        {designs.map((d) => (
                            <div key={d.id} className="product-card">
                                <button className="heart-btn">♡</button>
                                <div className="card-image-wrapper">
                                    <img
                                        src={`http://localhost:8000${d.image}`}
                                        alt={d.title}
                                        className="card-image"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' }}
                                    />
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{d.title}</h3>
                                    <p className="card-subtitle">{d.description}</p>
                                    <div className="card-footer">
                                        <span className="card-price">${d.price}</span>
                                        <span className="card-rating">★★★★☆ 4.8</span>
                                    </div>
                                    <button onClick={() => addToCart(d.id)} className="card-add-btn">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Promo Banners */}
                <div className="promo-grid">
                    <div className="promo-box promo-1">
                        <p style={{ fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px', color: 'var(--text-secondary)' }}>ETHEREAL ELEGANCE</p>
                        <h3>Where Dreams Meet Couture</h3>
                        <p>Explore our exclusive designer collection</p>
                        <div>
                            <button className="btn-white" style={{ padding: '8px 24px', fontSize: '0.85rem' }}>Shop Now</button>
                        </div>
                    </div>
                    
                    {/* Background image for promo 2 */}
                    <div className="promo-box promo-2" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80)'}}>
                        <div className="promo-2-inner">
                            <h3>Enchanting Styles For Every Woman</h3>
                            <p>Limited time offer on selected items</p>
                        </div>
                    </div>

                    <div className="promo-box promo-3">
                        <h3>50%</h3>
                        <h4>Summer Sale</h4>
                        <p>Don't miss out on amazing deals</p>
                        <div>
                            <button className="btn-white" style={{ padding: '8px 24px', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>Shop Sale</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
