'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';


type Plan = 'free' | 'pro' | 'recruiter';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  plan: Plan;
  credits: number;
  useCredit: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  upgradeToRecruiter: () => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (user.email === CREATOR_EMAIL) {
          setPlan('recruiter');
          setCredits(Infinity);
        } else if (userDoc.exists()) {
          const userData = userDoc.data();
          setPlan(userData.plan || 'free');
          setCredits(userData.credits ?? FREE_CREDITS);
        } else {
          // New user, create their doc
           await setDoc(userRef, { 
            email: user.email, 
            plan: 'free', 
            credits: FREE_CREDITS 
          });
          setPlan('free');
          setCredits(FREE_CREDITS);
        }
      } else {
        // User is signed out, reset state
        setPlan('free');
        setCredits(0);
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
    const user = userCredential.user;
    // Set initial doc for new user
    await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        plan: 'free',
        credits: FREE_CREDITS,
        teamId: null,
    });
    setPlan('free');
    setCredits(FREE_CREDITS);
    return userCredential;
  }

  const logout = () => {
    setPlan('free');
    setCredits(0);
    return signOut(auth);
  };
  
  const upgradeToPro = async () => {
    if (!user || user.email === CREATOR_EMAIL) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { plan: 'pro' });
    setPlan('pro');
  }

  const upgradeToRecruiter = async () => {
    if (!user || user.email === CREATOR_EMAIL) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { plan: 'recruiter' });
    setPlan('recruiter');
  }

  const useCredit = async () => {
    if (!user || user.email === CREATOR_EMAIL) return;
    if (plan === 'free' && credits > 0) {
        const newCredits = credits - 1;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { credits: newCredits });
        setCredits(newCredits);
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
