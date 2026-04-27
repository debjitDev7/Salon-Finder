import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    // Register new user
    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        const { token: newToken, user: newUser } = response.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        return response.data;
    };

    // Login user
    const login = async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        const { token: newToken, user: newUser } = response.data.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(newUser);
        return response.data;
    };

    // Logout user
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    // Update user profile
    const updateProfile = async (data) => {
        const response = await api.put('/auth/profile', data);
        setUser(response.data.data);
        return response.data;
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
