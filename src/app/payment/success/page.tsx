
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { verifyAndUpgrade } from '@/lib/razorpay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function PaymentStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState('Verifying your payment, please wait...');

  useEffect(() => {
    const paymentLinkId = searchParams.get('razorpay_payment_link_id');
    const paymentId = searchParams.get('razorpay_payment_id');
    const signature = searchParams.get('razorpay_signature');
    const plan = searchParams.get('plan') as 'essentials' | 'pro' | 'recruiter' | null;
    const userId = searchParams.get('userId');

    if (!paymentLinkId || !paymentId || !signature || !userId || !plan) {
      setMessage('Invalid payment details or session. Redirecting...');
      setStatus('failed');
      setTimeout(() => router.push('/pricing'), 3000);
      return; 
    }

    const verify = async () => {
      try {
        const result = await verifyAndUpgrade(
          paymentLinkId,
          paymentId,
          signature,
          userId,
          plan
        );

        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          toast({
            title: 'Payment Successful!',
            description: 'Your plan has been upgraded.',
          });
        } else {
          setStatus('failed');
          setMessage(result.message);
          toast({
            title: 'Payment Verification Failed',
            description: result.message,
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        setStatus('failed');
        setMessage(error.message || 'An unexpected error occurred.');
        toast({
          title: 'Verification Error',
          description: 'Could not verify your payment.',
          variant: 'destructive',
        });
      }
    };

    verify();
  }, [searchParams, router, toast]);

  const StatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="w-16 h-16 animate-spin text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-destructive" />;
    }
  };

  const statusTitle = {
    pending: 'Processing Payment',
    success: 'Upgrade Successful!',
    failed: 'Payment Failed',
  };

  return (
     <div className="flex justify-center items-start pt-10 h-full bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <StatusIcon />
          <CardTitle className="mt-4 text-2xl font-headline">{statusTitle[status]}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </CardContent>
      </Card>
     </div>
  );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
            <PaymentStatus />
        </Suspense>
    )
}
