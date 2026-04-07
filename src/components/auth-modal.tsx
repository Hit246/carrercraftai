'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { Mail, Sparkles, CheckCircle2, ShieldCheck, Lock, ZapOff} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({ isOpen, onClose, title, description }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (activeTab === 'signin') {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
    } catch (error: any) {
      toast({
        title: activeTab === 'signin' ? 'Login Failed' : 'Sign up Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl bg-card">
        <div className="relative h-24 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dot-grid.png')] opacity-20" />
          <div className="relative z-10 text-center flex items-center gap-3">
            <Image src="/logo.webp" alt="Logo" width={40} height={40} className="rounded-xl bg-white p-1 shadow-lg" />
            <h2 className="text-white font-bold text-2xl tracking-tighter">CareerCraft AI</h2>
          </div>
        </div>

        <div className="p-8 pt-6 space-y-6">
          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {title || "Unlock Your Full Potential"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {description || "Join 10,000+ job seekers landing roles at top tech companies."}
            </DialogDescription>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-11 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="signin" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="space-y-4">
              <GoogleAuthButton mode={activeTab === 'signin' ? 'login' : 'signup'} />
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest"><span className="bg-card px-2 text-muted-foreground">Or email</span></div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    {activeTab === 'signin' && (
                      <Link href="/forgot-password" disable={isLoading} className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
                    )}
                  </div>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl" />
                </div>
              </div>

              <Button type="submit" className="w-full btn-gradient h-12 rounded-xl font-bold mt-4" disabled={isLoading}>
                {isLoading ? "Please wait..." : activeTab === 'signin' ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Tabs>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { text: "AI Resume Audit", icon: Sparkles },
              { text: "ATS Optimizer", icon: ShieldCheck },
              { text: "Job Matching", icon: CheckCircle2 },
              { text: "5 Free Credits", icon: ZapOff },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                <item.icon className="h-3.5 w-3.5 text-primary" />
                {item.text}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            By continuing, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
