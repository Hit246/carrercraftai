'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Contact, ExternalLink, Filter, Trash2, LayoutDashboard, BarChart3, PieChart as PieChartIcon, TrendingUp, AlertCircle, Crown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Tooltip as ChartTooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useRouter } from 'next/navigation';

type CandidateStatus = 'New' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected';

interface Candidate {
  id: string;
  name: string;
  matchScore: number;
  status: CandidateStatus;
  resumeURL?: string;
  addedAt: { seconds: number, nanoseconds: number };
  jobTitle: string;
  justification: string;
}

const chartConfig = {
  score: { label: "Average Score", color: "hsl(var(--primary))" },
  count: { label: "Candidates", color: "hsl(var(--primary))" }
} satisfies ChartConfig;

export function RecruiterDashboard() {
  const { user, effectivePlan, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'All'>('All');

  useEffect(() => {
    if (authLoading || !user) return;
    
    if (effectivePlan === 'recruiter') {
      setIsLoading(true);
      const candidatesRef = collection(db, `users/${user.uid}/shortlistedCandidates`);
      const q = query(candidatesRef, orderBy('addedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const candidatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
        setCandidates(candidatesData);
        setIsLoading(false);
      }, (err) => {
        console.error("Error fetching candidates:", err);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, [user, authLoading, effectivePlan]);

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    if (!user) return;
    const candidateRef = doc(db, `users/${user.uid}/shortlistedCandidates`, candidateId);
    await updateDoc(candidateRef, { status: newStatus });
  };

  const handleRemove = async (candidateId: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, `users/${user.uid}/shortlistedCandidates`, candidateId));
        toast({ title: 'Candidate Removed', description: 'The candidate has been removed from your shortlist.' });
    } catch (e) {
        toast({ title: 'Error', description: 'Failed to remove candidate.', variant: 'destructive' });
    }
  };

  const analyticsData = useMemo(() => {
    if (candidates.length === 0) return null;

    const avgScore = candidates.reduce((acc, c) => acc + (c.matchScore || 0), 0) / candidates.length;
    
    const scoreRanges = [
      { name: '76-100%', count: candidates.filter(c => c.matchScore > 75).length, fill: 'hsl(var(--chart-2))' },
      { name: '51-75%', count: candidates.filter(c => c.matchScore > 50 && c.matchScore <= 75).length, fill: 'hsl(var(--chart-4))' },
      { name: '0-50%', count: candidates.filter(c => c.matchScore <= 50).length, fill: 'hsl(var(--chart-1))' },
    ];

    const rolesMap: Record<string, number> = {};
    candidates.forEach(c => {
        if(c.jobTitle) {
            rolesMap[c.jobTitle] = (rolesMap[c.jobTitle] || 0) + 1;
        }
    });
    const roleDistribution = Object.entries(rolesMap).map(([name, value]) => ({ name, value }));

    return { avgScore, scoreRanges, roleDistribution };
  }, [candidates]);

  const filteredCandidates = candidates.filter(c => {
    const jobMatch = jobTitleFilter ? (c.jobTitle || '').toLowerCase().includes(jobTitleFilter.toLowerCase()) : true;
    const statusMatch = statusFilter !== 'All' ? c.status === statusFilter : true;
    return jobMatch && statusMatch;
  });

  if (authLoading || isLoading) {
    return (
        <div className="flex h-[400px] w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (effectivePlan !== 'recruiter') {
    return (
      <div className="flex h-full items-center justify-center pt-12">
         <Alert variant="pro" className="max-w-lg">
            <Crown />
            <AlertTitle>Recruiter Plan Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-4 mt-2">
                <span>The Recruiter Dashboard is exclusive to the Recruiter plan. Upgrade now to manage your candidate pipeline and view talent analytics.</span>
                <Button onClick={() => router.push('/pricing')} className="w-fit">View Pricing Plans</Button>
            </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
          <h1 className="text-3xl font-bold font-headline">Recruiter Dashboard</h1>
          <p className="text-muted-foreground">Manage your talent pool and hiring metrics.</p>
      </div>

      <Tabs defaultValue="shortlist" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="shortlist" className="flex items-center gap-2">
            <Contact className="w-4 h-4" /> Shortlist
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shortlist" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shortlisted Candidates</CardTitle>
                <CardDescription>Follow up with your top matches.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Input 
                    placeholder="Filter job..."
                    value={jobTitleFilter}
                    onChange={(e) => setJobTitleFilter(e.target.value)}
                    className="w-[150px] h-9"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4"/>
                            {statusFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as CandidateStatus | 'All')}>
                            <DropdownMenuRadioItem value="All">All Statuses</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="New">New</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Shortlisted">Shortlisted</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Interview">Interview</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Hired">Hired</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {filteredCandidates.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                <Contact className="mx-auto h-8 w-8 mb-2 opacity-20"/>
                                No candidates shortlisted yet. Start by using the Candidate Matcher.
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                            <TableCell>
                                <p className="font-medium">{candidate.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px]" title={candidate.justification}>
                                    {candidate.justification}
                                </p>
                            </TableCell>
                            <TableCell>{candidate.jobTitle}</TableCell>
                            <TableCell>
                                <Badge variant={candidate.matchScore > 75 ? 'default' : candidate.matchScore > 50 ? 'secondary' : 'outline'}>
                                    {(candidate.matchScore || 0).toFixed(0)}%
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Badge className="cursor-pointer hover:opacity-80" variant={candidate.status === 'Hired' ? 'default' : candidate.status === 'Rejected' ? 'destructive' : 'secondary'}>
                                            {candidate.status}
                                        </Badge>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuRadioGroup value={candidate.status} onValueChange={(v) => handleStatusChange(candidate.id, v as CandidateStatus)}>
                                            <DropdownMenuRadioItem value="New">New</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Shortlisted">Shortlisted</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Interview">Interview</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Hired">Hired</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                                {candidate.addedAt ? formatDistanceToNow(new Date(candidate.addedAt.seconds * 1000), { addSuffix: true }) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(candidate.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {!analyticsData ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
                <BarChart3 className="mx-auto h-12 w-12 opacity-20 mb-4" />
                <p>Not enough data to generate analytics. Shortlist some candidates first.</p>
            </Card>
          ) : (
            <>
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{candidates.length}</div>
                            <p className="text-xs text-muted-foreground">Shortlisted candidates</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Match Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{analyticsData.avgScore.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">Across all roles</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Hiring Velocity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <TrendingUp className="text-green-500 w-5 h-5"/>
                                Stable
                            </div>
                            <p className="text-xs text-muted-foreground">Recent pipeline additions</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary"/> Match Quality Distribution
                            </CardTitle>
                            <CardDescription>Categorizing talent by AI match accuracy.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <BarChart data={analyticsData.scoreRanges}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-primary"/> Pipeline by Role
                            </CardTitle>
                            <CardDescription>Volume of candidates per position.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analyticsData.roleDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {analyticsData.roleDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
