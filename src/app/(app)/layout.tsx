'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  const getPageTitle = () => {
    if (isActive('/dashboard')) return 'Dashboard';
    if (isActive('/resume-analyzer')) return 'Resume Analyzer';
    if (isActive('/job-matcher')) return 'Job Matcher';
    if (isActive('/candidate-matcher')) return 'Candidate Matcher';
    return 'CareerCraft AI';
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold font-headline">CareerCraft AI</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/resume-analyzer')}>
                <Link href="/resume-analyzer">
                  <Sparkles />
                  <span>Resume Analyzer</span>
                  <Badge variant="outline" className="ml-auto">AI</Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/job-matcher')}>
                <Link href="/job-matcher">
                  <Briefcase />
                  <span>Job Matcher</span>
                  <Badge variant="outline" className="ml-auto">AI</Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/candidate-matcher')}>
                <Link href="/candidate-matcher">
                  <Users />
                  <span>Candidate Matcher</span>
                  <Badge variant="outline" className="ml-auto">Recruiters</Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t">
          <div className="flex items-center gap-3">
             <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="profile picture" />
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="text-sm font-medium">Demo User</span>
                <span className="text-xs text-muted-foreground">user@example.com</span>
            </div>
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
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
