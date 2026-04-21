import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import DesignerDashboard from './pages/DesignerDashboard'
import './App.css'

function PrivateRoute({ children, role }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" />
    if (role && user.role !== role) return <Navigate to="/feed" />
    return children
}

function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    
    if (location.pathname === '/login' || location.pathname === '/register') return null;

    return (
        <nav className="navbar animate-fade-in">
        <Link to="/feed" className="nav-brand">
                    <span>Design</span><span className="nav-brand-highlight">Mart</span>
                </Link>
                <div className="nav-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/feed" className="nav-link">Shop</Link>
                    <Link to="/feed" className="nav-link">Pages</Link>
                    <Link to="/feed" className="nav-link">Blog</Link>
                </div>
            
            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/feed" className="nav-icon" title="Search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </Link>
                {user ? (
                    <>
                        <Link to="/orders" className="nav-icon" title="My Profile">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </Link>
                        {user.role === 'DESIGNER' && (
                            <Link to="/designer/dashboard" className="nav-icon" title="Dashboard">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </Link>
                        )}
                        <span style={{color: 'var(--text-secondary)', fontSize: '0.85rem'}}>Hi, {user.name}</span>
                        <button onClick={logout} className="nav-icon" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Log Out</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-icon" title="Login">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '4px', fontSize: '0.9rem' }}>Register</Link>
                    </>
                )}
                <Link to="/cart" className="nav-icon" title="Cart">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </Link>
            </div>
        </nav>
    )
}

function Footer() {
    const location = useLocation()
    
    if (location.pathname === '/login' || location.pathname === '/register') return null;

    return (
        <footer className="footer animate-fade-in">
            <div className="container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h2>DesignMart</h2>
                        <p>Your destination for premium designer fashion.</p>
                    </div>
                    <div className="footer-column">
                        <h3>Shop</h3>
                        <ul>
                            <li><Link to="/feed">New Arrivals</Link></li>
                            <li><Link to="/feed">Best Sellers</Link></li>
                            <li><Link to="/feed">Sale</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>Help</h3>
                        <ul>
                            <li><Link to="/">Contact Us</Link></li>
                            <li><Link to="/">Shipping</Link></li>
                            <li><Link to="/">Returns</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>Follow Us</h3>
                        <div className="social-links">
                            <a href="#" className="social-circle">In</a>
                            <a href="#" className="social-circle">Tw</a>
                            <a href="#" className="social-circle">Fb</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; 2026 DesignMart. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="app-container">
                    <Navbar />
                    <div className="main-content">
                        <Routes>
                        <Route path="/" element={<Home />} />
                            <Route path="/feed" element={<Feed />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                            <Route path="/designer/dashboard" element={<PrivateRoute role="DESIGNER"><DesignerDashboard /></PrivateRoute>} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </AuthProvider>
        </BrowserRouter>
    )
}
