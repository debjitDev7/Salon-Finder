import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Sidebar
const AdminSidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const links = [
        { path: '/admin', label: '📊 Dashboard', exact: true },
        { path: '/admin/salons', label: '🏪 Salons' },
        { path: '/admin/users', label: '👥 Users' },
        { path: '/admin/bookings', label: '📋 Bookings' }
    ];

    return (
        <div className="dashboard-sidebar">
            <Link to="/" className="navbar-brand">✨ Admin Panel</Link>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                {user?.name}
            </p>

            <ul className="sidebar-nav">
                {links.map(link => (
                    <li key={link.path}>
                        <Link
                            to={link.path}
                            className={`sidebar-link ${(link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path) && link.path !== '/admin') ? 'active' : ''}`}
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
const AdminDashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="spinner"></div>;

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>

            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">{stats.users?.customers || 0}</div>
                        <div className="stat-label">Customers</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.users?.salonOwners || 0}</div>
                        <div className="stat-label">Salon Owners</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.salons?.total || 0}</div>
                        <div className="stat-label">Total Salons</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.salons?.pending || 0}</div>
                        <div className="stat-label">Pending Verification</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.bookings?.total || 0}</div>
                        <div className="stat-label">Total Bookings</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{stats.bookings?.completed || 0}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                </div>
            )}
        </>
    );
};

// Salons Management
const SalonsManagement = () => {
    const [salons, setSalons] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchSalons(); }, [filter]);

    const fetchSalons = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter === 'pending') params.isVerified = false;
            if (filter === 'verified') params.isVerified = true;
            const response = await adminAPI.getSalons(params);
            setSalons(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await adminAPI.verifySalon(id);
            toast.success('Salon verified');
            fetchSalons();
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleBlock = async (id) => {
        if (!window.confirm('Block this salon?')) return;
        try {
            await adminAPI.blockSalon(id);
            toast.success('Salon blocked');
            fetchSalons();
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleUnblock = async (id) => {
        try {
            await adminAPI.unblockSalon(id);
            toast.success('Salon unblocked');
            fetchSalons();
        } catch (error) {
            toast.error('Failed');
        }
    };

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>Manage Salons</h1>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                {['all', 'pending', 'verified'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="spinner"></div> : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Name</th><th>Owner</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {salons.map(s => (
                                <tr key={s._id}>
                                    <td>{s.name}</td>
                                    <td>{s.owner?.name}<br /><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.owner?.email}</span></td>
                                    <td>{s.location?.city || 'N/A'}</td>
                                    <td>
                                        <span className={`badge ${s.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                            {s.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                        {!s.isActive && <span className="badge badge-error" style={{ marginLeft: '0.5rem' }}>Blocked</span>}
                                    </td>
                                    <td>
                                        {!s.isVerified && <button className="btn btn-success btn-sm" onClick={() => handleVerify(s._id)}>Verify</button>}
                                        {s.isActive ? (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleBlock(s._id)} style={{ marginLeft: '0.5rem' }}>Block</button>
                                        ) : (
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleUnblock(s._id)} style={{ marginLeft: '0.5rem' }}>Unblock</button>
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

// Users Management
const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchUsers(); }, [roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (roleFilter) params.role = roleFilter;
            const response = await adminAPI.getUsers(params);
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await adminAPI.toggleUserActive(id);
            toast.success('User updated');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>Manage Users</h1>

            <div style={{ marginBottom: '1rem' }}>
                <select className="form-input form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto' }}>
                    <option value="">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="salonOwner">Salon Owners</option>
                </select>
            </div>

            {loading ? <div className="spinner"></div> : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td><span className="badge badge-info">{u.role}</span></td>
                                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        {u.role !== 'admin' && (
                                            <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(u._id)}>
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
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

// Bookings View
const BookingsView = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        try {
            const response = await adminAPI.getBookings({ limit: 50 });
            setBookings(response.data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h1 style={{ marginBottom: '2rem' }}>All Bookings</h1>

            {loading ? <div className="spinner"></div> : (
                <div className="table-container">
                    <table className="table">
                        <thead><tr><th>Date</th><th>Customer</th><th>Salon</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b._id}>
                                    <td>{new Date(b.bookingDate).toLocaleDateString()} {b.bookingTime}</td>
                                    <td>{b.customer?.name}</td>
                                    <td>{b.salon?.name}</td>
                                    <td>₹{b.totalAmount}</td>
                                    <td><span className={`badge badge-${b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'error' : 'warning'}`}>{b.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
};

// Main Admin Panel
const AdminPanel = () => {
    return (
        <>
            <AdminSidebar />
            <div className="dashboard-content">
                <Routes>
                    <Route path="/" element={<AdminDashboardHome />} />
                    <Route path="/salons" element={<SalonsManagement />} />
                    <Route path="/users" element={<UsersManagement />} />
                    <Route path="/bookings" element={<BookingsView />} />
                </Routes>
            </div>
        </>
    );
};

export default AdminPanel;
