import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'customer'
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await register(registerData);
            toast.success(response.message || 'Registration successful!');

            if (formData.role === 'salonOwner') {
                navigate('/owner');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <Link to="/" style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <span>✨</span> SalonFinder
                    </Link>
                </div>

                <h2 className="auth-title">Create Account</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            placeholder="+91 9876543210"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">I want to</label>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--spacing-md)'
                        }}>
                            <button
                                type="button"
                                className={`btn ${formData.role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFormData({ ...formData, role: 'customer' })}
                                style={{ padding: 'var(--spacing-md)', flexDirection: 'column', height: 'auto' }}
                            >
                                <span style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-xs)' }}>💇</span>
                                <span style={{ fontSize: '0.875rem' }}>Book Appointments</span>
                            </button>
                            <button
                                type="button"
                                className={`btn ${formData.role === 'salonOwner' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFormData({ ...formData, role: 'salonOwner' })}
                                style={{ padding: 'var(--spacing-md)', flexDirection: 'column', height: 'auto' }}
                            >
                                <span style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-xs)' }}>💼</span>
                                <span style={{ fontSize: '0.875rem' }}>Register My Salon</span>
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></span>
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
