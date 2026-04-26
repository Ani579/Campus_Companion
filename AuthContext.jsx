import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiStr = "http://localhost:5000/api";

  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${apiStr}/auth/login`, { email, password });
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    setUser(res.data);
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${apiStr}/auth/register`, { name, email, password });
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const updateAuthUser = (updatedInfo) => {
    const newData = { ...user, ...updatedInfo };
    localStorage.setItem('userInfo', JSON.stringify(newData));
    setUser(newData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, apiStr, updateAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
