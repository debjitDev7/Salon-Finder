import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { salonAPI, slotAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

// Sidebar Component
const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const links = [
        { path: '/owner', label: '📊 Dashboard', exact: true },
        { path: '/owner/salon', label: '🏪 My Salon' },
        { path: '/owner/services', label: '💇 Services' },
        { path: '/owner/slots', label: '📅 Slots' },
        { path: '/owner/bookings', label: '📋 Bookings' }
    ];

    return (
        <div className="dashboard-sidebar">
            <Link to="/" className="navbar-brand">✨ SalonFinder</Link>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Welcome, {user?.name}
            </p>

            <ul className="sidebar-nav">
                {links.map(link => (
                    <li key={link.path}>
                        <Link
                            to={link.path}
                            className={`sidebar-link ${(link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path) && link.path !== '/owner') ? 'active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>

            <button onClick={handleLogout} className="btn btn-secondary" style={{ position: 'absolute', bottom: '2rem', left: '1rem', right: '1rem' }}>
                Logout
            </button>
        </div>
    );
};

// Dashboard Overview
const DashboardHome = () => {
    const [stats, setStats] = useState({ today: 0, upcoming: 0, total: 0 });
    const [todayBookings, setTodayBookings] = useState([]);
    const [hasSalon, setHasSalon] = useState(true);

    useEffect(() => {
        checkSalon();
        fetchTodayBookings();
    }, []);

    const checkSalon = async () => {
        try {
            await salonAPI.getMySalon();
        } catch {
            setHasSalon(false);
        }
    };

    const fetchTodayBookings = async () => {
        try {
            const response = await bookingAPI.getTodayBookings();
            setTodayBookings(response.data.data);
            setStats(prev => ({ ...prev, today: response.data.count }));
        } catch (error) {
            console.log('No bookings');
        }
    };

    if (!hasSalon) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                <h2>Welcome! Let's set up your salon</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    You haven't registered a salon yet. Get started by creating your salon profile.
                </p>
                <Link to="/owner/salon" className="btn btn-primary btn-lg">
                    Create Salon
                </Link>
            </div>
        );
    }

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.today}</div>
                    <div className="stat-label">Today's Bookings</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{todayBookings.filter(b => b.status === 'confirmed').length}</div>
                    <div className="stat-label">Confirmed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{todayBookings.filter(b => b.status === 'pending').length}</div>
                    <div className="stat-label">Pending</div>
                </div>
            </div>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Today's Appointments</h3>
            {todayBookings.length === 0 ? (
                <div className="glass-card">
                    <p style={{ color: 'var(--text-muted)' }}>No appointments scheduled for today.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Customer</th>
                                <th>Services</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayBookings.map(booking => (
                                <tr key={booking._id}>
                                    <td>{booking.bookingTime}</td>
                                    <td>{booking.customer?.name}</td>
                                    <td>{booking.services.map(s => s.name).join(', ')}</td>
                                    <td><span className={`badge badge-${booking.status === 'confirmed' ? 'success' : 'warning'}`}>{booking.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

// Salon Management
const SalonManagement = () => {
    const [salon, setSalon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', phone: '', email: '',
        latitude: '', longitude: '', address: '', city: '',
        slotDuration: 30
    });

    // Function to get current location using browser's Geolocation API
    const getCurrentLocation = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        // First check the permission status
        if (navigator.permissions) {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                console.log('Location permission status:', permission.state);

                if (permission.state === 'denied') {
                    toast.error('Location is BLOCKED. Click 🔒 in address bar → Location → Allow, then refresh page');
                    return;
                }

                if (permission.state === 'prompt') {
                    toast('📍 Please allow location access when prompted...', { duration: 5000 });
                }
            } catch (e) {
                console.log('Permission API not available');
            }
        }

        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    latitude: latitude.toFixed(6),
                    longitude: longitude.toFixed(6)
                }));

                // Try to get address from coordinates using reverse geocoding
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev,
                            latitude: latitude.toFixed(6),
                            longitude: longitude.toFixed(6),
                            address: data.display_name || '',
                            city: data.address.city || data.address.town || data.address.village || ''
                        }));
                    }
                } catch (error) {
                    console.log('Could not get address from coordinates');
                }

                toast.success('Location detected successfully!');
                setGettingLocation(false);
            },
            (error) => {
                setGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error('Location blocked! Click the 🔒 icon in address bar → Allow location');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error('Location unavailable. Check if Location is ON in Windows Settings');
                        break;
                    case error.TIMEOUT:
                        toast.error('Location timed out. Please check Windows Settings → Privacy → Location is ON');
                        break;
                    default:
                        toast.error('Could not get your location');
                }
            },
            {
                enableHighAccuracy: false, // Use network location (faster, works on PCs)
                timeout: 30000,            // 30 seconds timeout
                maximumAge: 60000          // Accept cached location up to 1 minute old
            }
        );
    };

    useEffect(() => { fetchSalon(); }, []);

    const fetchSalon = async () => {
        try {
            const response = await salonAPI.getMySalon();
            const s = response.data.data.salon;
            setSalon(s);
            setFormData({
                name: s.name || '',
                description: s.description || '',
                phone: s.phone || '',
                email: s.email || '',
                latitude: s.location?.coordinates?.[1] || '',
                longitude: s.location?.coordinates?.[0] || '',
                address: s.location?.formattedAddress || '',
                city: s.location?.city || '',
                slotDuration: s.slotDuration || 30
            });
        } catch {
            setSalon(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (salon) {
                await salonAPI.update(salon._id, formData);
                toast.success('Salon updated!');
            } else {
                await salonAPI.create(formData);
                toast.success('Salon created! Awaiting verification.');
            }
            fetchSalon();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>{salon ? 'Edit Salon' : 'Create Salon'}</h1>

            {salon && !salon.isVerified && (
                <div className="glass-card" style={{ background: 'rgba(245, 158, 11, 0.1)', marginBottom: '2rem' }}>
                    <p>⚠️ Your salon is pending verification. It will be visible to customers after admin approval.</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="glass-card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label className="form-label">Salon Name *</label>
                        <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone *</label>
                        <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Slot Duration</label>
                        <select className="form-input form-select" value={formData.slotDuration} onChange={e => setFormData({ ...formData, slotDuration: Number(e.target.value) })}>
                            <option value={30}>30 minutes</option>
                            <option value={45}>45 minutes</option>
                            <option value={60}>1 hour</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Description</label>
                        <textarea className="form-input" rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    {/* Location Section */}
                    <div style={{ gridColumn: '1 / -1', marginBottom: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <label className="form-label" style={{ margin: 0 }}>📍 Salon Location *</label>
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={getCurrentLocation}
                                disabled={gettingLocation}
                            >
                                {gettingLocation ? (
                                    <>
                                        <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                                        Detecting...
                                    </>
                                ) : (
                                    <>📍 Use My Current Location</>
                                )}
                            </button>
                        </div>
                        {formData.latitude && formData.longitude && (
                            <p style={{ color: 'var(--success)', fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
                                ✅ Location set: {formData.latitude}, {formData.longitude}
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Latitude *</label>
                        <input type="number" step="any" className="form-input" placeholder="e.g. 28.6139" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Longitude *</label>
                        <input type="number" step="any" className="form-input" placeholder="e.g. 77.2090" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Full Address</label>
                        <input type="text" className="form-input" placeholder="Street address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">City</label>
                        <input type="text" className="form-input" placeholder="e.g. Delhi" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : (salon ? 'Update Salon' : 'Create Salon')}
                </button>
            </form>
        </>
    );
};

// Services Management
const ServicesManagement = () => {
    const [salon, setSalon] = useState(null);
    const [services, setServices] = useState([]);
    const [newService, setNewService] = useState({ name: '', category: 'haircut', price: '', duration: 30 });
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const response = await salonAPI.getMySalon();
            setSalon(response.data.data.salon);
            setServices(response.data.data.services);
        } catch {
            toast.error('Please create a salon first');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await salonAPI.addService(salon._id, newService);
            toast.success('Service added');
            setNewService({ name: '', category: 'haircut', price: '', duration: 30 });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (serviceId) => {
        if (!window.confirm('Delete this service?')) return;
        try {
            await salonAPI.deleteService(salon._id, serviceId);
            toast.success('Service deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    if (loading) return <div className="spinner"></div>;
    if (!salon) return <div className="glass-card"><p>Please create a salon first.</p><Link to="/owner/salon" className="btn btn-primary">Create Salon</Link></div>;

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>Services</h1>

            <form onSubmit={handleAdd} className="glass-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Add New Service</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input type="text" className="form-input" placeholder="Service name" value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} required style={{ flex: 2 }} />
                    <select className="form-input form-select" value={newService.category} onChange={e => setNewService({ ...newService, category: e.target.value })} style={{ flex: 1 }}>
                        {['haircut', 'beard', 'shave', 'facial', 'spa', 'massage', 'hair-color', 'manicure', 'pedicure', 'other'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <input type="number" className="form-input" placeholder="Price" value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} required style={{ width: '100px' }} />
                    <input type="number" className="form-input" placeholder="Duration (min)" value={newService.duration} onChange={e => setNewService({ ...newService, duration: e.target.value })} style={{ width: '100px' }} />
                    <button type="submit" className="btn btn-primary">Add</button>
                </div>
            </form>

            <div className="table-container">
                <table className="table">
                    <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Duration</th><th>Actions</th></tr></thead>
                    <tbody>
                        {services.map(s => (
                            <tr key={s._id}>
                                <td>{s.name}</td>
                                <td><span className="badge badge-info">{s.category}</span></td>
                                <td>₹{s.price}</td>
                                <td>{s.duration} min</td>
                                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

// Slots Management
const SlotsManagement = () => {
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const response = await slotAPI.generate({ startDate, endDate });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>Manage Slots</h1>

            <div className="glass-card">
                <h3 style={{ marginBottom: '1rem' }}>Generate Time Slots</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Slots are generated based on your salon's working hours and slot duration.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
                        {generating ? 'Generating...' : 'Generate Slots'}
                    </button>
                </div>
            </div>
        </>
    );
};

// Bookings Management
const BookingsManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchBookings(); }, [date]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await bookingAPI.getSalonBookings({ date });
            setBookings(response.data.data);
        } catch (error) {
            console.log('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await bookingAPI.updateStatus(id, { status });
            toast.success(`Booking ${status}`);
            fetchBookings();
        } catch (error) {
            toast.error('Failed to update');
        }
    };

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>Bookings</h1>

            <div style={{ marginBottom: '1rem' }}>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} style={{ width: 'auto' }} />
            </div>

            {loading ? <div className="spinner"></div> : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Time</th><th>Customer</th><th>Contact</th><th>Services</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No bookings for this date</td></tr>
                            ) : bookings.map(b => (
                                <tr key={b._id}>
                                    <td>{b.bookingTime}</td>
                                    <td>{b.customer?.name}</td>
                                    <td>{b.customer?.phone || b.customer?.email}</td>
                                    <td>{b.services.map(s => s.name).join(', ')}</td>
                                    <td>₹{b.totalAmount}</td>
                                    <td><span className={`badge badge-${b.status === 'confirmed' ? 'success' : b.status === 'cancelled' ? 'error' : 'warning'}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'confirmed' && (
                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(b._id, 'completed')}>Complete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

// Main Dashboard
const SalonOwnerDashboard = () => {
    return (
        <>
            <Sidebar />
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/salon" element={<SalonManagement />} />
                    <Route path="/services" element={<ServicesManagement />} />
                    <Route path="/slots" element={<SlotsManagement />} />
                    <Route path="/bookings" element={<BookingsManagement />} />
                </Routes>
            </div>
        </>
    );
};

export default SalonOwnerDashboard;
