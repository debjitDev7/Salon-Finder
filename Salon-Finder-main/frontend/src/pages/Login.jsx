import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await login(formData);
            toast.success(response.message || 'Login successful!');

            // Redirect based on role
            const user = response.data.user;
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'salonOwner') {
                navigate('/owner');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
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

                <h2 className="auth-title">Welcome Back</h2>

                <form onSubmit={handleSubmit}>
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
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 'var(--spacing-lg)'
                    }}>
                        <Link
                            to="#"
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            Forgot password?
                        </Link>
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
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="divider">or</div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                        disabled
                    >
                        🔵 Google
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                        disabled
                    >
                        🍎 Apple
                    </button>
                </div>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
