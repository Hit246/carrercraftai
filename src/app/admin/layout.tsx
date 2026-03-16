'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileX,
  History,
  LayoutGrid,
  LifeBuoy,
  Loader2,
  LogOut,
  Users,
  Shield,
  ArrowLeft,
  CheckCircle,
  Settings,
  Bell,
  Wallet,
  Tag,
  Mail,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ThemeSwitcher } from '@/components/theme-switcher';
import Image from 'next/image';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin, userData } = useAuth();
  const [pendingUpgradesCount, setPendingUpgradesCount] = useState(0);
  const { toast } = useToast();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!isAdmin) return;

    // Listen for users with 'pending' status
    const q = query(collection(db, 'users'), where('plan', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingUpgradesCount(snapshot.size);
      
      // Skip the initial notification for existing requests on load
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }

      // Show toast only for newly added requests
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newUser = change.doc.data();
          toast({
            title: "New Upgrade Request",
            description: `${newUser.email} has requested a plan upgrade.`,
            action: (
              <ToastAction altText="View" onClick={() => router.push('/admin/upgrades')}>
                View
              </ToastAction>
            ),
          });
        }
      });
    });

    return () => {
      unsubscribe();
      isInitialLoad.current = true;
    };
  }, [isAdmin, router, toast]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, loading, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const getPageTitle = () => {
    if (isActive('/admin/dashboard')) return 'Admin Dashboard';
    if (isActive('/admin/users')) return 'User Management';
    if (isActive('/admin/pricing')) return 'Pricing & Promos';
    if (isActive('/admin/subscriptions')) return 'Subscription Management';
    if (isActive('/admin/upgrades')) return 'Upgrade Requests';
    if (isActive('/admin/cancellations')) return 'Cancellation Requests';
    if (isActive('/admin/support')) return 'Support Tickets';
    if (isActive('/admin/payment-history')) return 'Payment History';
    if (isActive('/admin/email-broadcast')) return 'Email Broadcast';
    return 'Admin Panel';
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const userInitial = (userData?.displayName?.[0] || user?.email?.[0] || 'A').toUpperCase();
  const userName = userData?.displayName || user?.displayName || user?.email || 'Admin';

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.jpg"
              alt="CareerCraft AI"
              width={28}
              height={28}
              className="rounded-full object-cover"
            />
            <span className="text-lg font-semibold font-headline">
              Admin Panel
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin/dashboard')}
              >
                <Link href="/admin/dashboard">
                  <LayoutGrid />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/users')}>
                <Link href="/admin/users">
                  <Users />
                  <span>Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/pricing')}>
                <Link href="/admin/pricing">
                  <Tag />
                  <span>Pricing & Promos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin/subscriptions')}
              >
                <Link href="/admin/subscriptions">
                  <Wallet />
                  <span>Subscriptions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin/upgrades')}
              >
                <Link href="/admin/upgrades" className="flex items-center gap-2">
                  <Bell />
                  <span>Upgrade Requests</span>
                  {pendingUpgradesCount > 0 && (
                    <Badge className="ml-auto h-5 w-5 justify-center p-0 animate-pulse bg-destructive text-destructive-foreground">
                      {pendingUpgradesCount}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin/support')}
              >
                <Link href="/admin/support">
                  <LifeBuoy />
                  <span>Support</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin/email-broadcast')}
              >
                <Link href="/admin/email-broadcast">
                  <Mail />
                  <span>Email Broadcast</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin/cancellations')}
              >
                <Link href="/admin/cancellations">
                  <FileX />
                  <span>Cancellations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive('/admin/payment-history')}
              >
                <Link href="/admin/payment-history">
                  <History />
                  <span>Payment History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard">
                  <ArrowLeft />
                  <span>Back to App</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t bg-sidebar/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={userData?.photoURL || user.photoURL || `https://placehold.co/100x100.png?text=${userInitial}`} 
                alt={userName} 
              />
              <AvatarFallback>
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate flex-1">
              <span className="text-sm font-medium truncate">
                {userName}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-foreground text-left flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
            <Shield className="ml-auto h-4 w-4 text-primary shrink-0" />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6 shadow-md">
          <SidebarTrigger />
          <div className="flex-1">
            <h2 className="text-lg font-semibold font-headline">
              {getPageTitle()}
            </h2>
          </div>
          <ThemeSwitcher />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
