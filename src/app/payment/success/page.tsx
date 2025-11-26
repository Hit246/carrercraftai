
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { verifyAndUpgrade } from '@/lib/razorpay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'cancelled';

function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [message, setMessage] = useState('Verifying your payment, please wait...');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!user) {
        return;
      }
      
      const paymentLinkId = searchParams.get('razorpay_payment_link_id');
      const paymentId = searchParams.get('razorpay_payment_id');
      const signature = searchParams.get('razorpay_signature');
      const paymentLinkStatus = searchParams.get('razorpay_payment_link_status');
      
      // Handle cancelled payment
      if (paymentLinkStatus === 'cancelled') {
        setStatus('cancelled');
        setMessage('Payment was cancelled. You will not be charged.');
        toast({ title: 'Payment Cancelled' });
        return;
      }

      // Handle failed payment
      if (paymentLinkStatus === 'failed') {
        setStatus('failed');
        setMessage('Payment failed. Please try again.');
        toast({ title: 'Payment Failed', variant: 'destructive' });
        return;
      }

      if (!paymentLinkId || !paymentId || !signature) {
        setStatus('failed');
        setMessage('Invalid payment details received from the payment gateway.');
        toast({ title: 'Invalid Payment Data', variant: 'destructive' });
        return;
      }
      
      // Verify payment signature and upgrade plan
      try {
        const result = await verifyAndUpgrade(
          paymentLinkId,
          paymentId,
          signature, 
          user.uid,
        );

        if (result.success) {
          setStatus('success');
          setMessage(result.message || `Plan upgraded successfully!`);
          toast({
            title: 'Payment Successful! 🎉',
            description: 'Your plan has been upgraded.',
          });
        } else {
          setStatus('failed');
          setMessage(result.message || 'Payment verification failed. Please contact support.');
          toast({
            title: 'Verification Failed',
            description: result.message,
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        setStatus('failed');
        setMessage(error.message || 'An unexpected error occurred during verification.');
        toast({
          title: 'Verification Error',
          description: 'Could not verify your payment. Please contact support.',
          variant: 'destructive',
        });
      }
    };

    if (user) {
      verifyPayment();
    }
  }, [searchParams, router, toast, user]);

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
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-16 h-16 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-destructive" />;
    }
  };

  const statusTitle = {
    verifying: 'Processing Payment...',
    success: 'Payment Successful!',
    cancelled: 'Payment Cancelled',
    failed: 'Payment Failed',
  };

  const statusDescription = {
    verifying: 'Please wait while we verify your payment',
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
    <AuthProvider>
      <Suspense 
        fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <PaymentStatus />
      </Suspense>
    </AuthProvider>
  );
}
