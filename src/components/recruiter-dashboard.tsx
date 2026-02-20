
'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Users, Info, BarChart3, ListChecks, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  PieChart,
  Pie,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface ShortlistedCandidate {
    id: string;
    name: string;
    matchScore: number;
    justification: string;
    jobTitle: string;
    shortlistedAt: { seconds: number; nanoseconds: number } | null;
}

const chartConfig = {
  count: {
    label: "Candidates",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function RecruiterDashboard() {
    const { user, plan } = useAuth();
    const { toast } = useToast();
    const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || plan !== 'recruiter') return;

        const shortlistRef = collection(db, `users/${user.uid}/shortlistedCandidates`);
        const q = query(shortlistRef, orderBy('shortlistedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShortlistedCandidate));
            setCandidates(list);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching shortlisted candidates:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, plan]);

    const handleRemove = async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/shortlistedCandidates`, id));
            toast({ title: "Removed", description: "Candidate removed from your shortlist." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove candidate.", variant: "destructive" });
        }
    }

    const stats = useMemo(() => {
        if (candidates.length === 0) return null;

        const avgScore = candidates.reduce((acc, c) => acc + c.matchScore, 0) / candidates.length;
        
        const distribution = [
            { range: 'Low (0-50)', count: 0, fill: '#ef4444' },
            { range: 'Mid (51-75)', count: 0, fill: '#f59e0b' },
            { range: 'High (76-100)', count: 0, fill: '#10b981' },
        ];
        
        const rolesMap: Record<string, number> = {};

        candidates.forEach(c => {
            if (c.matchScore <= 50) distribution[0].count++;
            else if (c.matchScore <= 75) distribution[1].count++;
            else distribution[2].count++;

            const role = c.jobTitle || 'Unspecified';
            rolesMap[role] = (rolesMap[role] || 0) + 1;
        });

        const rolesData = Object.entries(rolesMap).map(([name, value]) => ({ name, value }));

        return { avgScore, distribution, rolesData };
    }, [candidates]);

    if (plan !== 'recruiter') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-headline font-bold">Recruiter Dashboard</h2>
                <p className="text-muted-foreground mt-2 max-w-md">This tool is exclusive to the Recruiter plan. Manage saved talent and track your hiring pipeline with AI analytics.</p>
                <Button className="mt-6" asChild>
                    <a href="/pricing">View Plans</a>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold font-headline">Recruiter Workspace</h2>
                <p className="text-muted-foreground">Shortlist management and recruitment analytics.</p>
            </div>

            <Tabs defaultValue="shortlist" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="shortlist" className="flex items-center gap-2">
                        <ListChecks className="w-4 h-4" /> Shortlist
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="shortlist" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl font-headline flex items-center gap-2">
                                <Users className="text-primary w-5 h-5"/> Saved Talent
                            </CardTitle>
                            <CardDescription>Persistent shortlist of candidates identified by AI.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>AI Score</TableHead>
                                        <TableHead className="hidden md:table-cell">Date Added</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <TableRow key={i}>
                                                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : candidates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                No candidates saved. Use the Matcher tool to build your list.
                                            </TableCell>
                                        </TableRow>
                                    ) : candidates.map((candidate) => (
                                        <TableRow key={candidate.id}>
                                            <TableCell className="font-medium truncate max-w-[150px]">{candidate.name}</TableCell>
                                            <TableCell className="text-sm">{candidate.jobTitle || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge variant={candidate.matchScore > 75 ? 'default' : candidate.matchScore > 50 ? 'secondary' : 'outline'}>
                                                    {candidate.matchScore}%
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                                {candidate.shortlistedAt ? formatDistanceToNow(new Date(candidate.shortlistedAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild><Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button></TooltipTrigger>
                                                            <TooltipContent className="max-w-xs"><p className="font-semibold mb-1">AI Reasoning:</p><p className="text-xs">{candidate.justification}</p></TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(candidate.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{candidates.length}</div>
                                <p className="text-xs text-muted-foreground">Unique profiles in shortlist</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg. Match Score</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats?.avgScore.toFixed(1) || 0}%</div>
                                <p className="text-xs text-muted-foreground">Quality average of pool</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none">Live</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-medium">Real-time Analysis</div>
                                <p className="text-xs text-muted-foreground">Updates as you match</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Score Distribution</CardTitle>
                                <CardDescription>How your pool ranks by match quality.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {candidates.length > 0 ? (
                                    <ChartContainer config={chartConfig} className="h-full w-full">
                                        <BarChart data={stats?.distribution}>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis dataKey="range" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                {stats?.distribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">Role Breakdown</CardTitle>
                                <CardDescription>Shortlist grouped by target position.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {candidates.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats?.rolesData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats?.rolesData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - (index % 5) * 0.2})`} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
