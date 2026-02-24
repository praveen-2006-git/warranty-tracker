import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';




























const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};





export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }

          // Set auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Get user data
          const res = await axios.get('/api/users/profile');
          setUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const googleLogin = async (credential) => {
    try {
      const res = await axios.post('/api/users/google-login', { credential });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/users/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  const uploadAvatar = async (formData) => {
    try {
      const res = await axios.post('/api/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser({ ...user, avatarUrl: res.data.avatarUrl });
      return Promise.resolve(res);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        googleLogin,
        register,
        logout,
        updateUser,
        uploadAvatar
      }}>

      {children}
    </AuthContext.Provider>);

};