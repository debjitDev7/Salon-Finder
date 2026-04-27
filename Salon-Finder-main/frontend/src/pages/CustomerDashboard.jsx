import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let response;
            if (activeTab === 'upcoming') {
                response = await bookingAPI.getUpcoming();
            } else {
                response = await bookingAPI.getMyBookings({ status: activeTab === 'past' ? 'completed' : undefined });
            }
            setBookings(response.data.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await bookingAPI.cancel(bookingId, 'Cancelled by customer');
            toast.success('Booking cancelled');
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'badge-warning',
            confirmed: 'badge-success',
            completed: 'badge-info',
            cancelled: 'badge-error'
        };
        return `badge ${styles[status] || 'badge-info'}`;
    };

    const tabs = [
        { id: 'upcoming', label: 'Upcoming', icon: '📅' },
        { id: 'all', label: 'All Bookings', icon: '📋' },
        { id: 'past', label: 'Past', icon: '✅' }
    ];

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-lg)' }}>
            <div className="fade-in">
                {/* Welcome Header */}
                <div className="glass-card" style={{ marginBottom: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'var(--primary-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        boxShadow: '0 0 30px var(--primary-glow)'
                    }}>
                        👋
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.75rem' }}>
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                            Manage your salon appointments and bookings
                        </p>
                    </div>
                    <Link to="/salons" className="btn btn-primary">
                        🔍 Find Salons
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="stat-card">
                        <div className="stat-value">{bookings.length}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length}
                        </div>
                        <div className="stat-label">Upcoming</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">
                            {bookings.filter(b => b.status === 'completed').length}
                        </div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span style={{ marginRight: 'var(--spacing-sm)' }}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Bookings List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                        <p className="loading-text" style={{ marginTop: 'var(--spacing-lg)' }}>Loading bookings...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="glass-card empty-state">
                        <div className="empty-state-icon">📭</div>
                        <h3>No bookings found</h3>
                        <p>
                            {activeTab === 'upcoming'
                                ? "You don't have any upcoming appointments."
                                : "No bookings to show."}
                        </p>
                        <Link to="/salons" className="btn btn-primary">
                            Find Salons
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {bookings.map((booking, index) => (
                            <div
                                key={booking._id}
                                className={`booking-card fade-in-up stagger-${(index % 4) + 1}`}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: 'var(--radius-md)',
                                                background: 'var(--primary-gradient-soft)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.25rem'
                                            }}>
                                                💇
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{booking.salon?.name}</h3>
                                                <span className={getStatusBadge(booking.status)} style={{ marginTop: 'var(--spacing-xs)' }}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gap: 'var(--spacing-sm)', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                                            <p style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', margin: 0 }}>
                                                📅 {format(new Date(booking.bookingDate), 'EEEE, MMM d, yyyy')} at {booking.bookingTime}
                                            </p>
                                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                                                💇 {booking.services.map(s => s.name).join(' • ')}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-md)' }}>
                                        <p style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            margin: 0,
                                            background: 'var(--primary-gradient)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            ₹{booking.totalAmount}
                                        </p>
                                        {['pending', 'confirmed'].includes(booking.status) && (
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleCancel(booking._id)}
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
