
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle, Hourglass } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'cancelled' | 'pending';

function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [message, setMessage] = useState('Verifying your payment, please wait...');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // This effect handles immediate feedback based on URL parameters
    const paymentLinkStatus = searchParams.get('razorpay_payment_link_status');
    
    if (paymentLinkStatus === 'paid') {
      setStatus('pending');
      setMessage('Your payment was successful and is now being processed. Your plan will be updated shortly.');
      toast({ title: 'Payment Received', description: 'Processing your upgrade...' });
    } else if (paymentLinkStatus === 'cancelled') {
      setStatus('cancelled');
      setMessage('Payment was cancelled. You will not be charged.');
      toast({ title: 'Payment Cancelled' });
      return;
    } else if (paymentLinkStatus === 'failed') {
      setStatus('failed');
      setMessage('Payment failed. Please try again.');
      toast({ title: 'Payment Failed', variant: 'destructive' });
      return;
    } else {
        // Fallback for when no status is provided, but user lands here.
        setStatus('pending');
        setMessage('Your plan upgrade is being processed. We will update your account status shortly.');
    }
  }, [searchParams, toast]);

  useEffect(() => {
    // This effect listens for the database change from the webhook
    if (user && status === 'pending') {
      const userRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // The webhook has successfully updated the plan
          if (userData.plan !== 'pending' && userData.plan !== 'free') {
            setStatus('success');
            setMessage(`Your plan has been successfully upgraded to ${userData.plan}!`);
            unsubscribe(); // Stop listening once upgraded
          }
        }
      });

      return () => unsubscribe();
    }
  }, [user, status]);


  // Auto-redirect countdown for successful payments
  useEffect(() => {
    if (status === 'success') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, router]);

  const StatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="w-16 h-16 animate-spin text-blue-500" />;
      case 'pending':
        return <Hourglass className="w-16 h-16 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-destructive" />;
    }
  };

  const statusTitle = {
    verifying: 'Connecting...',
    pending: 'Processing Payment...',
    success: 'Payment Successful!',
    cancelled: 'Payment Cancelled',
    failed: 'Payment Failed',
  };

  const statusDescription = {
    verifying: 'Please wait while we connect to the payment gateway.',
    pending: 'Your plan will be upgraded automatically in a few moments.',
    success: `Redirecting to dashboard in ${countdown} seconds...`,
    cancelled: 'No charges were made to your account',
    failed: 'Something went wrong with your payment',
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-gradient-to-br from-background to-muted/50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="items-center text-center space-y-4">
          <StatusIcon />
          <div>
            <CardTitle className="text-2xl font-headline">
              {statusTitle[status]}
            </CardTitle>
            <CardDescription className="mt-2">
              {statusDescription[status]}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-center text-muted-foreground">
            {message}
          </p>

          <div className="space-y-2 pt-4">
            {status === 'success' && (
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to Dashboard Now
              </Button>
            )}
            
            {(status === 'cancelled' || status === 'failed') && (
              <div className="space-y-2">
                <Button onClick={() => router.push('/pricing')} className="w-full">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard')} className="w-full">
                  Back to Dashboard
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense 
        fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
    >
        <AuthProvider>
            <PaymentStatus />
        </AuthProvider>
    </Suspense>
  );
}
