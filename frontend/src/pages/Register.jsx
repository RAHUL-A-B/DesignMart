import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'
import api from '../api/axios'

// Auto-scrolling slideshow images — curated high-fashion editorial photos
const SLIDESHOW_IMAGES = [
    {
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90',
        badge: 'Summer 2026',
        title: 'Bold Colours, Bolder You',
        sub: 'Discover exclusive pieces from independent designers worldwide.'
    },
    {
        url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1400&q=90',
        badge: 'Designer Picks',
        title: 'Elegance Is an Attitude',
        sub: 'Browse hundreds of curated styles crafted just for you.'
    },
    {
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=90',
        badge: 'New Arrivals',
        title: 'Style That Tells Your Story',
        sub: 'Every piece is designed with passion and purpose.'
    },
    {
        url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=90',
        badge: 'Street Style',
        title: 'Own the Street. Own the Room.',
        sub: 'From streetwear to couture — all in one place.'
    },
]

export default function Register() {
    const [formData, setFormData] = useState({ phone: '', name: '', email: '', role: 'USER' })
    const [otp, setOtp]           = useState('')
    const [step, setStep]         = useState(1)
    const [slide, setSlide]       = useState(0)
    const [fading, setFading]     = useState(false)
    const { login }               = useAuth()
    const navigate                = useNavigate()

    // Auto-advance slideshow every 4 seconds with a crossfade
    useEffect(() => {
        const timer = setInterval(() => {
            setFading(true)
            setTimeout(() => {
                setSlide(prev => (prev + 1) % SLIDESHOW_IMAGES.length)
                setFading(false)
            }, 600) // fade-out duration
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    const goToSlide = (i) => {
        setFading(true)
        setTimeout(() => { setSlide(i); setFading(false) }, 600)
    }

    const handleSendOTP = async (e) => {
        e.preventDefault()
        try {
            await api.post('/auth/register/send-otp/', {
                phone_number: formData.phone,
                name:         formData.name,
                email:        formData.email,
                role:         formData.role
            })
            setStep(2)
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending OTP')
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        try {
            await login(formData.phone, otp)
            navigate('/feed')
        } catch (err) {
            alert('Invalid OTP. Please try again.')
        }
    }

    const current = SLIDESHOW_IMAGES[slide]

    return (
        <div className="auth-split-wrapper">
            {/* ── Left: Auto-Scrolling Slideshow ── */}
            <div className="auth-image-side">
                {/* Crossfade image layers */}
                {SLIDESHOW_IMAGES.map((img, i) => (
                    <div
                        key={i}
                        className="auth-image-bg"
                        style={{
                            backgroundImage: `url('${img.url}')`,
                            opacity: i === slide ? (fading ? 0 : 1) : 0,
                            transition: 'opacity 0.6s ease-in-out',
                            position: 'absolute',
                            inset: 0,
                        }}
                    />
                ))}

                <div className="auth-image-overlay" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
                    <span className="auth-image-badge">{current.badge}</span>
                    <h2 className="auth-image-title">{current.title}</h2>
                    <p className="auth-image-subtitle">{current.sub}</p>

                    {/* Dot indicators */}
                    <div className="slideshow-dots">
                        {SLIDESHOW_IMAGES.map((_, i) => (
                            <button
                                key={i}
                                className={`slideshow-dot ${i === slide ? 'active' : ''}`}
                                onClick={() => goToSlide(i)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: Form ── */}
            <div className="auth-form-side">
                <div className="auth-card">
                    <div className="auth-brand stagger-1">
                        <div className="auth-brand-logo">DM</div>
                        <span className="auth-brand-name">DesignMart</span>
                    </div>

                    {step === 1 ? (
                        <>
                            <h1 className="auth-heading stagger-2">Create account</h1>
                            <p className="auth-subheading stagger-2">Join thousands of fashion lovers on DesignMart.</p>

                            <div className="auth-role-tabs stagger-3">
                                <button type="button"
                                    className={`auth-role-tab ${formData.role === 'USER' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, role: 'USER'})}>
                                    🛍️ Shopper
                                </button>
                                <button type="button"
                                    className={`auth-role-tab ${formData.role === 'DESIGNER' ? 'active' : ''}`}
                                    onClick={() => setFormData({...formData, role: 'DESIGNER'})}>
                                    🎨 Designer
                                </button>
                            </div>

                            <form onSubmit={handleSendOTP}>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">Full Name</label>
                                    <input type="text" className="auth-input" placeholder="Your full name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">Phone Number</label>
                                    <input type="tel" className="auth-input" placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">
                                        Email <span style={{opacity:0.45,textTransform:'none',letterSpacing:0}}>(optional)</span>
                                    </label>
                                    <input type="email" className="auth-input" placeholder="you@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <button type="submit" className="auth-submit-btn stagger-4">Create Account →</button>
                            </form>

                            <p className="auth-footer-text stagger-5">
                                Already have an account?
                                <Link to="/login" className="auth-footer-link">Sign in</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-heading stagger-2">Almost there! 🎉</h1>
                            <p className="auth-subheading stagger-2">
                                We sent an OTP to <strong style={{color:'var(--accent-primary)'}}>{formData.phone}</strong>
                            </p>
                            <form onSubmit={handleVerifyOTP}>
                                <div className="auth-otp-hint stagger-3">Enter the 6-digit code to verify your number</div>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">One-Time Password</label>
                                    <input type="text" className="auth-input" placeholder="• • • • • •"
                                        value={otp} onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6} required
                                        style={{fontSize:'1.5rem',letterSpacing:'10px',textAlign:'center'}} />
                                </div>
                                <button type="submit" className="auth-submit-btn stagger-4">Verify & Complete ✓</button>
                            </form>
                            <p className="auth-footer-text stagger-5">
                                <button className="auth-back-btn" onClick={() => setStep(1)}>← Back to registration</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
