import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
  // Directly set the authenticated user profile to bypass the login screen
  const [user] = useState({
    username: 'admin',
    email: 'admin@inventra.com',
    auth_provider: 'local'
  });
  const [token] = useState('dummy_inventra_token');
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => true;
  const handleRegister = async () => true;
  const handleGoogleLogin = async () => true;
  const handleLogout = () => {};

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
