import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart, cartIds } = useCart()
    
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [selectedSize, setSelectedSize] = useState('M') 

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/designers/content/feed/')
            .then(res => {
                const data = Array.isArray(res.data) ? res.data : res.data.results || []
                const found = data.find(d => String(d.id) === String(id))
                setProduct(found)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [id])

    const handleAddToCart = async () => {
        if (cartIds.includes(product.id)) return
        setAdding(true)
        try {
            await addToCart(product.id)
        } catch (err) {
            alert('Could not add to cart')
        } finally {
            setAdding(false)
        }
    }

    const handleBuyNow = async () => {
        if (!cartIds.includes(product.id)) {
            setAdding(true)
            try {
                await addToCart(product.id)
            } catch (err) {
                alert('Could not add to cart')
                setAdding(false)
                return
            }
        }
        navigate('/checkout')
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 100 }}>
                <div style={{ width: 40, height: 40, border: '4px solid var(--border-light)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            </div>
        )
    }

    if (!product) {
        return <div style={{ textAlign: 'center', padding: 100, fontSize: '1.2rem', fontWeight: 600 }}>Product not found.</div>
    }

    const inCart = cartIds.includes(product.id)
    const sizes = ['S', 'M', 'L', 'XL', 'XXL']

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            {/* BACK BUTTON */}
            <div style={{ width: '100%', maxWidth: 850, marginBottom: 12 }}>
                <button 
                    onClick={() => navigate(-1)} 
                    style={{ 
                        background: 'none', border: 'none', 
                        color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 600, 
                        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', borderRadius: '30px',
                        transition: 'all 0.2s ease', marginLeft: '-16px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                </button>
            </div>

            {/* MAIN CARD - REDUCED MAX WIDTH */}
            <div style={{ width: '100%', maxWidth: 850, background: 'var(--bg-secondary)', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>
                
                {/* Left Side: Product Image */}
                <div style={{ flex: '1 1 350px', background: '#e2e8f0' }}>
                    <img 
                        src={product.image} 
                        alt={product.title} 
                        style={{ width: '100%', height: '100%', minHeight: 400, objectFit: 'cover' }} 
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80' }}
                    />
                </div>

                {/* Right Side: Product Details - Reduced Padding */}
                <div style={{ flex: '1 1 300px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Tag */}
                    <div style={{ background: 'var(--accent-primary)', color: 'var(--text-inverse)', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, alignSelf: 'flex-start', marginBottom: 16, textTransform: 'uppercase' }}>
                        {product.design_type || 'PARTY'}
                    </div>
                    
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0', lineHeight: 1.2 }}>
                        {product.title}
                    </h1>
                    
                    <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 20px 0' }}>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Designed by <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{product.designer_name}</span>
                        </p>
                        
                        {/* NEW: Message Designer Button */}
                        <button
                            onClick={() => navigate(`/chat/${product.designer}`, {
                                 state: { productTitle: product.title, productImage: product.image }  
                            })}
                            style={{
                                background: 'rgba(139, 92, 246, 0.1)', border: 'none', color: '#8b5cf6',
                                fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '4px 12px', borderRadius: '50px', marginLeft: '12px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Message
                        </button>
                    </div>

                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
                        ₹{product.price}
                    </div>

                    {/* Size Selector */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                            Select Size: <span style={{ color: 'var(--text-secondary)', fontWeight: 500, marginLeft: 4 }}>{selectedSize}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    style={{
                                        width: 36, height: 36, borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                                        background: selectedSize === size ? 'var(--accent-primary)' : 'transparent',
                                        color: selectedSize === size ? 'var(--text-inverse)' : 'var(--text-primary)',
                                        border: `1px solid ${selectedSize === size ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24, flex: 1 }}>
                        {product.description || 'Authentic fashion item perfectly capturing the requested style.'}
                    </p>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 'auto' }}>
                        <button 
                            onClick={handleAddToCart}
                            disabled={inCart || adding}
                            style={{
                                flex: 1, minWidth: 120, padding: '10px 16px', borderRadius: 30, border: '1px solid var(--accent-primary)',
                                background: inCart ? 'var(--bg-main)' : 'var(--bg-secondary)', 
                                color: inCart ? 'var(--success-green)' : 'var(--accent-primary)',
                                fontSize: '0.9rem', fontWeight: 700, cursor: inCart ? 'default' : 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {inCart ? '✓ Added' : adding ? 'Adding...' : 'Add to Cart'}
                        </button>
                        
                        <button 
                            onClick={handleBuyNow}
                            style={{
                                flex: 1, minWidth: 120, padding: '10px 16px', borderRadius: 30, border: 'none',
                                background: 'var(--accent-primary)', 
                                color: 'var(--text-inverse)',
                                fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 4px 10px rgba(255, 90, 67, 0.25)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 14px rgba(255, 90, 67, 0.35)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(255, 90, 67, 0.25)'; }}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
