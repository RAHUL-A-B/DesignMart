import { useState } from 'react'
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

const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=90'

export default function Login() {
    const [country, setCountry] = useState(COUNTRIES[0])
    const [phone, setPhone]     = useState('')
    const [otp, setOtp]         = useState('')
    const [step, setStep]       = useState(1)
    const [error, setError]     = useState('')
    const { verifyOtp }         = useAuth()
    const navigate              = useNavigate()

    const handlePhoneChange = (e) => {
        const val = e.target.value.replace(/\D/g, '')
        if (val.length <= country.digits) setPhone(val)
    }

    const handleOtpChange = (e) => {
        const val = e.target.value.replace(/\D/g, '')
        if (val.length <= 6) setOtp(val)
    }

    const fullPhone = `${country.code}${phone}`

    const handleSendOTP = async (e) => {
        e.preventDefault()
        setError('')
        if (phone.length !== country.digits) {
            setError(`Phone number must be ${country.digits} digits for ${country.name}`)
            return
        }
        try {
            const res = await api.post('/auth/login/send-otp/', { phone_number: fullPhone })
            if (res.data.dev_otp) {
                setOtp(res.data.dev_otp)
            }
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Error sending OTP')
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
            else navigate('/shop')
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
        }
    }

    return (
        <div className="auth-split-wrapper">
            <div className="auth-image-side">
                <div className="auth-image-bg" style={{ backgroundImage: `url('${LOGIN_IMAGE}')` }} />
                <div className="auth-image-overlay">
                    <span className="auth-image-badge">New Collection 2026</span>
                    <h2 className="auth-image-title">Fashion That Speaks For Itself</h2>
                    <p className="auth-image-subtitle">Discover independent designers creating pieces the world has not seen yet.</p>
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
                            <h1 className="auth-heading stagger-2">Welcome back</h1>
                            <p className="auth-subheading stagger-2">Sign in to your account to continue.</p>
                            <form onSubmit={handleSendOTP}>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">Phone Number</label>
                                    <div className="phone-input-wrapper">
                                        <select className="country-select" value={country.code}
                                            onChange={(e) => {
                                                const found = COUNTRIES.find(c => c.code === e.target.value)
                                                setCountry(found)
                                                setPhone('')
                                            }}>
                                            {COUNTRIES.map(c => (
                                                <option key={c.code} value={c.code}>{c.flag} {c.code} {c.name}</option>
                                            ))}
                                        </select>
                                        <input type="text" inputMode="numeric" className="auth-input phone-number-input"
                                            placeholder={`${'0'.repeat(country.digits)} (${country.digits} digits)`}
                                            value={phone} onChange={handlePhoneChange} required />
                                    </div>
                                    <small className="phone-hint">{country.flag} {country.name}: {country.code} + {country.digits} digits · {phone.length}/{country.digits}</small>
                                </div>
                                <button type="submit" className="auth-submit-btn stagger-4">Send OTP →</button>
                            </form>
                            <p className="auth-footer-text stagger-5">
                                No account yet? <Link to="/register" className="auth-footer-link">Create one free</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-heading stagger-2">Check your phone 📱</h1>
                            <p className="auth-subheading stagger-2">
                                OTP sent to <strong style={{ color: 'var(--accent-primary)' }}>{fullPhone}</strong>
                            </p>
                            <form onSubmit={handleVerifyOTP}>
                                <div className="auth-otp-hint stagger-3">Enter the 6-digit code from your Django terminal</div>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">One-Time Password</label>
                                    <input type="text" inputMode="numeric" className="auth-input"
                                        placeholder="000000"
                                        value={otp} onChange={handleOtpChange}
                                        maxLength={6} required
                                        style={{ fontSize: '1.8rem', letterSpacing: '4px', textAlign: 'center' }} />
                                    <small className="phone-hint" style={{ textAlign: 'center', display: 'block' }}>{otp.length}/6 digits</small>
                                </div>
                                <button type="submit" className="auth-submit-btn stagger-4" disabled={otp.length !== 6}>Verify & Login ✓</button>
                            </form>
                            <p className="auth-footer-text stagger-5">
                                <button className="auth-back-btn" onClick={() => { setStep(1); setOtp(''); setError('') }}>← Change number</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
