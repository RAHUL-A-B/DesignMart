import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { useAuth } from '../context/AuthContext'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './Checkout.css'

// Fix default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Hooks
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

// Icons
const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
)

const PhoneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
)

const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
)

const LocationIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
)

const TruckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
    </svg>
)

const WalletIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
        <line x1="2" y1="10" x2="22" y2="10"></line>
    </svg>
)


export default function Checkout() {
    const navigate = useNavigate()
    const { user } = useAuth()
    
    // START COMPLETELY BLANK!
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        shipping_address: '', 
        city: '', 
        postal_code: '',
        delivery_method: 'Express',
        payment_type: 'Cash on Delivery'
    })
    
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [locating, setLocating] = useState(false)
    const [position, setPosition] = useState(null)

    const fetchAddressFromCoords = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            const address = data.address || {};
            const city = address.city || address.town || address.county || address.state_district || '';
            const postal_code = address.postcode || '';
            
            setForm(prev => ({
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
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    fetchAddressFromCoords(latitude, longitude);
                    setLocating(false);
                },
                (err) => {
                    console.warn("Geolocation denied or failed", err);
                    setLocating(false);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }

    // FILL OUT EVERYTHING WHEN BUTTON IS CLICKED
    const handleUseSavedAddress = () => {
        const saved = localStorage.getItem('saved_address')
        
        // Prepare personal details
        const nameParts = user?.name ? user.name.split(' ') : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        if (saved) {
            const parsed = JSON.parse(saved)
            setForm(prev => ({
                ...prev,
                firstName: firstName,
                lastName: lastName,
                email: user?.email || '',
                phone: user?.phone_number || '',
                shipping_address: parsed.shipping_address || prev.shipping_address,
                city: parsed.city || prev.city,
                postal_code: parsed.postal_code || prev.postal_code
            }))
        } else {
            alert("You don't have a saved address yet! Go to your Profile to add one.")
        }
    }

    const handleCheckout = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const payload = {
                ...form,
                name: `${form.firstName} ${form.lastName}`.trim(),
            }
            const res = await api.post('/shoppers/checkout/', payload)
            navigate('/orders')
        } catch (err) {
            setError(err.response?.data?.error || 'Checkout failed')
        } finally { setLoading(false) }
    }

    const updateForm = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    return (
        <div className="co-page">
            <div className="co-container">
                <Link to="/cart" className="co-back-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Back to cart
                </Link>

                <div className="co-header">
                    <h1 className="co-title">Checkout</h1>
                    <p className="co-subtitle">a checkout is a counter where you pay for things you are buying</p>
                </div>

                {error && <div className="co-error">{error}</div>}

                <form onSubmit={handleCheckout} className="co-form">
                    
                    {/* Section 1: Contact Information */}
                    <div className="co-section">
                        <h2 className="co-section-title">1. Contact information</h2>
                        
                        <div className="co-row">
                            <div className="co-input-group">
                                <div className="co-icon"><UserIcon /></div>
                                <div className="co-input-wrapper">
                                    <label>First Name</label>
                                    <input type="text" required value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} placeholder="Jane" />
                                </div>
                            </div>
                            <div className="co-input-group">
                                <div className="co-icon"></div>
                                <div className="co-input-wrapper">
                                    <label>Last Name</label>
                                    <input type="text" required value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} placeholder="Doe" />
                                </div>
                            </div>
                        </div>

                        <div className="co-row mt-4">
                            <div className="co-input-group flex-1">
                                <div className="co-icon"><EmailIcon /></div>
                                <div className="co-input-wrapper">
                                    <label>Email <span style={{ textTransform: 'none', opacity: 0.6 }}>(Optional)</span></label>
                                    <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} placeholder="jane@example.com" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Delivery Location & Method */}
                    <div className="co-section">
                        <div className="co-section-header">
                            <h2 className="co-section-title">2. Delivery method</h2>
                            
                            {/* Buttons container with Use Saved Address! */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={handleUseSavedAddress} className="co-locate-btn" style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                                    ⭐ Use Saved Address
                                </button>
                                <button type="button" onClick={locateMe} className={`co-locate-btn ${locating ? 'pulse' : ''}`} disabled={locating} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                                    {locating ? 'Locating...' : '📍 Auto-Locate'}
                                </button>
                            </div>
                        </div>

                        <div className="co-map-wrapper">
                            <MapContainer center={[51.505, -0.09]} zoom={2} scrollWheelZoom={true} style={{ height: '220px', width: '100%', zIndex: 1 }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                />
                                {position && <Marker position={position} />}
                                <MapController position={position} />
                                <MapClickHandler setPosition={setPosition} fetchAddress={fetchAddressFromCoords} />
                            </MapContainer>
                        </div>

                        <div className="co-row mt-4 align-end">
                            <div className="co-pill-group">
                                <button type="button" className={`co-pill ${form.delivery_method === 'Same-day' ? 'active' : ''}`} onClick={() => updateForm('delivery_method', 'Same-day')}>
                                    <TruckIcon /> Same-day
                                </button>
                                <button type="button" className={`co-pill ${form.delivery_method === 'Express' ? 'active' : ''}`} onClick={() => updateForm('delivery_method', 'Express')}>
                                    <TruckIcon /> Express
                                </button>
                                <button type="button" className={`co-pill ${form.delivery_method === 'Normal' ? 'active' : ''}`} onClick={() => updateForm('delivery_method', 'Normal')}>
                                    <TruckIcon /> Normal
                                </button>
                            </div>

                            <div className="co-input-group" style={{marginLeft: 'auto', minWidth: '150px'}}>
                                <div className="co-icon"><LocationIcon /></div>
                                <div className="co-input-wrapper">
                                    <label>Zip code</label>
                                    <input type="text" required value={form.postal_code} onChange={e => updateForm('postal_code', e.target.value)} placeholder="00000" />
                                </div>
                            </div>
                        </div>

                        <div className="co-row mt-4">
                            <div className="co-input-group flex-1">
                                <div className="co-input-wrapper">
                                    <label>Shipping Address</label>
                                    <input type="text" required value={form.shipping_address} onChange={e => updateForm('shipping_address', e.target.value)} placeholder="123 Main Street" />
                                </div>
                            </div>
                            <div className="co-input-group flex-1">
                                <div className="co-input-wrapper">
                                    <label>City</label>
                                    <input type="text" required value={form.city} onChange={e => updateForm('city', e.target.value)} placeholder="New York" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Payment Method */}
                    <div className="co-section">
                        <h2 className="co-section-title">3. Payment method</h2>
                        <div className="co-pill-group">
                            <button type="button" className={`co-pill ${form.payment_type === 'Cash on Delivery' ? 'active' : ''}`} onClick={() => updateForm('payment_type', 'Cash on Delivery')}>
                                <WalletIcon /> Cash on Delivery
                            </button>
                            <button type="button" className={`co-pill disabled`} disabled>
                                Online Payment
                            </button>
                            <button type="button" className={`co-pill disabled`} disabled>
                                Credit Card
                            </button>
                        </div>
                    </div>

                    <div className="co-footer">
                        <button type="submit" disabled={loading} className={`co-submit-btn ${loading ? 'loading' : ''}`}>
                            {!loading && 'Pay Now'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
