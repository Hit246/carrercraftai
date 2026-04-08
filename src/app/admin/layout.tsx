'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  History,
  LayoutGrid,
  LifeBuoy,
  Loader2,
  LogOut,
  Users,
  Shield,
  ArrowLeft,
  Wallet,
  Tag,
  Mail,
  Monitor,
  Bell
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
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { ThemeSwitcher } from '@/components/theme-switcher';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin, userData } = useAuth();
  const [pendingUpgradesCount, setPendingUpgradesCount] = useState(0);
  const { toast } = useToast();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(collection(db, 'users'), where('plan', '==', 'pending'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingUpgradesCount(snapshot.size);

      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newUser = change.doc.data();
          toast({
            title: "New Upgrade Request",
            description: `${newUser.email} has requested an upgrade.`,
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
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const menuItems = [
    { label: 'Dashboard', icon: LayoutGrid, href: '/admin/dashboard' },
    { label: 'Users', icon: Users, href: '/admin/users' },
    { label: 'Revenue', icon: Tag, href: '/admin/pricing' },
    { label: 'Subscriptions', icon: Wallet, href: '/admin/subscriptions' },
    { label: 'Upgrades', icon: Bell, href: '/admin/upgrades', badge: pendingUpgradesCount },
    { label: 'Support', icon: LifeBuoy, href: '/admin/support' },
    { label: 'Broadcast', icon: Mail, href: '/admin/email-broadcast' },
    { label: 'Payments', icon: History, href: '/admin/payment-history' },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">

        {/* Sidebar */}
        <Sidebar className="border-r border-border w-[260px] bg-sidebar-background">

          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-sidebar-primary/10 p-1.5 rounded-lg border border-sidebar-primary/20">
                <Shield className="w-5 h-5 text-sidebar-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Admin Terminal
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4">
            <SidebarMenu className="space-y-1">
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
                      <item.icon
                        className={cn(
                          "h-5 w-5",
                          isActive(item.href)
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>

                      {item.badge && item.badge > 0 && (
                        <Badge className="bg-sidebar-primary text-white border-none h-5 min-w-[20px] px-1 text-[10px] animate-pulse">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="my-6 border-t border-border mx-4" />

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="flex items-center gap-3 px-4 py-6 rounded-xl text-muted-foreground hover:text-foreground">
                  <Link href="/dashboard">
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to App</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 mt-auto border-t border-border bg-muted/40">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted border border-border">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={userData?.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                  {(userData?.displayName?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col flex-1">
                <span className="text-sm font-bold truncate">
                  {userData?.displayName || 'Root Admin'}
                </span>

                <Badge className="text-[9px] h-4 px-1 bg-sidebar-primary/10 text-sidebar-primary border-none uppercase font-black">
                  Superuser
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="h-8 w-8 text-muted-foreground hover:text-sidebar-primary"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main */}
        <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-background">

          <header className="flex h-16 items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />

              <h2 className="text-lg font-bold flex items-center gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                System Overview
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-[10px] font-black text-muted-foreground uppercase">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Cluster: Production-Asia
              </div>

              <ThemeSwitcher />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10">
            {children}
          </main>
        </SidebarInset>

      </div>
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