import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'
import api from '../api/axios'

const COUNTRIES = [
    { code: '+91',  flag: '🇮🇳', name: 'India',        digits: 10 },
    { code: '+1',   flag: '🇺🇸', name: 'USA',          digits: 10 },
    { code: '+44',  flag: '🇬🇧', name: 'UK',           digits: 10 },
    { code: '+61',  flag: '🇦🇺', name: 'Australia',    digits: 9  },
    { code: '+971', flag: '🇦🇪', name: 'UAE',          digits: 9  },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia', digits: 9  },
    { code: '+92',  flag: '🇵🇰', name: 'Pakistan',     digits: 10 },
    { code: '+880', flag: '🇧🇩', name: 'Bangladesh',   digits: 10 },
    { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka',    digits: 9  },
    { code: '+60',  flag: '🇲🇾', name: 'Malaysia',     digits: 9  },
    { code: '+65',  flag: '🇸🇬', name: 'Singapore',    digits: 8  },
]

const SLIDES = [
    { url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=90', badge: 'Summer 2026', title: 'Bold Colours, Bolder You', sub: 'Discover exclusive pieces from independent designers worldwide.' },
    { url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=1400&q=90', badge: 'Designer Picks', title: 'Elegance Is an Attitude', sub: 'Browse hundreds of curated styles crafted just for you.' },
    { url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=90', badge: 'New Arrivals', title: 'Style That Tells Your Story', sub: 'Every piece is designed with passion and purpose.' },
    { url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=90', badge: 'Street Style', title: 'Own the Street. Own the Room.', sub: 'From streetwear to couture — all in one place.' },
]

export default function Register() {
    const [formData, setFormData] = useState({ phone: '', name: '', email: '', role: 'USER' })
    const [country, setCountry]   = useState(COUNTRIES[0])
    const [otp, setOtp]           = useState('')
    const [step, setStep]         = useState(1)
    const [slide, setSlide]       = useState(0)
    const [fading, setFading]     = useState(false)
    const [error, setError]       = useState('')
    const { verifyOtp }           = useAuth()
    const navigate                = useNavigate()

    useEffect(() => {
        const timer = setInterval(() => {
            setFading(true)
            setTimeout(() => {
                setSlide(prev => (prev + 1) % SLIDES.length)
                setFading(false)
            }, 600)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    const goToSlide = (i) => {
        setFading(true)
        setTimeout(() => { setSlide(i); setFading(false) }, 600)
    }

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '')
        if (val.length <= country.digits) setFormData({ ...formData, phone: val })
    }

    const handleOtpChange = (e) => {
        const val = e.target.value.replace(/\D/g, '')
        if (val.length <= 6) setOtp(val)
    }

    const fullPhone = `${country.code}${formData.phone}`

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setError('')
        if (formData.phone.length !== country.digits) {
            setError(`Phone number must be ${country.digits} digits for ${country.name}`)
            return
        }
        try {
            const res = await api.post('/auth/register/send-otp/', {
                phone_number: fullPhone,
                name: formData.name,
                email: formData.email,
                role: formData.role
            })
            if (res.data.dev_otp) setOtp(res.data.dev_otp)
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.error || 'Error sending OTP')
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        setError('')
        if (otp.length !== 6) { setError('OTP must be 6 digits'); return }
        try {
            const user = await verifyOtp(fullPhone, otp)
            if (user.role === 'DESIGNER') navigate('/designer/dashboard')
            else if (user.role === 'ADMIN' || user.is_staff) navigate('/admin/dashboard')
            else navigate('/')
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
        }
    }

    const current = SLIDES[slide]

    return (
        <div className="auth-split-wrapper">
            <div className="auth-image-side">
                {SLIDES.map((img, i) => (
                    <div key={i} className="auth-image-bg" style={{
                        backgroundImage: `url('${img.url}')`,
                        opacity: i === slide ? (fading ? 0 : 1) : 0,
                        transition: 'opacity 0.6s ease-in-out',
                        position: 'absolute', inset: 0,
                    }} />
                ))}
                <div className="auth-image-overlay" style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
                    <span className="auth-image-badge">{current.badge}</span>
                    <h2 className="auth-image-title">{current.title}</h2>
                    <p className="auth-image-subtitle">{current.sub}</p>
                    <div className="slideshow-dots">
                        {SLIDES.map((_, i) => (
                            <button key={i} className={`slideshow-dot ${i === slide ? 'active' : ''}`} onClick={() => goToSlide(i)} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="auth-form-side">
                <div className="auth-card">
                    <div className="auth-brand stagger-1">
                        <div className="auth-brand-logo">DM</div>
                        <span className="auth-brand-name">DesignMart</span>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    {step === 1 ? (
                        <>
                            <h1 className="auth-heading stagger-2">Create account</h1>
                            <p className="auth-subheading stagger-2">Join thousands of fashion lovers on DesignMart.</p>

                            <div className="auth-role-tabs stagger-3">
                                <button type="button" className={`auth-role-tab ${formData.role === 'USER' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'USER'})}>🛍️ Shopper</button>
                                <button type="button" className={`auth-role-tab ${formData.role === 'DESIGNER' ? 'active' : ''}`} onClick={() => setFormData({...formData, role: 'DESIGNER'})}>🎨 Designer</button>
                            </div>

                            <form onSubmit={handleSendOTP}>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">Full Name</label>
                                    <input type="text" className="auth-input" placeholder="Your full name"
                                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>

                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">Phone Number</label>
                                    <div className="phone-input-wrapper">
                                        <select className="country-select" value={country.code}
                                            onChange={(e) => {
                                                const found = COUNTRIES.find(c => c.code === e.target.value)
                                                setCountry(found)
                                                setFormData({...formData, phone: ''})
                                            }}>
                                            {COUNTRIES.map(c => (
                                                <option key={c.code} value={c.code}>{c.flag} {c.code} {c.name}</option>
                                            ))}
                                        </select>
                                        <input type="text" inputMode="numeric" className="auth-input phone-number-input"
                                            placeholder={`${'0'.repeat(country.digits)} (${country.digits} digits)`}
                                            value={formData.phone} onChange={handlePhoneChange} required />
                                    </div>
                                    <small className="phone-hint">{country.flag} {country.name}: {country.code} + {country.digits} digits · {formData.phone.length}/{country.digits}</small>
                                </div>

                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">Email <span style={{opacity:0.45}}>(optional)</span></label>
                                    <input type="email" className="auth-input" placeholder="you@email.com"
                                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                                </div>

                                <button type="submit" className="auth-submit-btn stagger-4">Create Account →</button>
                            </form>

                            <p className="auth-footer-text stagger-5">
                                Already have an account? <Link to="/login" className="auth-footer-link">Sign in</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-heading stagger-2">Almost there! 🎉</h1>
                            <p className="auth-subheading stagger-2">
                                OTP sent to <strong style={{color:'var(--accent-primary)'}}>{fullPhone}</strong>
                            </p>
                            <form onSubmit={handleVerifyOTP}>
                                <div className="auth-otp-hint stagger-3">Enter the 6-digit code from your Django terminal</div>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">One-Time Password</label>
                                    <input type="text" inputMode="numeric" className="auth-input"
                                        placeholder="000000"
                                        value={otp} onChange={handleOtpChange}
                                        maxLength={6} required
                                        style={{fontSize:'1.8rem', letterSpacing:'4px', textAlign:'center'}} />
                                    <small className="phone-hint" style={{textAlign:'center', display:'block'}}>{otp.length}/6 digits</small>
                                </div>
                                <button type="submit" className="auth-submit-btn stagger-4" disabled={otp.length !== 6}>Verify & Complete ✓</button>
                            </form>
                            <p className="auth-footer-text stagger-5">
                                <button className="auth-back-btn" onClick={() => { setStep(1); setOtp(''); setError('') }}>← Back to registration</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
