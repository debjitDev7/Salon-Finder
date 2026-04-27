import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layout components
import Navbar from './components/Navbar';

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SalonList from './pages/SalonList';
import SalonDetails from './pages/SalonDetails';

// Customer pages
import CustomerDashboard from './pages/CustomerDashboard';
import BookingConfirmation from './pages/BookingConfirmation';

// Salon owner pages
import SalonOwnerDashboard from './pages/SalonOwnerDashboard';

// Admin pages
import AdminPanel from './pages/AdminPanel';

// Protected Route component
const ProtectedRoute = ({ children, roles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (roles.length > 0 && !roles.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }
                }}
            />

            <Routes>
                {/* Public routes */}
                <Route path="/" element={<><Navbar /><Home /></>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/salons" element={<><Navbar /><SalonList /></>} />
                <Route path="/salons/:id" element={<><Navbar /><SalonDetails /></>} />

                {/* Customer routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute roles={['customer']}>
                            <Navbar />
                            <CustomerDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/booking/confirmation/:id"
                    element={
                        <ProtectedRoute roles={['customer']}>
                            <Navbar />
                            <BookingConfirmation />
                        </ProtectedRoute>
                    }
                />

                {/* Salon owner routes */}
                <Route
                    path="/owner/*"
                    element={
                        <ProtectedRoute roles={['salonOwner']}>
                            <SalonOwnerDashboard />
                        </ProtectedRoute>
                    }
                />

                {/* Admin routes */}
                <Route
                    path="/admin/*"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <AdminPanel />
                        </ProtectedRoute>
                    }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

export default App;
