'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usersApi } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  credits: number;
  enrollmentNo?: string;
  lawyerVerificationStatus?: string;
} | null;

const AuthContext = createContext<{
  user: User;
  loading: boolean;
  refetch: () => Promise<void>;
  logout: () => void;
}>({ user: null, loading: true, refetch: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await usersApi.me();
      setUser(me);
    } catch {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refetch, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
