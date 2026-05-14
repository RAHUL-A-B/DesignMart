import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider, useCart } from './context/CartContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Contact from './pages/Contact'
import About from './pages/About'
import DesignerDashboard from './pages/DesignerDashboard'
import DesignerUpload from './pages/DesignerUpload'
import DesignerDesigns from './pages/DesignerDesigns'
import DesignerOrders from './pages/DesignerOrders'
import DesignerEditDesign from './pages/DesignerEditDesign'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminOrders from './pages/AdminOrders'
import AdminDesigns from './pages/AdminDesigns'
import AdminReviews from './pages/AdminReviews'
import AdminPayouts from './pages/AdminPayouts'
import AdminMessages from './pages/AdminMessages'
import AdminBanners from './pages/AdminBanners'
import ProductDetails from './pages/ProductDetails'
import Chat from './pages/Chat'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chatbot from './components/Chatbot';


import './App.css'

function PrivateRoute({ children, role }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" />
    if (role && user.role !== role) return <Navigate to="/" />
    return children
}

function AdminRoute({ children }) {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login" />
    if (user.role !== 'ADMIN' && !user.is_staff) return <Navigate to="/" />
    return children
}

function Navbar() {
    const { user, logout } = useAuth()
    const { cartCount } = useCart()
    const location = useLocation()

    // --- NEW: Scroll tracking logic ---
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            
            // Hide navbar if scrolling down past 50px. Show if scrolling up.
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsVisible(false)
            } else {
                setIsVisible(true)
            }
            
            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])
    // -----------------------------------

    if (['/login', '/register'].includes(location.pathname)) return null
    if (location.pathname.startsWith('/designer')) return null
    if (location.pathname.startsWith('/admin')) return null

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 40px',
            transition: 'all 0.3s ease',
            // --- NEW: Smoothly hide/show using CSS transform ---
            transform: isVisible ? 'translateY(0)' : 'translateY(-100%)'
            // ---------------------------------------------------
        }}>
            <Link to="/" style={{ textDecoration: 'none', fontSize: '1.7rem', fontWeight: 900, display: 'flex', alignItems: 'center' }}>
                <span style={{ color: '#0f172a' }}>Design</span>
                <span style={{ 
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', 
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
                }}>Mart</span>
            </Link>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                {['Home', 'Shop', 'About', 'Contact'].map((item) => (
                    <Link key={item} to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} style={{
                        textDecoration: 'none', color: '#64748b', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ec4899'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                    >
                        {item}
                    </Link>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user ? (
                    <>
                        <Link to="/chat" title="Messages" style={{ color: '#64748b', transition: 'color 0.2s', display: 'flex' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </Link>
                        <Link to="/profile" title="My Profile" style={{ color: '#64748b', transition: 'color 0.2s', display: 'flex' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ec4899'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </Link>
                        {user.role === 'DESIGNER' && (
                            <Link to="/designer/dashboard" title="Dashboard" style={{ color: '#64748b', transition: 'color 0.2s', display: 'flex' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#8b5cf6'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </Link>
                        )}
                        {(user.role === 'ADMIN' || user.is_staff) && (
                            <Link to="/admin/dashboard" style={{ color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                ⚙️ Admin
                            </Link>
                        )}
                        <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>Hi, {user.name}</span>
                        <button onClick={logout} style={{ 
                            background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b',
                            padding: '6px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600,
                            cursor: 'pointer', transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ec4899'; e.currentTarget.style.color = '#ec4899' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b' }}
                        >
                            Log Out
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', transition: 'color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ec4899'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                            Log In
                        </Link>
                        <Link to="/register" style={{ 
                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff',
                            padding: '10px 24px', borderRadius: '50px', fontSize: '0.95rem', fontWeight: 700,
                            textDecoration: 'none', boxShadow: '0 4px 15px rgba(236,72,153,0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            Register
                        </Link>
                    </>
                )}
                
                <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>

                <Link to="/cart" title="Cart" style={{ position: 'relative', color: '#0f172a', transition: 'color 0.2s', display: 'flex', padding: '4px' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ec4899'} onMouseLeave={(e) => e.currentTarget.style.color = '#0f172a'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    {cartCount > 0 && (
                        <span style={{ 
                            position: 'absolute', top: -4, right: -8, 
                            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', 
                            borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 800, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(236,72,153,0.4)', border: '2px solid #fff'
                        }}>
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    )
}


function Footer() {
    const location = useLocation()
    if (['/login', '/register'].includes(location.pathname)) return null
    if (location.pathname.startsWith('/designer')) return null
    if (location.pathname.startsWith('/admin')) return null

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
                            <li><Link to="/shop">All Designs</Link></li>
                            <li><Link to="/shop">New Arrivals</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>Help</h3>
                        <ul>
                            <li><Link to="/contact">Contact Us</Link></li>
                            <li><Link to="/about">About</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">&copy; 2026 DesignMart. All rights reserved.</div>
            </div>
        </footer>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <CartProvider>
                    <div className="app-container">
                        <Navbar />
                        <div className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/feed" element={<Navigate to="/" replace />} />
                                <Route path="/shop" element={<Shop />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/cart" element={<Cart />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                                <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                                <Route path="/product/:id" element={<ProductDetails />} />
                                <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
<Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />



                                {/* Designer */}
                                <Route path="/designer/dashboard" element={<PrivateRoute role="DESIGNER"><DesignerDashboard /></PrivateRoute>} />
                                <Route path="/designer/upload" element={<PrivateRoute role="DESIGNER"><DesignerUpload /></PrivateRoute>} />
                                <Route path="/designer/designs" element={<PrivateRoute role="DESIGNER"><DesignerDesigns /></PrivateRoute>} />
                                <Route path="/designer/designs/:id/edit" element={<PrivateRoute role="DESIGNER"><DesignerEditDesign /></PrivateRoute>} />
                                <Route path="/designer/orders" element={<PrivateRoute role="DESIGNER"><DesignerOrders /></PrivateRoute>} />

                                {/* Admin */}
                                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                                <Route path="/admin/designs" element={<AdminRoute><AdminDesigns /></AdminRoute>} />
                                <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
                                <Route path="/admin/payouts" element={<AdminRoute><AdminPayouts /></AdminRoute>} />
                                <Route path="/admin/messages" element={<AdminMessages />} />
                                <Route path="/admin/banners" element={<AdminBanners />} />
                            </Routes>
                        </div>
                        <Footer />
                    <Chatbot />
                    </div>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
