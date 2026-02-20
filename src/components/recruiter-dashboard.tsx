
'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Contact, ExternalLink, Filter, Trash2, LayoutDashboard, BarChart3, PieChart as PieChartIcon, TrendingUp, Building } from 'lucide-react';
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
  const { user, userData, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsCreatingTeam] = useState(false);
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'All'>('All');

  useEffect(() => {
    if (authLoading) return;
    if (!userData?.teamId) {
      setIsLoading(false);
      return;
    }

    const candidatesRef = collection(db, `teams/${userData.teamId}/candidates`);
    const unsubscribe = onSnapshot(candidatesRef, (snapshot) => {
      const candidatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
      setCandidates(candidatesData.sort((a,b) => b.addedAt.seconds - a.addedAt.seconds));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData, authLoading]);

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    if (!userData?.teamId) return;
    const candidateRef = doc(db, `teams/${userData.teamId}/candidates`, candidateId);
    await updateDoc(candidateRef, { status: newStatus });
  };

  const handleRemove = async (candidateId: string) => {
    if (!userData?.teamId) return;
    try {
        await deleteDoc(doc(db, `teams/${userData.teamId}/candidates`, candidateId));
        toast({ title: 'Candidate Removed', description: 'The candidate has been removed from your shortlist.' });
    } catch (e) {
        toast({ title: 'Error', description: 'Failed to remove candidate.', variant: 'destructive' });
    }
  };

  const handleInitializeWorkspace = async () => {
    if (!user) return;
    setIsCreatingTeam(true);
    try {
        const teamRef = await addDoc(collection(db, 'teams'), {
            owner: user.uid,
            createdAt: serverTimestamp(),
        });
        await updateDoc(doc(db, 'users', user.uid), { teamId: teamRef.id });
        toast({ title: "Workspace Ready!", description: "You can now shortlist candidates from the Matcher."});
    } catch (error) {
        toast({ title: "Error", description: "Failed to initialize workspace.", variant: "destructive"});
    } finally {
        setIsCreatingTeam(false);
    }
  }

  const analyticsData = useMemo(() => {
    if (candidates.length === 0) return null;

    const avgScore = candidates.reduce((acc, c) => acc + c.matchScore, 0) / candidates.length;
    
    const scoreRanges = [
      { name: '76-100%', count: candidates.filter(c => c.matchScore > 75).length, fill: 'hsl(var(--chart-2))' },
      { name: '51-75%', count: candidates.filter(c => c.matchScore > 50 && c.matchScore <= 75).length, fill: 'hsl(var(--chart-4))' },
      { name: '0-50%', count: candidates.filter(c => c.matchScore <= 50).length, fill: 'hsl(var(--chart-1))' },
    ];

    const rolesMap: Record<string, number> = {};
    candidates.forEach(c => rolesMap[c.jobTitle] = (rolesMap[c.jobTitle] || 0) + 1);
    const roleDistribution = Object.entries(rolesMap).map(([name, value]) => ({ name, value }));

    return { avgScore, scoreRanges, roleDistribution };
  }, [candidates]);

  const filteredCandidates = candidates.filter(c => {
    const jobMatch = jobTitleFilter ? c.jobTitle.toLowerCase().includes(jobTitleFilter.toLowerCase()) : true;
    const statusMatch = statusFilter !== 'All' ? c.status === statusFilter : true;
    return jobMatch && statusMatch;
  });

  if (!userData?.teamId && !isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
            <div className="bg-primary/10 p-6 rounded-full">
                <Building className="w-12 h-12 text-primary" />
            </div>
            <div className="max-w-md">
                <h2 className="text-2xl font-bold font-headline">Recruiter Workspace</h2>
                <p className="text-muted-foreground mt-2">Initialize your personal workspace to start shortlisting candidates and viewing analytics.</p>
            </div>
            <Button onClick={handleInitializeWorkspace} disabled={isInitializing} size="lg">
                {isInitializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Contact className="mr-2 h-4 w-4" />}
                Initialize Recruiter Workspace
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">Manage your talent pool and hiring metrics.</p>
        </div>
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
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                            </TableCell>
                        </TableRow>
                    ) : filteredCandidates.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                <Contact className="mx-auto h-8 w-8 mb-2 opacity-20"/>
                                No candidates shortlisted yet.
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
                                    {candidate.matchScore.toFixed(0)}%
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
                                {formatDistanceToNow(new Date(candidate.addedAt.seconds * 1000), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    {candidate.resumeURL && (
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={candidate.resumeURL} target="_blank">
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    )}
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
                                High
                            </div>
                            <p className="text-xs text-muted-foreground">Based on recent additions</p>
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
                            <CardDescription>Volume of candidates per open position.</CardDescription>
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
