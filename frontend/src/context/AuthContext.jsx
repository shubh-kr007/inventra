import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('inventra_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on mount or token changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profile = await response.json();
          setUser(profile);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        console.error('Failed to validate session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogin = async (username, password) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Invalid username or password.');
      }

      localStorage.setItem('inventra_token', data.access_token);
      setToken(data.access_token);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleRegister = async (username, email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle array validation errors or detail strings
        const errMsg = Array.isArray(data.detail) 
          ? data.detail[0]?.msg 
          : data.detail || 'Registration failed.';
        throw new Error(errMsg);
      }

      // Automatically log the user in after registration
      return await handleLogin(username, password);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleGoogleLogin = async (credential) => {
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Google Login failed.');
      }

      localStorage.setItem('inventra_token', data.access_token);
      setToken(data.access_token);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('inventra_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      login: handleLogin,
      register: handleRegister,
      googleLogin: handleGoogleLogin,
      logout: handleLogout,
      setError
    }}>
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
