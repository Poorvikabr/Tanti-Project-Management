import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      // Map frontend data to backend format
      const registerData = {
        full_name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        region: userData.region
      };

      await axios.post(`${API_URL}/auth/register`, registerData);

      // Auto-login after successful registration
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: userData.email,
        password: userData.password
      });

      const { token: newToken, user: userData_response } = loginResponse.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData_response);

      return { success: true };
    } catch (error) {
      const detail = error.response?.data?.detail;
      // If the email already exists, try logging in automatically
      if (error.response?.status === 400 && typeof detail === 'string' && detail.toLowerCase().includes('already')) {
        try {
          const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: userData.email,
            password: userData.password
          });
          const { token: newToken, user: userData_response } = loginResponse.data;
          localStorage.setItem('token', newToken);
          setToken(newToken);
          setUser(userData_response);
          return { success: true };
        } catch (e) {
          return { success: false, error: 'Account exists. Please sign in.' };
        }
      }
      return { success: false, error: detail || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
