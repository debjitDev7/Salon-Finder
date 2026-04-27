import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salonAPI, slotAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, addDays } from 'date-fns';

const SalonDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [salon, setSalon] = useState(null);
    const [services, setServices] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        fetchSalonDetails();
    }, [id]);

    useEffect(() => {
        if (salon) {
            fetchSlots();
        }
    }, [selectedDate, salon]);

    const fetchSalonDetails = async () => {
        try {
            const response = await salonAPI.getById(id);
            setSalon(response.data.data.salon);
            setServices(response.data.data.services);
        } catch (error) {
            toast.error('Failed to load salon details');
            navigate('/salons');
        } finally {
            setLoading(false);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await slotAPI.getSalonSlots(id, selectedDate);
            setSlots(response.data.data);
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    };

    const toggleService = (serviceId) => {
        setSelectedServices(prev =>
            prev.includes(serviceId)
                ? prev.filter(id => id !== serviceId)
                : [...prev, serviceId]
        );
    };

    const getTotalPrice = () => {
        return services
            .filter(s => selectedServices.includes(s._id))
            .reduce((sum, s) => sum + s.price, 0);
    };

    const handleBooking = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to book');
            navigate('/login');
            return;
        }

        if (user.role !== 'customer') {
            toast.error('Only customers can book appointments');
            return;
        }

        if (selectedServices.length === 0) {
            toast.error('Please select at least one service');
            return;
        }

        if (!selectedSlot) {
            toast.error('Please select a time slot');
            return;
        }

        setBooking(true);
        try {
            const response = await bookingAPI.create({
                slotId: selectedSlot,
                serviceIds: selectedServices
            });
            toast.success('Booking confirmed!');
            navigate(`/booking/confirmation/${response.data.data._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setBooking(false);
        }
    };

    // Generate date options for next 7 days
    const dateOptions = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(new Date(), i);
        return {
            value: format(date, 'yyyy-MM-dd'),
            label: format(date, 'EEE'),
            date: format(date, 'd'),
            month: format(date, 'MMM')
        };
    });

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p className="loading-text">Loading salon details...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-lg)', paddingBottom: selectedServices.length > 0 || selectedSlot ? '140px' : 'var(--spacing-xl)' }}>
            <div className="fade-in">
                {/* Salon Header */}
                <div className="glass-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                            <img
                                src={salon.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'}
                                alt={salon.name}
                                style={{
                                    width: '320px',
                                    height: '220px',
                                    objectFit: 'cover',
                                    display: 'block'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: 'var(--spacing-md)',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                            }}>
                                <span className="salon-distance">
                                    📍 {salon.distanceKm || '2.5'} km away
                                </span>
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: '280px' }}>
                            <h1 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.75rem' }}>{salon.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                📍 {salon.location?.formattedAddress || salon.location?.city || 'Location unavailable'}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
                                <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                                    ⭐ {salon.averageRating?.toFixed(1) || 'New'}
                                </span>
                                <span className="badge badge-info" style={{ fontSize: '0.875rem', padding: 'var(--spacing-sm) var(--spacing-md)' }}>
                                    💬 {salon.totalReviews || 0} reviews
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: 'var(--spacing-md)' }}>
                                {salon.description || 'Welcome to our salon! We offer premium grooming services with experienced professionals.'}
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                                <span>📞 {salon.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 'var(--spacing-xl)' }}>
                    {/* Services */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span>💇</span> Select Services
                        </h3>
                        <div className="service-list">
                            {services.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                    No services available
                                </p>
                            ) : (
                                services.map(service => (
                                    <div
                                        key={service._id}
                                        className={`service-item ${selectedServices.includes(service._id) ? 'selected' : ''}`}
                                        onClick={() => toggleService(service._id)}
                                        style={{ position: 'relative' }}
                                    >
                                        <div>
                                            <div className="service-name">{service.name}</div>
                                            <div className="service-meta">
                                                ⏱ {service.duration} mins • {service.category}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                            <div className="service-price">₹{service.price}</div>
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: selectedServices.includes(service._id) ? 'none' : '2px solid var(--border-glass)',
                                                background: selectedServices.includes(service._id) ? 'var(--primary-gradient)' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                transition: 'all var(--transition-fast)'
                                            }}>
                                                {selectedServices.includes(service._id) && '✓'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Date & Slots */}
                    <div className="glass-card">
                        <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <span>📅</span> Select Date & Time
                        </h3>

                        {/* Date Picker */}
                        <div style={{
                            display: 'flex',
                            gap: 'var(--spacing-sm)',
                            marginBottom: 'var(--spacing-xl)',
                            overflowX: 'auto',
                            paddingBottom: 'var(--spacing-sm)'
                        }}>
                            {dateOptions.map(({ value, label, date, month }) => (
                                <button
                                    key={value}
                                    className={`btn ${selectedDate === value ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => {
                                        setSelectedDate(value);
                                        setSelectedSlot(null);
                                    }}
                                    style={{
                                        flexDirection: 'column',
                                        padding: 'var(--spacing-md)',
                                        minWidth: '70px'
                                    }}
                                >
                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{label}</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>{date}</span>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{month}</span>
                                </button>
                            ))}
                        </div>

                        {/* Time Slots */}
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>
                            Available time slots:
                        </p>
                        <div className="slots-container" style={{ marginTop: 'var(--spacing-lg)' }}>
                            {slots.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                    No slots available for this date
                                </p>
                            ) : (
                                slots.map(slot => (
                                    <button
                                        key={slot._id}
                                        className={`slot-btn ${selectedSlot === slot._id ? 'selected' : ''}`}
                                        onClick={() => setSelectedSlot(slot._id)}
                                        disabled={!slot.isAvailable}
                                    >
                                        {slot.startTime}
                                        {!slot.isAvailable && <span style={{ display: 'block', fontSize: '0.625rem', opacity: 0.7 }}>Booked</span>}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Booking Summary - Fixed at bottom */}
                {(selectedServices.length > 0 || selectedSlot) && (
                    <div className="booking-summary-bar" style={{
                        position: 'fixed',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        padding: 'var(--spacing-lg) var(--spacing-xl)',
                        background: 'linear-gradient(135deg, rgba(20, 15, 35, 0.98) 0%, rgba(30, 20, 45, 0.98) 100%)',
                        backdropFilter: 'blur(30px)',
                        borderTop: '1px solid rgba(139, 92, 246, 0.3)',
                        zIndex: 100,
                        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
                            <div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--spacing-xs)' }}>
                                    {selectedServices.length} service(s) selected
                                    {selectedSlot && ' • Time slot selected'}
                                </p>
                                <p style={{ fontSize: '1.75rem', fontWeight: '800' }}>
                                    <span style={{
                                        background: 'var(--primary-gradient)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>
                                        ₹{getTotalPrice()}
                                    </span>
                                </p>
                            </div>
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleBooking}
                                disabled={booking || selectedServices.length === 0 || !selectedSlot}
                            >
                                {booking ? (
                                    <>
                                        <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                                        Booking...
                                    </>
                                ) : (
                                    <>✨ Confirm Booking</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalonDetails;
