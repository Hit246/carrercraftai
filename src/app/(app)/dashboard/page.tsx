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
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { user, plan, credits } = useAuth();

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
      badge: plan === 'free' ? 'Pro' : null
    },
    {
      title: 'Job Matcher',
      description: 'Discover jobs tailored to your skills.',
      icon: Briefcase,
      href: '/job-matcher',
      color: 'text-purple-500',
      badge: plan === 'free' ? 'Pro' : null
    },
    {
      title: 'Cover Letter',
      description: 'Generate personalized cover letters.',
      icon: FileText,
      href: '/cover-letter-generator',
      color: 'text-green-500',
      badge: plan === 'free' ? 'Essentials' : null
    }
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Welcome back, {user?.displayName || 'User'}!</h1>
        <p className="text-muted-foreground">Here is an overview of your career workspace.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              {plan === 'pro' || plan === 'recruiter' ? 'Unlimited' : credits}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Remaining for this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Profiles</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Professional master resume</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Today</div>
            <p className="text-xs text-muted-foreground mt-1">Last edited 2 hours ago</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Launch your career tools instantly.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {quickActions.map((action) => (
              <Button key={action.title} variant="outline" className="h-auto py-4 justify-between" asChild>
                <Link href={action.href}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-md bg-muted ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium flex items-center gap-2">
                        {action.title}
                        {action.badge && (
                          <Badge variant="secondary" className="text-[10px] h-4 py-0 px-1">
                            {action.badge}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {plan === 'recruiter' && (
          <Card className="col-span-1 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-primary" /> Recruiter Insights
              </CardTitle>
              <CardDescription>Manage your hiring pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-card border flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Talent Pool</p>
                  <p className="text-2xl font-bold">Manage Shortlist</p>
                </div>
                <Button size="sm" asChild>
                  <Link href="/recruiter-dashboard">Open Dashboard</Link>
                </Button>
              </div>
              <div className="p-4 rounded-lg bg-card border flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">AI Matching</p>
                  <p className="text-2xl font-bold">Find Candidates</p>
                </div>
                <Button size="sm" variant="outline" asChild>
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