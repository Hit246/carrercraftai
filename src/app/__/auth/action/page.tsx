'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  verifyPasswordResetCode, 
  confirmPasswordReset, 
  applyActionCode,
  checkActionCode
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  
  // Password Reset State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus('error');
      setErrorMessage('Invalid action link. It may be broken or expired.');
      setIsLoading(false);
      return;
    }

    const handleAction = async () => {
      try {
        if (mode === 'resetPassword') {
          // Just verify the code first
          const resetEmail = await verifyPasswordResetCode(auth, oobCode);
          setEmail(resetEmail);
          setIsLoading(false);
        } else if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          setStatus('success');
          setIsLoading(false);
        } else if (mode === 'recoverEmail') {
          // Handle email recovery if needed
          await applyActionCode(auth, oobCode);
          setStatus('success');
          setIsLoading(false);
        } else {
          setStatus('error');
          setErrorMessage('Unsupported action mode.');
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error('Auth action error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Something went wrong. The link might be expired.');
        setIsLoading(false);
      }
    };

    handleAction();
  }, [mode, oobCode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (newPassword.length < 6) {
      toast({ title: 'Invalid Password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      toast({ title: 'Password Updated', description: 'You can now log in with your new password.' });
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-muted-foreground font-medium">Verifying security token...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <Card className="w-full max-w-md shadow-2xl border-destructive/20 bg-destructive/5">
        <CardHeader className="items-center text-center">
          <div className="p-3 bg-destructive/10 rounded-full mb-2">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-headline">Action Failed</CardTitle>
          <CardDescription className="text-destructive/80">{errorMessage}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full rounded-xl">
            <Link href="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="w-full max-w-md shadow-2xl border-green-500/20 bg-green-500/5">
        <CardHeader className="items-center text-center">
          <div className="p-3 bg-green-500/10 rounded-full mb-2">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-headline">Success!</CardTitle>
          <CardDescription>
            {mode === 'resetPassword' 
              ? 'Your password has been reset successfully.' 
              : 'Your email has been verified. Welcome aboard!'}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full btn-gradient rounded-xl font-bold h-12">
            <Link href="/login">Continue to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show password reset form
  if (mode === 'resetPassword') {
    return (
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
          </div>
          <CardDescription>Enter a new password for <strong>{email}</strong></CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input 
                  id="new-password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 6 characters" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-11 rounded-xl pr-10"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Repeat your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </div>
            <Button type="submit" className="w-full btn-gradient h-12 rounded-xl font-bold mt-2" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Save New Password'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t bg-muted/20 py-4 rounded-b-lg">
           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2">
             <ShieldCheck className="h-3 w-3" /> CareerCraft Security Protocol
           </p>
        </CardFooter>
      </Card>
    );
  }

  return null;
}

export default function AuthActionPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8 bg-[url('https://www.transparenttextures.com/patterns/dot-grid.png')] bg-fixed">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
        <AuthActionContent />
      </Suspense>
    </div>
  );
}
