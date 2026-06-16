import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('store_user');
    const storedToken = localStorage.getItem('store_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Fetch helper with auth header pre-applied
  const authFetch = async (endpoint, options = {}) => {
    const activeToken = token || localStorage.getItem('store_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Auto-logout if token expires/fails
    if (response.status === 401 || response.status === 403) {
      logout();
    }
    
    return response;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Login failed.');
    }
    
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('store_user', JSON.stringify(data.user));
    localStorage.setItem('store_token', data.token);
    
    return data.user;
  };

  const registerUser = async (userData) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed.');
    }
    
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('store_user', JSON.stringify(data.user));
    localStorage.setItem('store_token', data.token);
    
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('store_user');
    localStorage.removeItem('store_token');
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await authFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update password.');
    }
    
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout, changePassword, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
