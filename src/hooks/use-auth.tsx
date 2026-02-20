'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, writeBatch, onSnapshot, collectionGroup } from 'firebase/firestore';
import { differenceInDays, addDays } from 'date-fns';

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserProfile {
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
}

interface UserData {
    plan: Plan;
    credits: number;
    planUpdatedAt?: any;
    paymentProofURL?: string | null;
    paymentId?: string | null;
    requestedPlan?: 'essentials' | 'pro' | 'recruiter';
    previousPlan?: Plan;
    teamId?: string;
    hasCompletedOnboarding?: boolean;
    displayName?: string | null;
    photoURL?: string | null;
    phoneNumber?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  plan: Plan;
  effectivePlan: Plan; // The plan used for feature gating (ignores 'pending')
  credits: number;
  userData: UserData | null;
  useCredit: () => Promise<void>;
  requestCancellation: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email:string, password:string) => Promise<any>;
  signup: (email:string, password:string) => Promise<any>;
  forgotPassword: (email: string) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  updatePaymentProof: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FREE_CREDITS = 5;
const ESSENTIALS_CREDITS = 50;
const ADMIN_EMAILS = ['admin@careercraft.ai', 'hitarth0236@gmail.com'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>('free');
  const [effectivePlan, setEffectivePlan] = useState<Plan>('free');
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<UserData| null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userIsAdmin = currentUser.email && ADMIN_EMAILS.includes(currentUser.email);
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await setDoc(userRef, { email: currentUser.email, plan: 'recruiter', credits: Infinity, createdAt: new Date() });
            }
            setPlan('recruiter');
            setEffectivePlan('recruiter');
            setCredits(Infinity);
            setLoading(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setPlan('free');
        setEffectivePlan('free');
        setCredits(0);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || isAdmin) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, async (userDoc) => {
        if (!userDoc.exists()) return;
        
        const currentData = userDoc.data() as UserData;
        const userPlan = currentData.plan || 'free';
        const planUpdatedAt = currentData.planUpdatedAt;

        // Determine Effective Plan (What the user ACTUALLY has access to)
        const effPlan = userPlan === 'pending' ? (currentData.previousPlan || 'free') : userPlan;

        // Expiration Logic
        if (planUpdatedAt && ['essentials', 'pro', 'recruiter'].includes(userPlan)) {
            const upgradeDate = planUpdatedAt.toDate ? planUpdatedAt.toDate() : new Date(planUpdatedAt.seconds * 1000);
            const expirationDate = addDays(upgradeDate, 30);
            if (differenceInDays(new Date(), expirationDate) >= 0) {
                await updateDoc(userRef, { plan: 'free', credits: FREE_CREDITS, previousPlan: null });
                return;
            }
        }
        
        setUserData(currentData);
        setPlan(userPlan);
        setEffectivePlan(effPlan);

        if (effPlan === 'pro' || effPlan === 'recruiter') {
            setCredits(Infinity);
        } else if (effPlan === 'essentials') {
            setCredits(currentData.credits ?? ESSENTIALS_CREDITS);
        } else {
            setCredits(currentData.credits ?? FREE_CREDITS);
        }
        setLoading(false);
    });

    return () => unsubscribe();
}, [user, isAdmin]);

  const login = (email:string, password:string) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => {
    setPlan('free');
    setEffectivePlan('free');
    setCredits(0);
    setIsAdmin(false);
    return signOut(auth);
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    const initialUserData: any = { email: newUser.email, createdAt: new Date(), hasCompletedOnboarding: false };
    
    const membersQuery = query(collectionGroup(db, 'members'), where('email', '==', email));
    const membersSnapshot = await getDocs(membersQuery);

    if (!membersSnapshot.empty) {
        const invitationDoc = membersSnapshot.docs[0];
        const teamId = invitationDoc.ref.parent.parent?.id;
        if (teamId) {
            initialUserData.plan = 'recruiter';
            initialUserData.credits = Infinity;
            initialUserData.teamId = teamId;
            const batch = writeBatch(db);
            batch.set(doc(db, 'users', newUser.uid), initialUserData);
            batch.update(invitationDoc.ref, { uid: newUser.uid, name: newUser.displayName || newUser.email });
            await batch.commit();
        }
    } else {
        initialUserData.plan = 'free';
        initialUserData.credits = FREE_CREDITS;
        await setDoc(doc(db, "users", newUser.uid), initialUserData);
    }
    return userCredential;
  };

  const forgotPassword = (email: string) => sendPasswordResetEmail(auth, email);

  const updateUserProfile = async (profile: UserProfile) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");
    await updateProfile(currentUser, { displayName: profile.displayName, photoURL: profile.photoURL });
    const userRef = doc(db, 'users', currentUser.uid);
    const firestoreData: any = {};
    if (profile.displayName !== undefined) firestoreData.displayName = profile.displayName;
    if (profile.photoURL !== undefined) firestoreData.photoURL = profile.photoURL;
    if (profile.phoneNumber !== undefined) firestoreData.phoneNumber = profile.phoneNumber;
    await updateDoc(userRef, firestoreData);
  };

  const useCredit = async () => {
    if (!user || isAdmin || effectivePlan === 'pro' || effectivePlan === 'recruiter') return;
    if (credits > 0) {
        await updateDoc(doc(db, 'users', user.uid), { credits: credits - 1 });
    }
  };

  const requestCancellation = async () => {
    if (!user || isAdmin) return;
    await updateDoc(doc(db, 'users', user.uid), { plan: 'cancellation_requested', planUpdatedAt: new Date() });
  };

  const updatePaymentProof = async (url: string) => {
    if (!user) throw new Error("Not authenticated");
    await updateDoc(doc(db, 'users', user.uid), { paymentProofURL: url });
  };

  const value = { user, loading, isAdmin, plan, effectivePlan, credits, userData, useCredit, requestCancellation, logout, login, signup, forgotPassword, updateUserProfile, updatePaymentProof };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
