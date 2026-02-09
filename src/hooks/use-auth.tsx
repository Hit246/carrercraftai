
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, onSnapshot, collectionGroup } from 'firebase/firestore';
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
             await setDoc(userRef, { email: user.email, plan: 'free', credits: FREE_CREDITS, createdAt: new Date(), hasCompletedOnboarding: false });
             currentData = (await getDoc(userRef)).data() as UserData;
        } else {
            currentData = userDoc.data() as UserData;
        }
        
        const userPlan = currentData.plan || 'free';
        const planUpdatedAt = currentData.planUpdatedAt;

        if (planUpdatedAt && ['essentials', 'pro', 'recruiter'].includes(userPlan)) {
            const upgradeDate = new Date(planUpdatedAt.seconds * 1000);
            const expirationDate = addDays(upgradeDate, 30);
            const isExpired = differenceInDays(new Date(), expirationDate) >= 0;

            if (isExpired) {
                await updateDoc(userRef, {
                    plan: 'free',
                    credits: FREE_CREDITS,
                    previousPlan: userPlan,
                    requestedPlan: null,
                });
                return;
            }
        }
        
        setUserData(currentData);
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


// This effect handles checking for and applying team invitations after a user logs in.
useEffect(() => {
    if (!user || !user.email) return;

    const checkForInvitation = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const currentData = userSnap.data();
            // If user is already in a team or has a paid plan, don't process invitations.
            if (currentData.teamId || (currentData.plan && currentData.plan !== 'free')) {
                return;
            }
        } else {
            // User document might not be created yet if signup is in progress.
            // This check will run again once the doc exists.
            return;
        }

        // Check for pending invitations using a collectionGroup query.
        // This is allowed by security rules because the user is now authenticated.
        const membersQuery = query(collectionGroup(db, 'members'), where('email', '==', user.email));
        const membersSnapshot = await getDocs(membersQuery);

        if (!membersSnapshot.empty) {
            const invitationDoc = membersSnapshot.docs[0];
            const teamId = invitationDoc.ref.parent.parent?.id;

            if (teamId) {
                const batch = writeBatch(db);

                // Update the user's main document to add them to the team.
                batch.update(userRef, {
                    plan: 'recruiter',
                    credits: Infinity,
                    teamId: teamId,
                });

                // Update the invitation document with the user's UID and name.
                batch.update(invitationDoc.ref, {
                    uid: user.uid,
                    name: user.displayName || user.email,
                });

                await batch.commit();
                // The main user snapshot listener will automatically update the UI state.
            }
        }
    };

    checkForInvitation();
}, [user]);


  const login = (email:string, password:string) => {
    return signInWithEmailAndPassword(auth, email, password);
  }

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email: ', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    // Always create a standard 'free' user first.
    // The useEffect hook for invitations will handle team logic after login.
    const initialUserData = {
        email: newUser.email,
        createdAt: new Date(),
        plan: 'free' as Plan,
        credits: FREE_CREDITS,
        teamId: null,
        planUpdatedAt: null,
        paymentProofURL: null,
        hasCompletedOnboarding: false,
    };
    
    await setDoc(doc(db, "users", newUser.uid), initialUserData);
    
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
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");
  
    const authProfile: { displayName?: string, photoURL?: string } = {};
    if (profile.displayName !== undefined) authProfile.displayName = profile.displayName;
    if (profile.photoURL !== undefined) authProfile.photoURL = profile.photoURL;
  
    await updateProfile(currentUser, authProfile);
  
    const userRef = doc(db, 'users', currentUser.uid);
    const firestoreData: { [key: string]: any } = {};
    if (profile.displayName !== undefined) firestoreData.displayName = profile.displayName ?? null;
    if (profile.photoURL !== undefined) firestoreData.photoURL = profile.photoURL ?? null;
    if (profile.phoneNumber !== undefined) firestoreData.phoneNumber = profile.phoneNumber ?? null;
  
    if (Object.keys(firestoreData).length > 0) {
        await updateDoc(userRef, firestoreData);
    }
  
  };
  

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
