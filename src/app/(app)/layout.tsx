'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  SquarePen,
  Sparkles,
  Target,
  Briefcase,
  FileText,
  Users,
  LayoutDashboard,
  NotebookPen,
  LifeBuoy,
  Settings,
  LogOut,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, effectivePlan, userData, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { label: 'Home', icon: Home, href: '/dashboard' },
    { label: 'Resume Builder', icon: SquarePen, href: '/resume-builder' },
    { label: 'Resume Analyzer', icon: Sparkles, href: '/resume-analyzer' },
    { label: 'ATS Optimizer', icon: Target, href: '/ats-optimizer' },
    { label: 'Job Matcher', icon: Briefcase, href: '/job-matcher' },
    { label: 'Cover Letter', icon: FileText, href: '/cover-letter-generator' },
    { label: 'Candidate Match', icon: Users, href: '/candidate-matcher' },
    { label: 'Recruiter Dash', icon: LayoutDashboard, href: '/recruiter-dashboard' },
    { label: 'Candidate Sum.', icon: NotebookPen, href: '/candidate-summarizer' },
  ];

  if (isAdmin) {
    menuItems.push({ label: 'Admin Terminal', icon: ShieldAlert, href: '/admin/dashboard' });
  }

  const secondaryItems = [
    { label: 'Support', icon: LifeBuoy, href: '/support' },
    { label: 'Settings', icon: Settings, href: '/settings' },
  ];

  const isActive = (href: string) => pathname === href;
  const isBuilder = pathname === '/resume-builder';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <Sidebar className="border-r border-border/40 w-[260px]">
          <SidebarHeader className="p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-[#3B82F6] p-1.5 rounded-[12px] shadow-lg shadow-blue-500/20">
                <div className="bg-[#0A0A0F] rounded-[8px] p-1">
                  <Image src="/logo.webp" alt="Logo" width={20} height={20} className="rounded-sm" />
                </div>
              </div>
              <span className="font-bold text-lg tracking-tight">CareerCraft AI</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent className="px-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200",
                      isActive(item.href) && "sidebar-active-gradient"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-5 w-5", isActive(item.href) ? "text-primary" : "text-muted-foreground")} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="my-6 border-t border-border/40 mx-4" />

            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-6 rounded-xl transition-all duration-200",
                      isActive(item.href) && "sidebar-active-gradient"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-5 w-5", isActive(item.href) ? "text-primary" : "text-muted-foreground")} />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 bg-muted/30">
            <div className="flex items-center gap-3 p-2 bg-card border border-border/40 rounded-2xl shadow-sm">
              <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
                <AvatarImage src={userData?.photoURL || user.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {(userData?.displayName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold truncate">{userData?.displayName || user?.displayName || 'User'}</span>
                <Badge variant="outline" className={cn(
                  "text-[10px] h-4 py-0 px-1.5 uppercase font-black tracking-tighter border-none w-fit",
                  effectivePlan === 'pro' ? "bg-amber-500/10 text-amber-500" : 
                  effectivePlan === 'recruiter' ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                )}>
                  {effectivePlan}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => logout()} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-6 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-lg font-bold tracking-tight">
                {menuItems.find(i => i.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              {pathname !== '/settings' && (
                <Button variant="ghost" size="icon" className="rounded-xl border border-border/40 hover:bg-muted md:hidden" asChild>
                  <Link href="/settings"><Settings className="h-5 w-5" /></Link>
                </Button>
              )}
            </div>
          </header>

          <main className={cn(
            "flex-1",
            !isBuilder ? "overflow-y-auto p-6 md:p-10" : "overflow-y-auto"
          )}>
            <div className={cn(
              "mx-auto h-full",
              !isBuilder ? "max-w-7xl space-y-12 pb-20" : ""
            )}>
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AuthProvider>
  );
}
