
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Sparkles, 
  Briefcase, 
  Users, 
  ArrowRight, 
  Bot, 
  CheckCircle2, 
  Clock,
  LayoutDashboard,
  Search,
  Users2
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user, plan, credits, effectivePlan, userData } = useAuth();

  const quickActions = [
    {
      title: 'Resume Builder',
      description: 'Create or edit your professional resume.',
      icon: FileText,
      href: '/resume-builder',
      color: 'text-blue-500',
      badge: null
    },
    {
      title: 'Resume Analyzer',
      description: 'Get AI feedback on your resume.',
      icon: Sparkles,
      href: '/resume-analyzer',
      color: 'text-amber-500',
      badge: effectivePlan === 'free' || effectivePlan === 'essentials' ? 'Pro' : null
    },
    {
      title: 'Job Matcher',
      description: 'Discover jobs tailored to your skills.',
      icon: Briefcase,
      href: '/job-matcher',
      color: 'text-purple-500',
      badge: effectivePlan === 'free' || effectivePlan === 'essentials' ? 'Pro' : null
    },
    {
      title: 'Cover Letter',
      description: 'Generate personalized cover letters.',
      icon: FileText,
      href: '/cover-letter-generator',
      color: 'text-green-500',
      badge: effectivePlan === 'free' ? 'Essentials' : null
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Welcome back, {userData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User'}!</h1>
        <p className="text-muted-foreground">Here is an overview of your career workspace.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Plan</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{plan}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {plan === 'free' ? 'Upgrade for more features' : 'Active Subscription'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">AI Credits</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {effectivePlan === 'pro' || effectivePlan === 'recruiter' ? 'Unlimited' : credits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Remaining for this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Profiles</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground mt-1">Version control enabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Online</div>
            <p className="text-xs text-muted-foreground mt-1">Synced with cloud</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Launch your career tools instantly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {quickActions.map((action) => (
              <Button key={action.title} variant="outline" className="h-auto py-4 justify-between whitespace-normal text-left" asChild>
                <Link href={action.href}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={cn("p-2 rounded-md bg-muted shrink-0", action.color)}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium flex items-center gap-2">
                        {action.title}
                        {action.badge && (
                          <Badge variant="secondary" className="text-[10px] h-4 py-0 px-1 shrink-0">
                            {action.badge}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {effectivePlan === 'recruiter' && (
          <Card className="border-primary/20 bg-primary/5 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-primary" /> Recruiter Insights
              </CardTitle>
              <CardDescription>Manage your hiring pipeline efficiently.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="p-5 rounded-lg bg-card border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Users2 className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-[10px] font-bold text-primary uppercase tracking-tighter sm:tracking-wider">Talent Pool</p>
                  </div>
                  <p className="text-lg font-bold truncate">Shortlisted Talent</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">Review your saved candidates</p>
                </div>
                <Button asChild size="sm" className="w-full sm:w-auto shrink-0 shadow-lg shadow-primary/20">
                  <Link href="/recruiter-dashboard">Dashboard</Link>
                </Button>
              </div>
              
              <div className="p-5 rounded-lg bg-card border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Search className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-[10px] font-bold text-primary uppercase tracking-tighter sm:tracking-wider">AI Matching</p>
                  </div>
                  <p className="text-lg font-bold truncate">Find New Matches</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">Match resumes & JD</p>
                </div>
                <Button size="sm" variant="outline" asChild className="w-full sm:w-auto shrink-0">
                  <Link href="/candidate-matcher">Start Search</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
