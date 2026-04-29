import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Home() {
    const [designs, setDesigns] = useState([])

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/designers/content/feed/')
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data.results || []
                setDesigns(data.slice(0, 4))
            })
            .catch((err) => console.error('Feed error:', err))
    }, [])

    return (
        <div>
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '60px 24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background circles */}
                <div style={{
                    position: 'absolute', width: 400, height: 400,
                    borderRadius: '50%', background: 'rgba(219,39,119,0.15)',
                    top: -100, right: -100
                }} />
                <div style={{
                    position: 'absolute', width: 300, height: 300,
                    borderRadius: '50%', background: 'rgba(124,58,237,0.15)',
                    bottom: -80, left: -80
                }} />

                <div style={{ position: 'relative', zIndex: 1, maxWidth: 700 }}>
                    <span style={{
                        background: 'rgba(219,39,119,0.2)', color: '#f472b6',
                        padding: '6px 16px', borderRadius: 20, fontSize: 13,
                        fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase'
                    }}>
                        New Collection 2026
                    </span>
                    <h1 style={{
                        color: '#fff', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: 800, lineHeight: 1.1, margin: '24px 0 20px'
                    }}>
                        Discover Unique<br />
                        <span style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Designer Fashion
                        </span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: 40, lineHeight: 1.7 }}>
                        Shop exclusive designs from talented independent designers.<br />
                        Find your style, support creativity.
                    </p>
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/feed" style={{
                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                            color: '#fff', padding: '14px 36px', borderRadius: 50,
                            fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                            boxShadow: '0 8px 32px rgba(236,72,153,0.4)'
                        }}>
                            Shop Now →
                        </Link>
                        <Link to="/register" style={{
                            background: 'rgba(255,255,255,0.1)', color: '#fff',
                            padding: '14px 36px', borderRadius: 50,
                            fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            Become a Designer
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: 48 }}>
                        Why DesignMart?
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                        {[
                            { icon: '🎨', title: 'Unique Designs', desc: 'Exclusive pieces from independent designers you won\'t find anywhere else.' },
                            { icon: '🚚', title: 'Fast Delivery', desc: 'Track your order in real-time from designer to your doorstep.' },
                            { icon: '🔒', title: 'Secure Payments', desc: 'Your transactions are safe and protected at every step.' },
                            { icon: '⭐', title: 'Verified Designers', desc: 'All designers are approved and verified by our team.' },
                        ].map((f) => (
                            <div key={f.title} style={{
                                background: '#fff', borderRadius: 20, padding: 32,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                                <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>{f.title}</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Designs */}
            {designs.length > 0 && (
                <section style={{ padding: '80px 24px', background: '#fff' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>Latest Designs</h2>
                            <Link to="/feed" style={{ color: '#ec4899', fontWeight: 600, textDecoration: 'none' }}>View All →</Link>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                            {designs.map((d) => (
                                <div key={d.id} style={{
                                    background: '#fff', borderRadius: 20,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden'
                                }}>
                                    <img
                                        src={d.image}
                                        alt={d.title}
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' }}
                                        style={{ width: '100%', height: 220, objectFit: 'cover' }}
                                    />
                                    <div style={{ padding: 16 }}>
                                        <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: 4 }}>{d.title}</h3>
                                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: 12 }}>By {d.designer_name}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#ec4899', fontWeight: 800, fontSize: '1.1rem' }}>${d.price}</span>
                                            <Link to="/feed" style={{
                                                background: '#ec4899', color: '#fff',
                                                padding: '6px 16px', borderRadius: 20,
                                                fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none'
                                            }}>Shop</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                padding: '80px 24px', textAlign: 'center'
            }}>
                <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, marginBottom: 16 }}>
                    Are You a Designer?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: 36 }}>
                    Join DesignMart and sell your creations to thousands of fashion lovers.
                </p>
                <Link to="/register" style={{
                    background: '#fff', color: '#ec4899',
                    padding: '14px 40px', borderRadius: 50,
                    fontWeight: 700, fontSize: '1rem', textDecoration: 'none'
                }}>
                    Start Selling Today
                </Link>
            </section>
        </div>
    )
}
