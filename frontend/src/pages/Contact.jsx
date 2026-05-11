import { useState } from 'react'
import api from '../api/axios'

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.post('/shoppers/contact/', formData)
            setSuccess(true)
            setFormData({ name: '', email: '', subject: '', message: '' })
        } catch {
            setError('Failed to send message. Please try again.')
        } finally { setLoading(false) }
    }

    return (
        <div className="animate-fade-in">
            {/* Hero */}
            <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '100px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', bottom: -80, right: -80 }} />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
                    <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.2)' }}>
                        Get In Touch
                    </span>
                    <h1 style={{ color: '#fff', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, margin: '24px 0 20px' }}>
                        We'd Love to Hear <br />
                        <span style={{ background: 'linear-gradient(90deg, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>From You</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
                        Whether you have a question about a product, shipping, or just want to say hello, our team is ready to answer all your questions.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section style={{ padding: '80px 24px', background: '#f9fafb' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 60 }}>

                    {/* Contact Info */}
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: 30 }}>Contact Information</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                            {[
                                { icon: '📧', title: 'Email Us', sub: 'For general support & inquiries', value: 'support@designmart.com' },
                                { icon: '📞', title: 'Call Us', sub: 'Mon-Fri from 9am to 6pm', value: '+91 98765 43210' },
                                { icon: '📍', title: 'Visit Us', sub: '123 Fashion Avenue, Design District, Mumbai 400001', value: null },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 20 }}>
                                    <div style={{ background: '#fff', width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: 24, flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: 4 }}>{item.title}</h3>
                                        <p style={{ color: '#6b7280', marginBottom: 4 }}>{item.sub}</p>
                                        {item.value && <span style={{ color: '#ec4899', fontWeight: 600 }}>{item.value}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div style={{ background: '#fff', padding: 40, borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: 24 }}>Send a Message</h2>

                        {success ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                                <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: 8 }}>Message Sent!</h3>
                                <p style={{ color: '#6b7280', marginBottom: 24 }}>Thank you! We'll get back to you soon.</p>
                                <button onClick={() => setSuccess(false)} style={{ background: '#ec4899', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>
                                    Send Another
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {error && (
                                    <div style={{ background: '#fff0f0', border: '1px solid #fca5a5', color: '#dc2626', padding: '12px 16px', borderRadius: 8, fontSize: 14 }}>
                                        {error}
                                    </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Your Name</label>
                                        <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Email Address</label>
                                        <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Subject</label>
                                    <input type="text" name="subject" required value={formData.subject} onChange={handleChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb', fontSize: '0.95rem', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: 8 }}>Message</label>
                                    <textarea name="message" required rows="5" value={formData.message} onChange={handleChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #e5e7eb', outline: 'none', background: '#f9fafb', fontSize: '0.95rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                                </div>
                                <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Sending...' : 'Send Message →'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
