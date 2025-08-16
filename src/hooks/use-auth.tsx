'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, ParsedToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthCredential } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isPro: boolean;
  credits: number;
  useCredit: () => void;
  upgradeToPro: () => void;
  logout: () => Promise<void>;
  login: (email:string, password:string) => Promise<any>;
  signup: (email:string, password:string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_CREDITS = 3;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const proStatus = localStorage.getItem('isPro') === 'true';
    if(proStatus) setIsPro(true);
    
    const savedCredits = localStorage.getItem('credits');
    setCredits(savedCredits ? parseInt(savedCredits, 10) : FREE_CREDITS);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // User is signed in, check their status
        const proStatus = localStorage.getItem('isPro') === 'true';
        setIsPro(proStatus);

        const savedCredits = localStorage.getItem('credits');
        if (savedCredits === null) {
          // New user or first time logging in on this browser
          localStorage.setItem('credits', String(FREE_CREDITS));
          setCredits(FREE_CREDITS);
        } else {
          setCredits(parseInt(savedCredits, 10));
        }
      } else {
        // User is signed out, reset state
        setIsPro(false);
        setCredits(FREE_CREDITS);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email:string, password:string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const signup = async (email:string, password:string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set initial credits for new user
    localStorage.setItem('credits', String(FREE_CREDITS));
    setCredits(FREE_CREDITS);
    return userCredential;
  }

  const logout = () => {
    localStorage.removeItem('isPro');
    localStorage.removeItem('credits');
    setIsPro(false);
    setCredits(0);
    return signOut(auth);
  };
  
  const upgradeToPro = () => {
    localStorage.setItem('isPro', 'true');
    setIsPro(true);
  }

  const useCredit = () => {
    if (!isPro && credits > 0) {
        const newCredits = credits - 1;
        setCredits(newCredits);
        localStorage.setItem('credits', String(newCredits));
    }
  }

  const value = {
    user,
    loading,
    isPro,
    credits,
    useCredit,
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
