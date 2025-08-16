'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, ParsedToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthCredential } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  upgradeToPro: () => void;
  logout: () => Promise<void>;
  login: (email:string, password:string) => Promise<any>;
  signup: (email:string, password:string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Check for pro status in local storage
    const proStatus = localStorage.getItem('isPro') === 'true';
    if(proStatus) setIsPro(true);

    return () => unsubscribe();
  }, []);

  const login = (email:string, password:string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signup = (email:string, password:string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  const logout = () => {
    localStorage.removeItem('isPro');
    setIsPro(false);
    return signOut(auth);
  };
  
  const upgradeToPro = () => {
    localStorage.setItem('isPro', 'true');
    setIsPro(true);
  }

  const value = {
    user,
    loading,
    isPro,
    upgradeToPro,
    logout,
    login,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
