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
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { Mail, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({ isOpen, onClose, title, description }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="relative h-32 bg-primary flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 opacity-90" />
          <div className="relative z-10 text-center">
            <Image src="/logo.webp" alt="Logo" width={48} height={48} className="rounded-xl bg-white p-1.5 mx-auto mb-2 shadow-lg" />
            <h2 className="text-white font-headline font-bold text-xl">CareerCraft AI</h2>
          </div>
        </div>

        <div className="p-6 pt-4 space-y-6">
          <div className="text-center space-y-2">
            <DialogTitle className="text-2xl font-headline font-bold tracking-tight">
              {title || "Unlock Your Full Potential"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {description || "Join 10,000+ job seekers landing roles at top tech companies."}
            </DialogDescription>
          </div>

          <div className="space-y-3">
            <GoogleAuthButton mode="signup" />
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>
            <Button variant="outline" asChild className="w-full py-6">
              <Link href="/signup">
                <Mail className="mr-2 h-4 w-4" />
                Continue with Email
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-2">
            {[
              { text: "AI Resume Audit", icon: Sparkles },
              { text: "ATS Optimizer", icon: ShieldCheck },
              { text: "Job Matching", icon: CheckCircle2 },
              { text: "5 Free Credits", icon: CheckCircle2 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <item.icon className="h-3.5 w-3.5 text-primary" />
                {item.text}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            By continuing, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
