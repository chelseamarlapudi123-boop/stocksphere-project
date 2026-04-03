import React, { useEffect, useState } from 'react';
import { AuthContext } from './auth-context';
import API from '../utils/api';

const USER_STORAGE_KEY = 'currentUser';
const TOKEN_STORAGE_KEY = 'authToken';

const getStoredUser = () => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));

  const API_BASE = `${API}/api`;

  const register = async (payload) => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        const detail = data.error ? ` - ${data.error}` : '';
        throw new Error((data.message || 'Registration failed') + detail);
      }
      return { success: true, data };
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password, role) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await response.json();

      if (!response.ok) {
        const detail = data.error ? ` - ${data.error}` : '';
        throw new Error((data.message || 'Login failed') + detail);
      }

      const user = data.user;
      const token = data.token;

      setCurrentUser(user);
      setAuthToken(token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_STORAGE_KEY, token);

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const isAdmin = currentUser?.role === 'admin';
  const isAuthenticated = Boolean(currentUser && authToken);

  return (
    <AuthContext.Provider value={{ currentUser, authToken, isAuthenticated, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};


