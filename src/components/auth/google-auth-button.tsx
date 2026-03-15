'use client';

import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp, query, collectionGroup, where, getDocs, writeBatch } from 'firebase/firestore';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_EMAILS = ['support@careercraftai.tech', 'admin@careercraftai.tech', 'hitarth0236@gmail.com'];
const FREE_CREDITS = 5;

export function GoogleAuthButton({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const userIsAdmin = user.email && ADMIN_EMAILS.includes(user.email);
        
        const initialUserData: any = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
          plan: userIsAdmin ? 'recruiter' : 'free',
          credits: userIsAdmin ? Infinity : FREE_CREDITS,
          hasCompletedOnboarding: false,
        };

        await setDoc(userRef, initialUserData);

        // Trigger Welcome Email Drip for new signups
        try {
          console.log("🚀 Triggering welcome email sequence...");
          const welcomeResponse = await fetch("/api/send-welcome-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              email: user.email, 
              name: user.displayName || user.email?.split('@')[0] 
            }),
          });
          const welcomeData = await welcomeResponse.json();
          if (welcomeData.success) {
            console.log("✅ Welcome email sequence initiated successfully.");
          } else {
            console.warn("⚠️ Welcome email API returned failure:", welcomeData.message);
          }
        } catch (e) {
          console.error("❌ Welcome email fetch failed:", e);
        }

        // Check for team invitations
        if (user.email) {
            try {
                const membersQuery = query(collectionGroup(db, 'members'), where('email', '==', user.email));
                const membersSnapshot = await getDocs(membersQuery);

                if (!membersSnapshot.empty) {
                    const invitationDoc = membersSnapshot.docs[0];
                    const teamId = invitationDoc.ref.parent.parent?.id;
                    if (teamId) {
                        const batch = writeBatch(db);
                        batch.update(doc(db, 'users', user.uid), {
                            plan: 'recruiter',
                            credits: Infinity,
                            teamId: teamId
                        });
                        batch.update(invitationDoc.ref, { uid: user.uid, name: initialUserData.displayName });
                        await batch.commit();
                    }
                }
            } catch (teamError) {
                console.warn("Team invitation lookup failed:", teamError);
            }
        }
      }

      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
      
      toast({
        title: mode === 'signup' ? 'Account Created' : 'Welcome Back',
        description: `Successfully signed in as ${user.email}`,
      });

    } catch (error: any) {
      console.error('Google Auth Error Details:', error);

      if (error.code === 'auth/unauthorized-domain') {
        toast({
          title: 'Domain Not Authorized',
          description: `Please add "${window.location.hostname}" to Authorized Domains in Firebase Console.`,
          variant: 'destructive',
          duration: 10000,
        });
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: 'Authentication Failed',
          description: error.message || 'Could not sign in with Google.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 border border-input bg-background rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
      )}
      {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
    </button>
  );
}