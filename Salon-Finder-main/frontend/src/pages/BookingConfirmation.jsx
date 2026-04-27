import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { format } from 'date-fns';

const BookingConfirmation = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        try {
            const response = await bookingAPI.getById(id);
            setBooking(response.data.data);
        } catch (error) {
            console.error('Error fetching booking:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p className="loading-text">Loading booking details...</p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="container" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                <div className="glass-card empty-state">
                    <div className="empty-state-icon">🔍</div>
                    <h2>Booking not found</h2>
                    <p>We couldn't find this booking. It may have been cancelled or doesn't exist.</p>
                    <Link to="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-lg)', maxWidth: '640px' }}>
            <div className="glass-card fade-in" style={{ textAlign: 'center' }}>
                {/* Success Animation */}
                <div className="success-checkmark">
                    ✓
                </div>

                <h1 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.75rem' }}>Booking Confirmed!</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
                    Your appointment has been successfully booked.
                </p>

                {/* Booking Details Card */}
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--spacing-xl)',
                    textAlign: 'left',
                    marginBottom: 'var(--spacing-xl)',
                    border: '1px solid var(--border-glass)'
                }}>
                    <h3 style={{
                        marginBottom: 'var(--spacing-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <span style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--primary-gradient-soft)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.25rem'
                        }}>💇</span>
                        {booking.salon?.name}
                    </h3>

                    <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>📅</span>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 var(--spacing-xs)' }}>Date & Time</p>
                                <p style={{ fontWeight: '600', margin: 0 }}>
                                    {format(new Date(booking.bookingDate), 'EEEE, MMMM d, yyyy')}
                                </p>
                                <p style={{ color: 'var(--primary-light)', fontWeight: '600', margin: 0 }}>
                                    at {booking.bookingTime}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>💇</span>
                            <div style={{ flex: 1 }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 var(--spacing-xs)' }}>Services</p>
                                {booking.services.map((s, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: i < booking.services.length - 1 ? 'var(--spacing-xs)' : 0
                                    }}>
                                        <span style={{ fontWeight: '500' }}>{s.name}</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>₹{s.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: 'var(--spacing-lg)',
                            background: 'var(--primary-gradient-soft)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                            <span style={{ fontWeight: '500' }}>Total Amount</span>
                            <span style={{
                                fontWeight: '800',
                                fontSize: '1.5rem',
                                background: 'var(--primary-gradient)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                ₹{booking.totalAmount}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 var(--spacing-xs)' }}>Status</p>
                                <span className="badge badge-success">{booking.status}</span>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)'
                            }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 var(--spacing-xs)' }}>Booking ID</p>
                                <p style={{ fontWeight: '500', margin: 0, fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                    #{booking._id.slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>📍</span>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 var(--spacing-xs)' }}>Location</p>
                                <p style={{ margin: 0 }}>{booking.salon?.location?.formattedAddress || 'View on map'}</p>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 'var(--spacing-md)',
                            padding: 'var(--spacing-md)',
                            background: 'var(--bg-glass)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>📞</span>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 var(--spacing-xs)' }}>Contact</p>
                                <p style={{ margin: 0 }}>{booking.salon?.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/dashboard" className="btn btn-primary">
                        📅 View My Bookings
                    </Link>
                    <Link to="/salons" className="btn btn-secondary">
                        🔍 Book Another
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
