import { useEffect, useState } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './Profile.css'

// Fix default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Components
function MapController({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 15, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
}

function MapClickHandler({ setPosition, fetchAddress }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            fetchAddress(lat, lng);
        }
    });
    return null;
}

export default function Profile() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [favorites, setFavorites] = useState([])
    const [tab, setTab] = useState('personal')
    const [loading, setLoading] = useState(true)

    // Form States
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        email: user?.email || ''
    })
    
    // Address State
    const [addressForm, setAddressForm] = useState(() => {
        const saved = localStorage.getItem('saved_address')
        return saved ? JSON.parse(saved) : { shipping_address: '', city: '', postal_code: '' }
    })
    
    const [saving, setSaving] = useState(false)
    
    // Map States
    const [locating, setLocating] = useState(false)
    const [position, setPosition] = useState(null)

    useEffect(() => {
        Promise.all([
            api.get('/shoppers/orders/'),
            api.get('/shoppers/favorites/')
        ]).then(([ordersRes, favRes]) => {
            setOrders(ordersRes.data)
            setFavorites(favRes.data)
        }).finally(() => setLoading(false))
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Map Functions
    const fetchAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (!response.ok) {
                throw new Error(`Reverse geocoding failed with status ${response.status}`);
            }
            const data = await response.json();
            
            const address = data.address || {};
            const city = address.city || address.town || address.county || address.state_district || '';
            const postal_code = address.postcode || '';
            
            setAddressForm(prev => ({
                ...prev,
                shipping_address: data.display_name || '',
                city: city,
                postal_code: postal_code
            }));
        } catch (err) {
            console.error("Geocoding failed", err);
        }
    }

    const locateMe = () => {
        if (navigator.geolocation) {
            setLocating(true);
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    await fetchAddressFromCoords(latitude, longitude);
                    setLocating(false);
                },
                (err) => {
                    console.warn("Geolocation denied or failed", err);
                    alert("Unable to get your location. Please allow location permission and try again.");
                    setLocating(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    const handleSaveProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await api.patch('/auth/profile/', {
                name: editForm.name,
                email: editForm.email
            })
            updateUser(res.data)

            localStorage.setItem('saved_address', JSON.stringify({
                shipping_address: addressForm.shipping_address,
                city: addressForm.city,
                postal_code: addressForm.postal_code
            }))

            setIsEditing(false)
            alert("Profile and Address updated successfully!")
        } catch (error) {
            console.error("Failed to update profile", error)
            alert("Failed to update profile.")
        } finally {
            setSaving(false)
        }
    }

    const STATUS_COLORS = {
        Pending:    { bg: '#fef3c7', color: '#d97706' },
        Processing: { bg: '#dbeafe', color: '#2563eb' },
        Shipped:    { bg: '#ede9fe', color: '#7c3aed' },
        Delivered:  { bg: '#d1fae5', color: '#059669' },
        Refunded:   { bg: '#fee2e2', color: '#dc2626' },
    }

    return (
        <div className="profile-page">
            {/* Premium Header */}
            <div className="profile-header">
                <div className="profile-avatar">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                
                <div className="profile-info">
                    <h1 className="profile-name">{user?.name}</h1>
                    <span className="profile-role-badge">
                        {user?.role === 'USER' ? '🛍️ Shopper' : user?.role === 'DESIGNER' ? '🎨 Designer' : '⚙️ Admin'}
                    </span>
                </div>

                <div className="profile-actions">
                    {user?.role === 'DESIGNER' && (
                        <Link to="/designer/dashboard" className="header-btn">
                            🎨 Dashboard
                        </Link>
                    )}
                    {(user?.role === 'ADMIN' || user?.is_staff) && (
                        <Link to="/admin/dashboard" className="header-btn">
                            ⚙️ Admin Panel
                        </Link>
                    )}
                    <button onClick={handleLogout} className="header-btn logout">
                        Log Out
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                {[
                    { key: 'personal', label: '👤 Personal Details' },
                    { key: 'orders', label: '📦 My Orders' },
                    { key: 'favorites', label: '❤️ Favorites' }
                ].map((t) => (
                    <button 
                        key={t.key} 
                        onClick={() => setTab(t.key)} 
                        className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="spinner-container">
                    <div className="profile-spinner"></div>
                </div>
            ) : tab === 'personal' ? (
                <div className="tab-content">
                    <div className="details-card">
                        {isEditing ? (
                            // EDIT MODE
                            <form onSubmit={handleSaveProfile} className="edit-form">
                                <div className="form-section">
                                    <h3>Basic Information</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="info-label">Full Name</label>
                                            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required className="form-input" placeholder="Your Name" />
                                        </div>
                                        <div className="form-group">
                                            <label className="info-label">Email Address</label>
                                            <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="form-input" placeholder="Your Email (Optional)" />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ margin: 0 }}>Delivery Location</h3>
                                        <button type="button" onClick={locateMe} disabled={locating} className="auto-locate-btn">
                                            {locating ? 'Locating...' : '📍 Auto-Locate'}
                                        </button>
                                    </div>
                                    
                                    <div className="map-container">
                                        <MapContainer center={position || [51.505, -0.09]} zoom={position ? 15 : 2} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                                            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                                            {position && <Marker position={position} />}
                                            <MapController position={position} />
                                            <MapClickHandler setPosition={setPosition} fetchAddress={fetchAddressFromCoords} />
                                        </MapContainer>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label className="info-label">Street Address</label>
                                        <input type="text" value={addressForm.shipping_address} onChange={e => setAddressForm({...addressForm, shipping_address: e.target.value})} className="form-input" placeholder="Street Address" />
                                    </div>
                                    
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="info-label">City / Town</label>
                                            <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="form-input" placeholder="City" />
                                        </div>
                                        <div className="form-group">
                                            <label className="info-label">Postal Code</label>
                                            <input type="text" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} className="form-input" placeholder="Postal Code" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="form-actions">
                                    <button type="submit" disabled={saving} className="save-btn">
                                        {saving ? 'Saving...' : 'Save All Details'}
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // VIEW MODE
                            <div className="view-mode">
                                <div className="section-header">
                                    <h2 className="section-title">My Information</h2>
                                    <button onClick={() => setIsEditing(true)} className="edit-btn">
                                        ✏️ Edit Details
                                    </button>
                                </div>

                                <div className="info-grid">
                                    <div className="info-box">
                                        <p className="info-label">Full Name</p>
                                        <p className="info-value">{user?.name}</p>
                                    </div>
                                    <div className="info-box">
                                        <p className="info-label">Phone Number</p>
                                        <p className="info-value">{user?.phone_number}</p>
                                    </div>
                                    <div className="info-box full-width">
                                        <p className="info-label">Email Address</p>
                                        <p className="info-value">{user?.email || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not provided</span>}</p>
                                    </div>
                                    <div className="info-box full-width" style={{ borderLeft: '4px solid #3b82f6' }}>
                                        <p className="info-label">Saved Delivery Address</p>
                                        {addressForm.shipping_address ? (
                                            <p className="info-value">
                                                {addressForm.shipping_address}<br/>
                                                <span style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '4px', display: 'block' }}>
                                                    {addressForm.city}, {addressForm.postal_code}
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="info-value" style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>
                                                No address saved. Click 'Edit Details' to add one.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : tab === 'orders' ? (
                <div className="tab-content profile-orders-list">
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-state-icon">📭</p>
                            <p className="empty-state-text">You haven't placed any orders yet</p>
                            <Link to="/feed" className="shop-link">Start Shopping →</Link>
                        </div>
                    ) : orders.map((order) => (
                        <div key={order.id} className="profile-order-card">
                            <div className="po-info">
                                <p className="po-id">Order #{order.id} · <span style={{ fontWeight: 400 }}>{order.items?.length} item(s)</span></p>
                                <p className="po-total">₹{order.total_amount}</p>
                                <p className="po-date">{new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                            <div className="po-actions">
                                <span className="po-badge" style={{ background: STATUS_COLORS[order.status]?.bg || '#f3f4f6', color: STATUS_COLORS[order.status]?.color || '#374151' }}>
                                    {order.status}
                                </span>
                                <Link to="/orders" state={{ trackOrderObj: order }} className="po-track">
                                    Track Order
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="tab-content favorites-grid">
                    {favorites.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                            <p className="empty-state-icon">❤️</p>
                            <p className="empty-state-text">You haven't added any favorites yet</p>
                            <Link to="/feed" className="shop-link">Browse Designs →</Link>
                        </div>
                    ) : favorites.map((d) => (
                        <div key={d.id} className="favorite-card">
                            <img src={d.image} alt={d.title} className="fav-image"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' }} />
                            <div className="fav-info">
                                <p className="fav-title">{d.title}</p>
                                <p className="fav-price">₹{d.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
