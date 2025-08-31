'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { LayoutDashboard, MoveRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from './ui/skeleton';

export function HomeHeader() {
  const { user, loading } = useAuth();

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-foreground">
            CareerCraft AI
          </h1>
        </Link>
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
          <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
          <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">Resume Builder</Link>
          <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">For Recruiters</Link>
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-10 w-40" />
            </div>
          ) : user ? (
            <Button asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started Free <MoveRight className="ml-2"/></Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
