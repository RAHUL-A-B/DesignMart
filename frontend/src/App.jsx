import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider, useCart } from './context/CartContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
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
import Profile from './pages/Profile'
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

    if (['/login', '/register'].includes(location.pathname)) return null
    if (location.pathname.startsWith('/designer')) return null
    if (location.pathname.startsWith('/admin')) return null

    return (
        <nav className="navbar animate-fade-in">
            <Link to="/" className="nav-brand">
                <span>Design</span><span className="nav-brand-highlight">Mart</span>
            </Link>
            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/" className="nav-link">Shop</Link>
            </div>
            <div className="nav-icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user ? (
                    <>
                        <Link to="/profile" className="nav-icon" title="My Profile">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </Link>                        {user.role === 'DESIGNER' && (
                            <Link to="/designer/dashboard" className="nav-icon" title="Dashboard">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </Link>
                        )}
                        {(user.role === 'ADMIN' || user.is_staff) && (
                            <Link to="/admin/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }} title="Admin Panel">
                                ⚙️ Admin
                            </Link>
                        )}
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Hi, {user.name}</span>
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
                <Link to="/cart" className="nav-icon" title="Cart" style={{ position: 'relative' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    {cartCount > 0 && (
                        <span style={{ position: 'absolute', top: -8, right: -8, background: '#ec4899', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                            <li><Link to="/">New Arrivals</Link></li>
                            <li><Link to="/">Best Sellers</Link></li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>Help</h3>
                        <ul>
                            <li><Link to="/">Contact Us</Link></li>
                            <li><Link to="/">Shipping</Link></li>
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
                            {/* Public */}
                            <Route path="/" element={<Feed />} />
                            <Route path="/feed" element={<Navigate to="/" replace />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                            <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

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
                        </Routes>
                    </div>
                    <Footer />
                </div>
                </CartProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
