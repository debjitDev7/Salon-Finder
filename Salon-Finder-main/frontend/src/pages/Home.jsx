import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="hero">
            <div className="container">
                <div className="fade-in">
                    <h1 className="hero-title">
                        Book Your Perfect<br />Salon Experience
                    </h1>
                    <p className="hero-subtitle">
                        Find nearby salons, compare prices, and book appointments instantly.
                        Save time with real-time slot availability.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/salons" className="btn btn-primary btn-lg">
                            🔍 Find Salons Near Me
                        </Link>
                        <Link to="/register" className="btn btn-secondary btn-lg">
                            Register Your Salon
                        </Link>
                    </div>

                    {/* Features */}
                    <div className="features-grid">
                        <div className="feature-card fade-in-up stagger-1">
                            <span className="feature-icon">📍</span>
                            <h3>Location Based</h3>
                            <p>
                                Find salons within 2-10 km of your location with real-time distance calculation.
                            </p>
                        </div>
                        <div className="feature-card fade-in-up stagger-2">
                            <span className="feature-icon">⏰</span>
                            <h3>Real-time Slots</h3>
                            <p>
                                See available time slots instantly and book with a single click.
                            </p>
                        </div>
                        <div className="feature-card fade-in-up stagger-3">
                            <span className="feature-icon">💰</span>
                            <h3>Compare Prices</h3>
                            <p>
                                View services and prices from multiple salons before booking.
                            </p>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div style={{
                        marginTop: 'var(--spacing-3xl)',
                        textAlign: 'center',
                        padding: 'var(--spacing-xl) 0',
                        borderTop: '1px solid var(--border-glass)'
                    }}>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            Trusted by salons & customers
                        </p>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 'var(--spacing-2xl)',
                            flexWrap: 'wrap'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    background: 'var(--primary-gradient)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>500+</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Salons</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    background: 'var(--primary-gradient)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>10K+</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Bookings</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    fontWeight: '700',
                                    background: 'var(--primary-gradient)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>4.8★</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
