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
  Settings,
  Bell,
  Wallet,
  Tag,
  Mail,
  ChevronRight,
  Monitor
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
import Image from 'next/image';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

function AdminLayoutContent({ children }: { ReactNode: any }) {
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
      <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0F]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isActive = (path: string) => pathname.startsWith(path);

  const getPageTitle = () => {
    if (isActive('/admin/dashboard')) return 'System Overview';
    if (isActive('/admin/users')) return 'User Directory';
    if (isActive('/admin/pricing')) return 'Rev. Management';
    if (isActive('/admin/subscriptions')) return 'Billing Desk';
    if (isActive('/admin/upgrades')) return 'Growth Queue';
    if (isActive('/admin/support')) return 'Incident Inbox';
    if (isActive('/admin/email-broadcast')) return 'Comm. Center';
    return 'Admin Command';
  };

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
      <div className="flex h-screen w-full bg-[#0A0A0F] overflow-hidden">
        <Sidebar className="border-r border-white/5 w-[260px] bg-[#111118]">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 shadow-lg shadow-red-500/5">
                <Shield className="w-5 h-5 text-red-500" />
              </div>
              <span className="font-bold text-lg tracking-tight">Admin Terminal</span>
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
                      <item.icon className={cn("h-5 w-5", isActive(item.href) ? "text-primary" : "text-muted-foreground")} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <Badge className="bg-red-500 text-white border-none h-5 min-w-[20px] px-1 justify-center font-black text-[10px] animate-pulse">
                          {item.badge}
                        </Badge>
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <div className="my-6 border-t border-white/5 mx-4" />

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

          <SidebarFooter className="p-4 mt-auto border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={userData?.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">
                  {(userData?.displayName?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold truncate">{userData?.displayName || 'Root Admin'}</span>
                <Badge variant="outline" className="text-[9px] h-4 py-0 px-1 bg-red-500/10 text-red-500 border-none w-fit uppercase font-black tracking-tighter">
                  Superuser
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => logout()} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-[#0A0A0F]">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-6 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-lg font-bold tracking-tight font-headline flex items-center gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground" />
                {getPageTitle()}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Cluster: Production-Asia
              </div>
              <ThemeSwitcher />
              <Button variant="ghost" size="icon" className="rounded-xl border border-white/10 hover:bg-white/5">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 pb-24">
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
      <AdminLayoutContent children={children} />
    </AuthProvider>
  );
}
