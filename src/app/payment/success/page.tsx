
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle, Hourglass, Upload, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { onSnapshot, doc } from 'firebase/firestore';
import { db, uploadFile } from '@/lib/firebase';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'cancelled' | 'pending';

function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userData, updatePaymentProof } = useAuth();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [message, setMessage] = useState('Verifying your payment, please wait...');
  const [countdown, setCountdown] = useState(5);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
          const newUserData = userDoc.data();
          // The webhook has successfully updated the plan
          if (newUserData.plan !== 'pending' && newUserData.plan !== 'free') {
            setStatus('success');
            setMessage(`Your plan has been successfully upgraded to ${newUserData.plan}!`);
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

  const handleProofUpload = async () => {
    if (!proofFile || !user) return;
    setIsUploading(true);
    try {
        const filePath = `payment_proofs/${user.uid}/${Date.now()}-${proofFile.name}`;
        const downloadURL = await uploadFile(proofFile, filePath);
        await updatePaymentProof(downloadURL);
        toast({
            title: 'Proof Uploaded',
            description: 'Your payment proof has been submitted for review.',
        });
        setProofFile(null); // Clear the file input
    } catch (error) {
        console.error("Proof upload failed:", error);
        toast({ title: 'Upload Failed', description: 'Could not upload your proof. Please try again.', variant: 'destructive' });
    } finally {
        setIsUploading(false);
    }
  };

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
               <div className="space-y-2">
                <Button onClick={() => router.push('/dashboard')} className="w-full">
                    Go to Dashboard
                </Button>
                <Button onClick={() => router.push('/profile')} className="w-full" variant="outline">
                    View My Profile
                </Button>
               </div>
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

         {status === 'pending' && !userData?.paymentProofURL && (
            <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                <div className="space-y-1">
                    <h3 className="font-semibold">Manual Verification Required</h3>
                    <p className="text-sm text-muted-foreground">To speed up the approval process, please upload a screenshot of your payment confirmation.</p>
                </div>
                <div className="w-full space-y-2">
                    <Label htmlFor="payment-proof">Payment Screenshot</Label>
                    <Input id="payment-proof" type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} disabled={isUploading} />
                </div>
                <Button onClick={handleProofUpload} disabled={!proofFile || isUploading} className="w-full">
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Upload Proof'}
                </Button>
            </CardFooter>
        )}
        {status === 'pending' && userData?.paymentProofURL && (
            <CardFooter className="flex-col items-center gap-2 border-t pt-6 text-center">
                 <CheckCircle className="w-8 h-8 text-green-500 mb-2"/>
                 <h3 className="font-semibold">Proof Submitted</h3>
                 <p className="text-sm text-muted-foreground">We have received your payment proof. An admin will review it shortly.</p>
            </CardFooter>
        )}
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
