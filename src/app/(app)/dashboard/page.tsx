'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Sparkles, 
  Target, 
  Briefcase, 
  FileEdit, 
  Users, 
  ArrowRight, 
  LayoutDashboard, 
  Bot, 
  Wifi, 
  History,
  CalendarClock,
  ExternalLink,
  ChevronRight,
  ZapOff,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentResume {
  id: string;
  versionName: string;
  updatedAt: any;
}

export default function DashboardPage() {
  const { user, plan, credits, effectivePlan, userData } = useAuth();
  const [greeting, setGreeting] = useState('Good morning');
  const [recentResumes, setRecentResumes] = useState<RecentResume[]>([]);
  const [resumeCount, setResumeCount] = useState(0);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17) setGreeting('Good evening');

    if (user) {
      const q = query(
        collection(db, `users/${user.uid}/resumeVersions`),
        orderBy('updatedAt', 'desc'),
        limit(3)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRecentResumes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecentResume)));
        setResumeCount(snapshot.size);
        setIsLoadingResumes(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  if (!mounted) return null;

  const stats = [
    {
      title: 'Active Plan',
      value: plan.charAt(0).toUpperCase() + plan.slice(1),
      subtext: plan === 'free' ? 'Upgrade for more power' : 'Active Subscription',
      icon: LayoutDashboard,
      color: 'text-primary',
      action: plan === 'free' ? '/pricing' : null,
    },
    {
      title: 'AI Credits',
      value: effectivePlan === 'pro' || effectivePlan === 'recruiter' ? 'Unlimited' : `${credits} / 50`,
      subtext: 'Monthly computing units',
      icon: Bot,
      color: 'text-purple-500',
      progress: effectivePlan !== 'pro' && effectivePlan !== 'recruiter' ? (credits / 50) * 100 : 100,
    },
    {
      title: 'Resumes Saved',
      value: resumeCount.toString(),
      subtext: 'Across all versions',
      icon: FileText,
      color: 'text-green-500',
    },
    {
      title: 'Account Status',
      value: 'Online',
      subtext: 'Synced with cloud',
      icon: Wifi,
      color: 'text-emerald-500',
      dot: true,
    },
  ];

  const quickActions = [
    { title: 'Resume Builder', desc: 'Craft your professional story', icon: FileText, href: '/resume-builder', color: 'bg-blue-500', locked: false },
    { title: 'Resume Analyzer', desc: 'Get instant AI performance feedback', icon: Sparkles, href: '/resume-analyzer', color: 'bg-purple-500', locked: effectivePlan === 'free' },
    { title: 'ATS Optimizer', desc: 'Beat the bots with keyword match', icon: Target, href: '/ats-optimizer', color: 'bg-emerald-500', locked: effectivePlan === 'free' },
    { title: 'Job Matcher', desc: 'Find roles that fit your skills', icon: Briefcase, href: '/job-matcher', color: 'bg-amber-500', locked: effectivePlan === 'free' },
    { title: 'Cover Letter', desc: 'Tailored letters in seconds', icon: FileEdit, href: '/cover-letter-generator', color: 'bg-pink-500', locked: effectivePlan === 'free' },
    { title: 'Candidate Match', desc: 'For hiring teams & recruiters', icon: Users, href: '/candidate-matcher', color: 'bg-cyan-500', locked: effectivePlan !== 'recruiter' },
  ];

  return (
    <div className="space-y-10 fade-in">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {greeting}, {userData?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground font-medium">
            Welcome to your career command center.
          </p>
        </div>
        <div className="px-4 py-2 bg-card border border-border/40 rounded-xl flex items-center gap-2 text-sm font-bold text-muted-foreground shadow-sm">
          <CalendarClock className="h-4 w-4" />
          {format(new Date(), 'EEEE, MMMM do')}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="card-hover border-border/40">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[2px] text-muted-foreground">{stat.title}</p>
                  <div className="flex items-center gap-2">
                    {stat.dot && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                    <h3 className={cn("text-2xl font-bold tracking-tight", stat.action && "text-amber-500")}>
                      {stat.value}
                    </h3>
                  </div>
                  {stat.progress !== null && <Progress value={stat.progress} className="h-1.5 bg-muted" />}
                  <p className="text-[11px] text-muted-foreground font-medium">{stat.subtext}</p>
                </div>
                <div className={cn("p-2.5 rounded-xl bg-muted/50", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              {stat.action && (
                <Link href={stat.action} className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-500 hover:underline">
                  Upgrade Plan <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ZapOff className="h-5 w-5 text-primary" /> Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <Card className="group border-border/40 card-hover bg-card/50 overflow-hidden relative">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn("p-3 rounded-2xl text-white shadow-lg", action.color)}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm truncate">{action.title}</h4>
                        {action.locked && (
                          <Badge variant="secondary" className="text-[9px] h-4 py-0 px-1.5 uppercase font-black tracking-tighter bg-amber-500/10 text-amber-500 border-none">
                            Pro
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Recent Activity
            </h3>
            <Link href="/resume-builder" className="text-xs font-bold text-primary hover:underline">View All</Link>
          </div>
          
          <Card className="border-border/40 bg-card/30">
            <CardContent className="p-2">
              {isLoadingResumes ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              ) : recentResumes.length > 0 ? (
                <div className="space-y-1">
                  {recentResumes.map((resume) => (
                    <Link key={resume.id} href={`/resume-builder?id=${resume.id}`} className="block">
                      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{resume.versionName}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tight mt-0.5">
                            {resume.updatedAt ? format(resume.updatedAt.toDate(), 'MMM dd, yyyy') : 'Recently'}
                          </p>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-border/40 rounded-2xl m-2">
                  <div className="p-3 rounded-full bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">No resumes yet</p>
                    <p className="text-xs text-muted-foreground">Start your career journey now.</p>
                  </div>
                  <Button size="sm" asChild className="btn-gradient rounded-xl mt-2 h-8">
                    <Link href="/resume-builder">Start Building</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {effectivePlan === 'recruiter' && (
            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
              <CardHeader className="pb-3 border-b border-primary/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                  <Users className="h-4 w-4" /> Recruiter Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-between h-9 rounded-xl text-xs font-bold" asChild>
                    <Link href="/recruiter-dashboard"> Talent Pipeline <ChevronRight className="h-3 w-3" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-between h-9 rounded-xl text-xs font-bold" asChild>
                    <Link href="/candidate-matcher"> AI Candidate Match <ChevronRight className="h-3 w-3" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
