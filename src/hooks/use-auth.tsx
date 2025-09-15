'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';


type Plan = 'free' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserProfile {
    displayName?: string | null;
    photoURL?: string | null;
}

interface UserData {
    plan: Plan;
    credits: number;
    planUpdatedAt?: any;
    paymentProofURL?: string | null;
    requestedPlan?: 'pro' | 'recruiter';
    teamId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  plan: Plan;
  credits: number;
  userData: UserData | null;
  useCredit: () => Promise<void>;
  requestProUpgrade: (paymentProofURL: string) => Promise<void>;
  requestRecruiterUpgrade: (paymentProofURL: string) => Promise<void>;
  requestCancellation: () => Promise<void>;
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
      setLoading(true);
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userIsAdmin = user.email && ADMIN_EMAILS.includes(user.email);
        
        let userDoc = await getDoc(userRef);

        if (userIsAdmin) {
            setIsAdmin(true);
            setPlan('recruiter');
            setCredits(Infinity);
            // Ensure admin user doc in firestore is updated to recruiter
            if (!userDoc.exists() || userDoc.data().plan !== 'recruiter') {
                await setDoc(userRef, {
                    email: user.email,
                    plan: 'recruiter',
                    credits: Infinity,
                    createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date(),
                }, { merge: true });
                userDoc = await getDoc(userRef);
            }
        } else {
             setIsAdmin(false);
            if (!userDoc.exists()) {
                 await setDoc(userRef, { 
                    email: user.email, 
                    plan: 'free', 
                    credits: FREE_CREDITS,
                    createdAt: new Date(),
                });
                userDoc = await getDoc(userRef);
            }
        }
        
        const data = userDoc.data() as UserData;
        setUserData(data);
        setUser(auth.currentUser);
        setPlan(data.plan || 'free');
        setCredits(data.credits ?? (data.plan === 'free' ? FREE_CREDITS : Infinity));

      } else {
        // User is signed out, reset state
        setUser(null);
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

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Check if the user's email exists in any team's members subcollection
    const teamsRef = collection(db, 'teams');
    const teamsSnapshot = await getDocs(teamsRef);
    let teamId: string | null = null;
    let memberDocId: string | null = null;
    let teamOwnerId: string | null = null;

    for (const teamDoc of teamsSnapshot.docs) {
        const membersRef = collection(db, `teams/${teamDoc.id}/members`);
        const q = query(membersRef, where("email", "==", email));
        const membersSnapshot = await getDocs(q);

        if (!membersSnapshot.empty) {
            teamId = teamDoc.id;
            memberDocId = membersSnapshot.docs[0].id;
            teamOwnerId = teamDoc.data().owner;
            break;
        }
    }

    const initialUserData: any = {
        email: newUser.email,
        createdAt: new Date(),
        planUpdatedAt: null,
        paymentProofURL: null,
    };

    if (teamId && memberDocId && teamOwnerId) {
        // User was invited and is joining a team
        const teamOwnerDoc = await getDoc(doc(db, 'users', teamOwnerId));
        const ownerPlan = teamOwnerDoc.data()?.plan;

        initialUserData.plan = ownerPlan;
        initialUserData.credits = Infinity; // Team members get Pro features
        initialUserData.teamId = teamId;

        // Use a batch write to update user and team member doc atomically
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', newUser.uid);
        batch.set(userRef, initialUserData);

        const memberRef = doc(db, `teams/${teamId}/members`, memberDocId);
        batch.update(memberRef, { 
            uid: newUser.uid,
            name: newUser.displayName || newUser.email, // Set name on joining
         });

        await batch.commit();

        setPlan(ownerPlan);
        setCredits(Infinity);
    } else {
        // Regular signup, not part of a team
        initialUserData.plan = 'free' as Plan;
        initialUserData.credits = FREE_CREDITS;
        initialUserData.teamId = null;

        await setDoc(doc(db, "users", newUser.uid), initialUserData);
        setPlan('free');
        setCredits(FREE_CREDITS);
    }
    
    setUserData(initialUserData);
    return userCredential;
}


  const logout = () => {
    setPlan('free');
    setCredits(0);
    setIsAdmin(false);
    return signOut(auth);
  };
  
  const requestProUpgrade = async (paymentProofURL: string) => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    const userRef = doc(db, 'users', user.uid);
    const newPlanData = { plan: 'pending' as Plan, requestedPlan: 'pro' as const, planUpdatedAt: new Date(), paymentProofURL };
    await updateDoc(userRef, newPlanData);
    setPlan('pending');
    setUserData(prev => prev ? {...prev, ...newPlanData} : newPlanData as UserData);
  }

  const requestRecruiterUpgrade = async (paymentProofURL: string) => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    const userRef = doc(db, 'users', user.uid);
    const newPlanData = { plan: 'pending' as Plan, requestedPlan: 'recruiter' as const, planUpdatedAt: new Date(), paymentProofURL };
    await updateDoc(userRef, newPlanData);
    setPlan('pending');
    setUserData(prev => prev ? {...prev, ...newPlanData} : newPlanData as UserData);
  }

  const requestCancellation = async () => {
    if (!user || (user.email && ADMIN_EMAILS.includes(user.email))) return;
    const userRef = doc(db, 'users', user.uid);
    const newPlanData = { plan: 'cancellation_requested' as Plan, planUpdatedAt: new Date() };
    await updateDoc(userRef, newPlanData);
    setPlan('cancellation_requested');
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
    // Create a new user object to force re-render in components that use it
    setUser(auth.currentUser);
  }

  const updatePaymentProof = async (url: string) => {
    if (!user) throw new Error("Not authenticated");
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { paymentProofURL: url });
    setUserData(prev => prev ? {...prev, paymentProofURL: url } : { ...({} as UserData), paymentProofURL: url });
  }

  const value = {
    user,
    loading,
    isAdmin,
    plan,
    credits,
    userData,
    useCredit,
    requestProUpgrade,
    requestRecruiterUpgrade,
    requestCancellation,
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
