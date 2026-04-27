import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'admin':
                return '/admin';
            case 'salonOwner':
                return '/owner';
            default:
                return '/dashboard';
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">✨</span>
                    SalonFinder
                </Link>

                <button
                    className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
                    <li>
                        <Link
                            to="/salons"
                            className={`nav-link ${location.pathname === '/salons' ? 'active' : ''}`}
                        >
                            Find Salons
                        </Link>
                    </li>

                    {isAuthenticated ? (
                        <>
                            <li>
                                <Link
                                    to={getDashboardLink()}
                                    className={`nav-link ${location.pathname.includes('dashboard') || location.pathname.includes('admin') || location.pathname.includes('owner') ? 'active' : ''}`}
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <span className="nav-link" style={{ cursor: 'default', color: 'var(--primary-light)' }}>
                                    👋 {user?.name?.split(' ')[0]}
                                </span>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link
                                    to="/login"
                                    className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                                >
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                    Get Started
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
