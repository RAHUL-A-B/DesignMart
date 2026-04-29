import { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import DesignImage from '../components/DesignImage'
import './Feed.css'

const CATEGORIES = [
    { label: 'All', value: '' },
    { label: 'Women', value: 'WOMEN' },
    { label: 'Men', value: 'MEN' },
    { label: 'Kids', value: 'CHILDREN' },
]

export default function Feed() {
    const { cartIds, addToCart } = useCart()
    const [designs, setDesigns] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeCategory, setActiveCategory] = useState('')
    const [adding, setAdding] = useState(null)

    useEffect(() => {
        setLoading(true)
        const url = activeCategory
            ? `http://127.0.0.1:8000/api/designers/content/feed/?category=${activeCategory}`
            : 'http://127.0.0.1:8000/api/designers/content/feed/'
        axios.get(url)
            .then((res) => setDesigns(res.data))
            .finally(() => setLoading(false))
    }, [activeCategory])

    const handleAddToCart = async (design_id) => {
        if (cartIds.includes(design_id)) return
        setAdding(design_id)
        try {
            await addToCart(design_id)
        } catch (err) {
            alert('Could not add to cart')
        } finally {
            setAdding(null)
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
                        {CATEGORIES.map((cat) => (
                            <span
                                key={cat.value}
                                className={`cat-link ${activeCategory === cat.value ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.value)}
                                style={{ cursor: 'pointer' }}
                            >
                                {cat.label.toUpperCase()}
                            </span>
                        ))}
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
                                <button className="heart-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                                <div className="card-image-wrapper">
                                    <DesignImage
                                        src={d.image}
                                        alt={d.title}
                                        className="card-image"
                                    />
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{d.title}</h3>
                                    <p className="card-subtitle">{d.description}</p>
                                    <div className="card-footer">
                                        <span className="card-price">${d.price}</span>
                                        <span className="card-rating">★★★★☆ 4.8</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAddToCart(d.id)} 
                                        className="card-add-btn"
                                        disabled={cartIds.includes(d.id) || adding === d.id}
                                        style={{ opacity: cartIds.includes(d.id) ? 0.6 : 1, cursor: cartIds.includes(d.id) ? 'not-allowed' : 'pointer' }}
                                    >
                                        {cartIds.includes(d.id) ? '✓ In Cart' : adding === d.id ? 'Adding...' : 'Add to Cart'}
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
