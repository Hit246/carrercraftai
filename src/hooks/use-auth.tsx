'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';


type Plan = 'free' | 'pro' | 'recruiter';

interface UserProfile {
    displayName?: string | null;
    photoURL?: string | null;
}

interface UserData {
    plan: Plan;
    credits: number;
    planUpdatedAt?: Date | null;
    paymentProofURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  plan: Plan;
  credits: number;
  userData: UserData | null;
  useCredit: () => Promise<void>;
  upgradeToPro: () => Promise<void>;
  upgradeToRecruiter: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email:string, password:string) => Promise<any>;
  signup: (email:string, password:string) => Promise<any>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  updatePaymentProof: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_CREDITS = 3;
const ADMIN_EMAILS = ['admin@careercraft.ai', 'hitarth0236@gmail.com'];


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>('free');
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<UserData| null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check for admin
        if (user.email && ADMIN_EMAILS.includes(user.email)) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (user.email && ADMIN_EMAILS.includes(user.email)) {
          const adminData = {
            plan: 'recruiter' as Plan,
            credits: Infinity,
            planUpdatedAt: new Date(),
          };
          setPlan(adminData.plan);
          setCredits(adminData.credits);
          setUserData(adminData);
        } else if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          setPlan(data.plan || 'free');
          setCredits(data.credits ?? FREE_CREDITS);
        } else {
          // New user, create their doc
           await setDoc(userRef, { 
            email: user.email, 
            plan: 'free', 
            credits: FREE_CREDITS,
            createdAt: new Date(),
            planUpdatedAt: null,
            paymentProofURL: null,
          });
          setPlan('free');
          setCredits(FREE_CREDITS);
          setUserData({ plan: 'free', credits: FREE_CREDITS});
        }
      } else {
        // User is signed out, reset state
        setIsAdmin(false);
        setPlan('free');
        setCredits(0);
        setUserData(null);
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
    const initialUserData = {
        email: user.email,
        plan: 'free' as Plan,
        credits: FREE_CREDITS,
        teamId: null,
        createdAt: new Date(),
        planUpdatedAt: null,
        paymentProofURL: null,
    };
    // Set initial doc for new user
    await setDoc(doc(db, "users", user.uid), initialUserData);
    setPlan('free');
    setCredits(FREE_CREDITS);
    setUserData(initialUserData);
    return userCredential;
  }

  const logout = () => {
    setPlan('free');
    setCredits(0);
    setIsAdmin(false);
    return signOut(auth);
  };
  
  const upgradeToPro = async () => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    const userRef = doc(db, 'users', user.uid);
    const newPlanData = { plan: 'pro', planUpdatedAt: new Date() };
    await updateDoc(userRef, newPlanData);
    setPlan('pro');
    setUserData(prev => prev ? {...prev, ...newPlanData} : newPlanData as UserData);
  }

  const upgradeToRecruiter = async () => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    const userRef = doc(db, 'users', user.uid);
    const newPlanData = { plan: 'recruiter', planUpdatedAt: new Date() };
    await updateDoc(userRef, newPlanData);
    setPlan('recruiter');
    setUserData(prev => prev ? {...prev, ...newPlanData} : newPlanData as UserData);
  }

  const useCredit = async () => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    if (plan === 'free' && credits > 0) {
        const newCredits = credits - 1;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { credits: newCredits });
        setCredits(newCredits);
    }
  }

  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) throw new Error("Not authenticated");
    await updateProfile(user, profile);
    // Create a new user object to force re-render in components
    setUser({ ...user, ...profile });
  }

  const updatePaymentProof = async (url: string) => {
    if (!user) throw new Error("Not authenticated");
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { paymentProofURL: url });
    setUserData(prev => prev ? {...prev, paymentProofURL: url } : { paymentProofURL: url } as UserData);
  }

  const value = {
    user,
    loading,
    isAdmin,
    plan,
    credits,
    userData,
    useCredit,
    upgradeToPro,
    upgradeToRecruiter,
    logout,
    login,
    signup,
    updateUserProfile,
    updatePaymentProof,
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
