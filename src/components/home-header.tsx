'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, MoveRight, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

interface HomeHeaderProps {
  onOpenAuth?: () => void;
}

export function HomeHeader({ onOpenAuth }: HomeHeaderProps) {
  const { user, loading } = useAuth();

  const navLinks = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Blog", href: "/blog" },
    { label: "Resume Builder", href: user ? "/dashboard" : "#", onClick: (e: any) => !user && onOpenAuth?.() },
    { label: "For Recruiters", href: user ? "/candidate-matcher" : "#", onClick: (e: any) => !user && onOpenAuth?.() },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image src="/logo.webp" alt="CareerCraft AI Logo" width={40} height={40} className="rounded-full object-cover" />
            <h1 className="text-xl font-bold font-headline text-foreground">
              CareerCraft AI
            </h1>
          </Link>
          
          <nav className="hidden md:flex gap-6 items-center text-sm font-medium flex-1 justify-center">
            {navLinks.map(link => (
              <Link 
                key={link.label} 
                href={link.href} 
                onClick={link.onClick}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20" />
              </div>
            ) : user ? (
              <Button size="sm" asChild className="shadow-lg shadow-primary/10">
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Home</span>
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="sm" asChild className="hidden xs:flex">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" onClick={() => onOpenAuth?.()} className="shadow-lg shadow-primary/20">
                  <span className="hidden sm:inline">Get Started Free</span>
                  <span className="sm:hidden">Get Started</span>
                  <MoveRight className="ml-2 h-4 w-4 hidden xs:inline-block"/>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden ml-1">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetTitle className="text-left mb-4 font-headline">Navigation</SheetTitle>
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={link.onClick}
                      className="text-lg font-medium transition-colors hover:text-primary py-2 border-b border-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {!user && !loading && (
                    <div className="flex flex-col gap-3 mt-6">
                      <Button variant="outline" asChild className="w-full justify-start">
                        <Link href="/login">Log In</Link>
                      </Button>
                      <Button onClick={() => onOpenAuth?.()} className="w-full justify-start shadow-xl shadow-primary/10">
                        Create Free Account
                      </Button>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
