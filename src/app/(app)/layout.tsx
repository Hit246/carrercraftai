
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Sparkles,
  Briefcase,
  Users,
  Settings,
  LogOut,
  FileText,
  Loader2,
  Crown,
  LifeBuoy,
  Users2,
  Home,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Image from 'next/image';

function AppLayoutContent({
    children,
  }: {
    children: React.ReactNode;
  }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, plan, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path;
    return pathname.startsWith(path);
  }

  const getPageTitle = () => {
    if (isActive('/dashboard')) return 'Home';
    if (isActive('/resume-analyzer')) return 'Resume Analyzer';
    if (isActive('/job-matcher')) return 'Job Matcher';
    if (isActive('/cover-letter-generator')) return 'Cover Letter Generator';
    if (isActive('/candidate-matcher')) return 'Candidate Matcher';
    if (isActive('/team')) return 'Team Management';
    if (isActive('/support')) return 'Support';
    if (isActive('/pricing')) return 'Upgrade to Pro';
    if (isActive('/profile')) return 'Profile Settings';
    return 'CareerCraft AI';
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  }

  const getPlanBadge = () => {
    if (plan === 'recruiter') {
        return <Badge variant="secondary" className="ml-auto bg-blue-400/20 text-blue-500 border-blue-400/30">Recruiter</Badge>
    }
    if (plan === 'pro') {
        return <Badge variant="secondary" className="ml-auto bg-amber-400/20 text-amber-500 border-amber-400/30">Pro</Badge>
    }
    return (
        <Button variant="ghost" size="sm" className="ml-auto" asChild>
            <Link href="/pricing">
                <Crown className="w-4 h-4 mr-2"/>
                Upgrade
            </Link>
        </Button>
    )
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="CareerCraft AI" width={28} height={28} className="rounded-full object-cover" />
            <span className="text-lg font-semibold font-headline">CareerCraft AI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                <Link href="/dashboard">
                  <Home />
                  <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/resume-analyzer')}>
                    <Link href="/resume-analyzer">
                    <Sparkles />
                    <span>Resume Analyzer</span>
                    {(plan === 'free') && <Badge variant="secondary" className="ml-auto bg-amber-400/20 text-amber-500 border-amber-400/30">Pro</Badge>}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/job-matcher')}>
                    <Link href="/job-matcher">
                    <Briefcase />
                    <span>Job Matcher</span>
                    {(plan === 'free') && <Badge variant="secondary" className="ml-auto bg-amber-400/20 text-amber-500 border-amber-400/30">Pro</Badge>}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/cover-letter-generator')}>
                    <Link href="/cover-letter-generator">
                    <FileText />
                    <span>Cover Letter Generator</span>
                    {(plan === 'free') && <Badge variant="secondary" className="ml-auto bg-amber-400/20 text-amber-500 border-amber-400/30">Pro</Badge>}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/candidate-matcher')}>
                    <Link href="/candidate-matcher">
                    <Users />
                    <span>Candidate Matcher</span>
                    {plan !== 'recruiter' && <Badge variant="secondary" className="ml-auto bg-blue-400/20 text-blue-500 border-blue-400/30">Recruiter</Badge>}
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             {plan === 'recruiter' && (
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/team')}>
                        <Link href="/team">
                        <Users2 />
                        <span>Team Management</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            )}
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/support')}>
                    <Link href="/support">
                    <LifeBuoy />
                    <span>Support</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin')}>
                  <Link href="/admin/dashboard">
                    <Shield />
                    <span>Admin Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t">
          <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="profile picture" />
              <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
                <span className="text-sm font-medium truncate">{user.email}</span>
                <button onClick={handleLogout} className="text-xs text-muted-foreground hover:text-foreground text-left flex items-center gap-1">
                  <LogOut className="w-3 h-3"/>
                  Logout
                </button>
            </div>
            {getPlanBadge()}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
          <SidebarTrigger className="md:hidden"/>
          <div className="flex-1">
             <h2 className="text-lg font-semibold font-headline">
                {getPageTitle()}
             </h2>
          </div>
          <ThemeSwitcher />
          <Button variant="outline" size="icon" asChild>
            <Link href="/profile">
                <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
      return (
          <AuthProvider>
              <AppLayoutContent>{children}</AppLayoutContent>
          </AuthProvider>
      )
  }

    