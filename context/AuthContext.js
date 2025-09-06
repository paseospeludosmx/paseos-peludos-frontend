// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync('token');
      if (t) {
        try {
          const me = await api('/auth/me', { token: t });
          setUser(me.user);
          setToken(t);
        } catch {
          await SecureStore.deleteItemAsync('token');
        }
      }
      setLoading(false);
    })();
  }, []);

  const registerWalker = async (payload) => {
    const { token, user } = await api('/auth/register-walker', { method: 'POST', body: payload });
    await SecureStore.setItemAsync('token', token);
    setToken(token);
    setUser(user);
  };

  const login = async (email, password) => {
    const { token, user } = await api('/auth/login', { method: 'POST', body: { email, password } });
    await SecureStore.setItemAsync('token', token);
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, registerWalker, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

