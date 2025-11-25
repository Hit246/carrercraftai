
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, onSnapshot, collectionGroup } from 'firebase/firestore';


type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserProfile {
    displayName?: string | null;
    photoURL?: string | null;
}

interface UserData {
    plan: Plan;
    credits: number;
    planUpdatedAt?: any;
    paymentProofURL?: string | null;
    requestedPlan?: 'essentials' | 'pro' | 'recruiter';
    teamId?: string;
    hasCompletedOnboarding?: boolean;
    displayName?: string | null;
    photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  plan: Plan;
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
  const [credits, setCredits] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userData, setUserData] = useState<UserData| null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const userIsAdmin = currentUser.email && ADMIN_EMAILS.includes(currentUser.email);
        setIsAdmin(userIsAdmin);

        if (userIsAdmin) {
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
            const adminData = {
                email: currentUser.email,
                plan: 'recruiter' as Plan,
                credits: Infinity,
            };
            if (!userDoc.exists()) {
                await setDoc(userRef, { ...adminData, createdAt: new Date() });
            } else {
                await updateDoc(userRef, adminData);
            }
            setPlan('recruiter');
            setCredits(Infinity);
            setUserData((await getDoc(userRef)).data() as UserData);
            setLoading(false);
        }

      } else {
        setUser(null);
        setIsAdmin(false);
        setPlan('free');
        setCredits(0);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || isAdmin) {
        if (!loading) {
            setLoading(false);
        }
        return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, async (userDoc) => {
        let currentData;
        if (!userDoc.exists()) {
             // This case is primarily handled by the signup function now
             // but as a fallback, we create a free user record.
             await setDoc(userRef, { email: user.email, plan: 'free', credits: FREE_CREDITS, createdAt: new Date(), hasCompletedOnboarding: false });
             currentData = (await getDoc(userRef)).data() as UserData;
        } else {
            currentData = userDoc.data() as UserData;
        }
        
        setUserData(currentData);
        const userPlan = currentData.plan || 'free';
        setPlan(userPlan);

        if (userPlan === 'pro' || userPlan === 'recruiter') {
            setCredits(Infinity);
        } else if (userPlan === 'essentials') {
            setCredits(currentData.credits ?? ESSENTIALS_CREDITS);
        } else {
            setCredits(currentData.credits ?? FREE_CREDITS);
        }
        setLoading(false);
    });

    return () => unsubscribe();
}, [user, loading, isAdmin]);


  const login = (email:string, password:string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const forgotPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    const initialUserData: any = {
        email: newUser.email,
        createdAt: new Date(),
        planUpdatedAt: null,
        paymentProofURL: null,
        hasCompletedOnboarding: false,
    };
    
    // Check if there is an invitation for this email
    const membersQuery = query(collectionGroup(db, 'members'), where('email', '==', email));
    const membersSnapshot = await getDocs(membersQuery);

    if (!membersSnapshot.empty) {
        const invitationDoc = membersSnapshot.docs[0];
        const teamId = invitationDoc.ref.parent.parent?.id;

        if (teamId) {
            // A user invited to a team should always get the 'recruiter' plan benefits.
            initialUserData.plan = 'recruiter' as Plan;
            initialUserData.credits = Infinity;
            initialUserData.teamId = teamId;

            const batch = writeBatch(db);
            const userRef = doc(db, 'users', newUser.uid);
            batch.set(userRef, initialUserData);
            
            // Update the member doc with the new user's UID
            batch.update(invitationDoc.ref, { 
                uid: newUser.uid,
                name: newUser.displayName || newUser.email
            });

            await batch.commit();
        }
    } else {
        // Standard signup for a user not invited to a team
        initialUserData.plan = 'free' as Plan;
        initialUserData.credits = FREE_CREDITS;
        initialUserData.teamId = null;
        await setDoc(doc(db, "users", newUser.uid), initialUserData);
    }
    
    return userCredential;
}


  const logout = () => {
    setPlan('free');
    setCredits(0);
    setIsAdmin(false);
    return signOut(auth);
  };
  
  const requestCancellation = async () => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    const userRef = doc(db, 'users', user.uid);
    const newPlanData = { plan: 'cancellation_requested' as Plan, planUpdatedAt: new Date() };
    await updateDoc(userRef, newPlanData);
  }

  const useCredit = async () => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    if ((plan === 'free' || plan === 'essentials') && credits > 0) {
        const newCredits = credits - 1;
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { credits: newCredits });
    }
  }

  const updateUserProfile = async (profile: UserProfile) => {
    if (!user) throw new Error("Not authenticated");
    
    // Update Firebase Auth profile
    await updateProfile(user, profile);

    // Also update the user's document in Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
        displayName: profile.displayName,
        photoURL: profile.photoURL
    });

    // Create a new user object with the updated info to force a state update
    const updatedUser = Object.assign(Object.create(Object.getPrototypeOf(user)), user);
    updatedUser.displayName = profile.displayName;
    updatedUser.photoURL = profile.photoURL;

    // Refresh the local user state
    setUser(updatedUser);
  }

  const updatePaymentProof = async (url: string) => {
    if (!user) throw new Error("Not authenticated");
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { paymentProofURL: url });
  }

  const value = {
    user,
    loading,
    isAdmin,
    plan,
    credits,
    userData,
    useCredit,
    requestCancellation,
    logout,
    login,
    signup,
    forgotPassword,
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
