import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salonAPI } from '../services/api';
import toast from 'react-hot-toast';

const SalonList = () => {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locationStatus, setLocationStatus] = useState('detecting'); // detecting, success, fallback, error
    const [radius, setRadius] = useState(5);
    const [sortBy, setSortBy] = useState('distance');

    // Get user location
    const requestLocation = async () => {
        setLocationStatus('detecting');

        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            setLocationStatus('error');
            setLocation({ lat: 28.6139, lng: 77.2090 });
            return;
        }

        // Check permission status first
        if (navigator.permissions) {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                console.log('Location permission:', permission.state);

                if (permission.state === 'denied') {
                    toast.error('Location BLOCKED! Click 🔒 in address bar → Location → Allow');
                    setLocationStatus('fallback');
                    setLocation({ lat: 28.6139, lng: 77.2090 });
                    return;
                }
            } catch (e) {
                console.log('Permission API not available');
            }
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLocationStatus('success');
                toast.success('Location detected!');
            },
            (error) => {
                console.error('Location error:', error);
                // Use fallback location (Delhi)
                setLocation({ lat: 28.6139, lng: 77.2090 });
                setLocationStatus('fallback');

                if (error.code === error.PERMISSION_DENIED) {
                    toast.error('Location blocked. Click 🔒 icon in address bar to allow.');
                } else if (error.code === error.TIMEOUT) {
                    toast.error('Location timed out. Check Windows Settings → Privacy → Location');
                } else {
                    toast.error('Could not get your location. Showing salons in Delhi.');
                }
            },
            {
                enableHighAccuracy: false, // Faster on PCs
                timeout: 30000,            // 30 seconds
                maximumAge: 60000          // Accept 1 minute old cache
            }
        );
    };

    useEffect(() => {
        requestLocation();
    }, []);

    // Fetch salons when location is available
    useEffect(() => {
        if (location.lat && location.lng) {
            fetchSalons();
        }
    }, [location, radius, sortBy]);

    const fetchSalons = async () => {
        setLoading(true);
        try {
            const response = await salonAPI.getNearby({
                lat: location.lat,
                lng: location.lng,
                radius,
                sortBy
            });
            setSalons(response.data.data);
        } catch (error) {
            console.error('Error fetching salons:', error);
            setSalons([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
            <div className="fade-in">
                {/* Page Header */}
                <div className="page-header">
                    <h1>Nearby Salons</h1>
                    <p>Find and book the best salons near you</p>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--spacing-xs)' }}>
                            📍 Radius
                        </label>
                        <select
                            className="form-input form-select"
                            value={radius}
                            onChange={(e) => setRadius(Number(e.target.value))}
                            style={{ width: 'auto', minWidth: '120px' }}
                        >
                            <option value={2}>2 km</option>
                            <option value={5}>5 km</option>
                            <option value={10}>10 km</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label" style={{ marginBottom: 'var(--spacing-xs)' }}>
                            🔄 Sort By
                        </label>
                        <select
                            className="form-input form-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: 'auto', minWidth: '140px' }}
                        >
                            <option value="distance">Nearest</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={requestLocation}
                            disabled={locationStatus === 'detecting'}
                        >
                            {locationStatus === 'detecting' ? (
                                <>
                                    <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                                    Detecting...
                                </>
                            ) : (
                                <>📍 Update Location</>
                            )}
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={fetchSalons}
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Location Status */}
                {locationStatus !== 'detecting' && (
                    <div style={{
                        marginBottom: 'var(--spacing-lg)',
                        padding: 'var(--spacing-md)',
                        borderRadius: 'var(--radius-md)',
                        background: locationStatus === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        border: `1px solid ${locationStatus === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        fontSize: '0.875rem'
                    }}>
                        {locationStatus === 'success' ? (
                            <span style={{ color: 'var(--success)' }}>
                                ✅ Using your current location ({location.lat?.toFixed(4)}, {location.lng?.toFixed(4)})
                            </span>
                        ) : (
                            <span style={{ color: 'var(--warning)' }}>
                                ⚠️ Could not detect your location. Showing salons in Delhi.
                                <button
                                    onClick={requestLocation}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary-light)',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        marginLeft: 'var(--spacing-sm)'
                                    }}
                                >
                                    Try again
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Salon Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                        <p className="loading-text" style={{ marginTop: 'var(--spacing-lg)' }}>
                            Finding salons near you...
                        </p>
                    </div>
                ) : salons.length === 0 ? (
                    <div className="glass-card empty-state">
                        <div className="empty-state-icon">🔍</div>
                        <h3>No salons found nearby</h3>
                        <p>Try increasing the search radius or check back later.</p>
                        <button className="btn btn-primary" onClick={() => setRadius(10)}>
                            Expand to 10 km
                        </button>
                    </div>
                ) : (
                    <>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: 'var(--spacing-lg)',
                            fontSize: '0.9375rem'
                        }}>
                            Found <strong style={{ color: 'var(--primary-light)' }}>{salons.length}</strong> salons within {radius} km
                        </p>
                        <div className="salon-grid">
                            {salons.map((salon, index) => (
                                <Link
                                    to={`/salons/${salon._id}`}
                                    key={salon._id}
                                    style={{ textDecoration: 'none' }}
                                    className={`fade-in-up stagger-${(index % 4) + 1}`}
                                >
                                    <div className="salon-card">
                                        <div className="salon-image-wrapper">
                                            <img
                                                src={salon.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'}
                                                alt={salon.name}
                                                className="salon-image"
                                            />
                                        </div>
                                        <div className="salon-content">
                                            <h3 className="salon-name">{salon.name}</h3>
                                            <div className="salon-location">
                                                📍 {salon.location?.city || salon.location?.formattedAddress || 'Location'}
                                            </div>
                                            <div className="salon-rating">
                                                ⭐ {salon.averageRating?.toFixed(1) || 'New'}
                                                <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--spacing-sm)', fontWeight: '400' }}>
                                                    ({salon.totalReviews || 0} reviews)
                                                </span>
                                            </div>
                                            <span className="salon-distance">
                                                📍 {salon.distanceKm || (salon.distance / 1000).toFixed(1)} km away
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SalonList;
