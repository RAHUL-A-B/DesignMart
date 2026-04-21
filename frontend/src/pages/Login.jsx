import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'
import api from '../api/axios'

// A curated high-fashion image — runway/editorial style, vibrant and striking
const LOGIN_IMAGE = 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=90'

export default function Login() {
    const [phone, setPhone] = useState('')
    const [otp, setOtp]     = useState('')
    const [step, setStep]   = useState(1)
    const { login }         = useAuth()
    const navigate          = useNavigate()

    const handleSendOTP = async (e) => {
        e.preventDefault()
        try {
            await api.post('/auth/login/send-otp/', { phone_number: phone })
            setStep(2)
        } catch (err) {
            alert(err.response?.data?.message || 'Error sending OTP')
        }
    }

    const handleVerifyOTP = async (e) => {
        e.preventDefault()
        try {
            await login(phone, otp)
            navigate('/feed')
        } catch (err) {
            alert('Invalid OTP. Please try again.')
        }
    }

    return (
        <div className="auth-split-wrapper">
            {/* ── Left: Image ── */}
            <div className="auth-image-side">
                <div className="auth-image-bg" style={{ backgroundImage: `url('${LOGIN_IMAGE}')` }} />
                <div className="auth-image-overlay">
                    <span className="auth-image-badge">New Collection 2026</span>
                    <h2 className="auth-image-title">Fashion That Speaks&nbsp;For Itself</h2>
                    <p className="auth-image-subtitle">
                        Discover independent designers creating pieces the world hasn't seen yet.
                    </p>
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
                            <h1 className="auth-heading stagger-2">Welcome back</h1>
                            <p className="auth-subheading stagger-2">Sign in to your account to continue.</p>

                            <form onSubmit={handleSendOTP}>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="auth-input"
                                        placeholder="+91 98765 43210"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="auth-submit-btn stagger-4">
                                    Send OTP →
                                </button>
                            </form>

                            <p className="auth-footer-text stagger-5">
                                No account yet?
                                <Link to="/register" className="auth-footer-link">Create one free</Link>
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="auth-heading stagger-2">Check your phone 📱</h1>
                            <p className="auth-subheading stagger-2">
                                We sent a 6-digit OTP to <strong style={{ color: 'var(--accent-primary)' }}>{phone}</strong>
                            </p>

                            <form onSubmit={handleVerifyOTP}>
                                <div className="auth-otp-hint stagger-3">
                                    Enter the code sent to your number
                                </div>
                                <div className="auth-field stagger-3">
                                    <label className="auth-field-label">One-Time Password</label>
                                    <input
                                        type="text"
                                        className="auth-input"
                                        placeholder="• • • • • •"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        required
                                        style={{ fontSize: '1.5rem', letterSpacing: '10px', textAlign: 'center' }}
                                    />
                                </div>
                                <button type="submit" className="auth-submit-btn stagger-4">
                                    Verify & Login ✓
                                </button>
                            </form>

                            <p className="auth-footer-text stagger-5">
                                <button className="auth-back-btn" onClick={() => setStep(1)}>← Change number</button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
