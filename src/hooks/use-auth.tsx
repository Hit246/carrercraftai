
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
            // Check if this user was invited to a team
            const q = query(collectionGroup(db, 'members'), where('email', '==', user.email));
            const invitationSnap = await getDocs(q);
            
            let initialPlan: Plan = 'free';
            let initialCredits = FREE_CREDITS;
            let teamId = null;

            if (!invitationSnap.empty) {
                const teamDoc = invitationSnap.docs[0];
                teamId = teamDoc.ref.parent.parent?.id || null;
                if(teamId) {
                    initialPlan = 'recruiter';
                    initialCredits = Infinity;
                }
            }
             await setDoc(userRef, { 
                 email: user.email, 
                 plan: initialPlan, 
                 credits: initialCredits, 
                 teamId: teamId,
                 createdAt: new Date(), 
                 hasCompletedOnboarding: false 
            });
             currentData = (await getDoc(userRef)).data() as UserData;
        } else {
            currentData = userDoc.data() as UserData;
        }
        
        let userPlan = currentData.plan || 'free';
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
        
        if (userPlan === 'recruiter' && currentData.teamId) {
            const teamRef = doc(db, 'teams', currentData.teamId);
            const teamSnap = await getDoc(teamRef);
            if (teamSnap.exists()) {
                const ownerId = teamSnap.data().owner;
                // Only perform this check if the current user is NOT the owner
                if (ownerId !== user.uid) {
                    const ownerRef = doc(db, 'users', ownerId);
                    const ownerSnap = await getDoc(ownerRef);
                    if (ownerSnap.exists()) {
                        const ownerData = ownerSnap.data();
                        const ownerPlan = ownerData.plan || 'free';
                        const ownerPlanUpdatedAt = ownerData.planUpdatedAt;
                        let isOwnerPlanActive = ownerPlan === 'recruiter';
        
                        // Check if the owner's plan has expired
                        if (isOwnerPlanActive && ownerPlanUpdatedAt) {
                            const ownerUpgradeDate = new Date(ownerPlanUpdatedAt.seconds * 1000);
                            const ownerExpirationDate = addDays(ownerUpgradeDate, 30);
                            if (differenceInDays(new Date(), ownerExpirationDate) >= 0) {
                                isOwnerPlanActive = false;
                            }
                        }
        
                        if (!isOwnerPlanActive) {
                            // Owner's plan is not active, so downgrade this team member
                            await updateDoc(userRef, {
                                plan: 'free',
                                credits: FREE_CREDITS,
                                teamId: null,
                            });
                            // The snapshot listener will automatically re-run with the updated data,
                            // so we can just return here to prevent setting state with stale data.
                            return; 
                        }
                    } else {
                         // Owner document doesn't exist, which is an inconsistent state. Downgrade member.
                         await updateDoc(userRef, { plan: 'free', credits: FREE_CREDITS, teamId: null });
                         return;
                    }
                }
            } else {
                // Team doesn't exist, user shouldn't be in it.
                await updateDoc(userRef, { plan: 'free', credits: FREE_CREDITS, teamId: null });
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
    // User document creation is now handled by the onSnapshot listener in useEffect
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
