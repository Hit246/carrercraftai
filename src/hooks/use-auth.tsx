'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, ParsedToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { AuthCredential } from 'firebase/auth';

type Plan = 'free' | 'pro' | 'recruiter';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  plan: Plan;
  credits: number;
  useCredit: () => void;
  upgradeToPro: () => void;
  upgradeToRecruiter: () => void;
  logout: () => Promise<void>;
  login: (email:string, password:string) => Promise<any>;
  signup: (email:string, password:string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_CREDITS = 3;
const CREATOR_EMAIL = 'hitarth0236@gmail.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>('free');
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const savedPlan = localStorage.getItem('plan') as Plan | null;
    if(savedPlan) setPlan(savedPlan);
    
    const savedCredits = localStorage.getItem('credits');
    setCredits(savedCredits ? parseInt(savedCredits, 10) : FREE_CREDITS);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        // Special access for the creator
        if (user.email === CREATOR_EMAIL) {
          setPlan('recruiter');
          setCredits(Infinity);
        } else {
          // Regular user logic
          const savedPlan = (localStorage.getItem('plan') as Plan) || 'free';
          setPlan(savedPlan);

          const savedCredits = localStorage.getItem('credits');
          if (savedCredits === null) {
            localStorage.setItem('credits', String(FREE_CREDITS));
            setCredits(FREE_CREDITS);
          } else {
            setCredits(parseInt(savedCredits, 10));
          }
        }
      } else {
        // User is signed out, reset state
        setPlan('free');
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
    localStorage.setItem('plan', 'free');
    setPlan('free');
    return userCredential;
  }

  const logout = () => {
    localStorage.removeItem('plan');
    localStorage.removeItem('credits');
    setPlan('free');
    setCredits(0);
    return signOut(auth);
  };
  
  const upgradeToPro = () => {
    if (user?.email === CREATOR_EMAIL) return;
    localStorage.setItem('plan', 'pro');
    setPlan('pro');
  }

  const upgradeToRecruiter = () => {
    if (user?.email === CREATOR_EMAIL) return;
    localStorage.setItem('plan', 'recruiter');
    setPlan('recruiter');
  }

  const useCredit = () => {
    if (user?.email === CREATOR_EMAIL) return;
    if (plan === 'free' && credits > 0) {
        const newCredits = credits - 1;
        setCredits(newCredits);
        localStorage.setItem('credits', String(newCredits));
    }
  }

  const value = {
    user,
    loading,
    plan,
    credits,
    useCredit,
    upgradeToPro,
    upgradeToRecruiter,
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
