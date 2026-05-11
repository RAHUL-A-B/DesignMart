import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '80px 24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decorative elements */}
                <div style={{
                    position: 'absolute', width: 400, height: 400,
                    borderRadius: '50%', background: 'rgba(219,39,119,0.1)',
                    top: -100, right: -100
                }} />
                
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 800 }}>
                    <span style={{
                        background: 'rgba(255,255,255,0.1)', color: '#fff',
                        padding: '6px 16px', borderRadius: 20, fontSize: 13,
                        fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        Our Story
                    </span>
                    <h1 style={{
                        color: '#fff', fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: 800, lineHeight: 1.1, margin: '24px 0 20px'
                    }}>
                        Redefining Fashion for the <br />
                        <span style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Modern Era
                        </span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: 40, lineHeight: 1.7 }}>
                        DesignMart is an exclusive destination where independent designers showcase their unique creations, bringing directly to you the finest garments without the luxury markup.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', marginBottom: 20 }}>
                                Empowering Creators. <br />Inspiring You.
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 20 }}>
                                Founded in 2026, DesignMart was built with a simple but powerful idea: fashion should be accessible, unique, and directly connect the creators with the people who wear their art.
                            </p>
                            <p style={{ color: '#6b7280', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 30 }}>
                                We meticulously vet every designer on our platform to ensure that when you purchase from DesignMart, you are getting authentic, high-quality, and ethically produced clothing.
                            </p>
                            <Link to="/register" style={{
                                display: 'inline-block',
                                background: '#111827', color: '#fff',
                                padding: '12px 32px', borderRadius: 50,
                                fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                Join Our Community
                            </Link>
                        </div>
                        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <img 
                                src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80" 
                                alt="Fashion Studio" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats/Values Section */}
            <section style={{ padding: '80px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: 48 }}>Our Core Values</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 30 }}>
                        {[
                            { title: 'Authenticity', desc: 'Every piece is 100% original and crafted with genuine passion.', icon: '✨' },
                            { title: 'Sustainability', desc: 'We support slow fashion and ethically sourced materials.', icon: '🌿' },
                            { title: 'Community', desc: 'Connecting creative designers with fashion enthusiasts globally.', icon: '🤝' }
                        ].map((val, idx) => (
                            <div key={idx} style={{ padding: 32, background: '#f8fafc', borderRadius: 20 }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{val.icon}</div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: 12 }}>{val.title}</h3>
                                <p style={{ color: '#64748b', lineHeight: 1.6 }}>{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                padding: '80px 24px', textAlign: 'center'
            }}>
                <h2 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, marginBottom: 16 }}>
                    Ready to Explore?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', marginBottom: 36, maxWidth: 600, margin: '0 auto 36px' }}>
                    Dive into our collection and discover something that truly represents you.
                </p>
                <Link to="/" style={{
                    background: '#fff', color: '#ec4899',
                    padding: '14px 40px', borderRadius: 50,
                    fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                    display: 'inline-block'
                }}>
                    Start Shopping
                </Link>
            </section>
        </div>
    );
}
