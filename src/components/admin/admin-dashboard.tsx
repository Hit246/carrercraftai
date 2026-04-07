'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, Crown, Handshake, Trophy, IndianRupee, TrendingUp, Activity, ShieldCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UserData {
    id: string;
    email: string;
    plan: 'free' | 'essentials' | 'pro' | 'recruiter';
    createdAt?: { seconds: number, nanoseconds: number };
    amountPaid?: number;
}

interface PlanCount {
    free: number;
    essentials: number;
    pro: number;
    recruiter: number;
}

const chartConfig = {
    count: { label: "Users", color: "hsl(var(--primary))" },
    free: { label: "Free", color: "hsl(var(--muted-foreground))" },
    essentials: { label: "Essentials", color: "hsl(var(--chart-4))" },
    pro: { label: "Pro", color: "hsl(var(--chart-2))" },
    recruiter: { label: "Recruiter", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export function AdminDashboard() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [planDistribution, setPlanDistribution] = useState<PlanCount | null>(null);
    const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const usersCollectionRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollectionRef);
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));

                setUserCount(usersList.length);

                const plans: PlanCount = { free: 0, essentials: 0, pro: 0, recruiter: 0 };
                let revenue = 0;
                
                usersList.forEach(user => {
                    if (user.plan && (['free', 'essentials', 'pro', 'recruiter'].includes(user.plan))) {
                        plans[user.plan]++;
                    } else {
                        plans['free']++;
                    }
                    if (user.amountPaid) revenue += user.amountPaid;
                });
                setPlanDistribution(plans);
                setTotalRevenue(revenue);

                const recentUsersQuery = query(usersCollectionRef, orderBy('createdAt', 'desc'), limit(5));
                const recentUsersSnapshot = await getDocs(recentUsersQuery);
                const recentUsersList = recentUsersSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as UserData));
                setRecentUsers(recentUsersList);

            } catch (error) {
                console.error("Fetch error:", error);
                toast({ title: 'System Error', description: 'Access denied or network failure.', variant: 'destructive'});
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const chartData = planDistribution ? [
        { name: 'Free', count: planDistribution.free, fill: 'var(--color-free)' },
        { name: 'Essentials', count: planDistribution.essentials, fill: 'var(--color-essentials)' },
        { name: 'Pro', count: planDistribution.pro, fill: 'var(--color-pro)' },
        { name: 'Recruiter', count: planDistribution.recruiter, fill: 'var(--color-recruiter)' },
    ] : [];

    const stats = [
      { title: "Total Users", value: userCount?.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
      { title: "L.T. Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-green-500", bg: "bg-green-500/10" },
      { title: "Pro Tiers", value: planDistribution?.pro, icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10" },
      { title: "Recruiters", value: planDistribution?.recruiter, icon: Handshake, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    ];

    return (
        <div className="space-y-10 fade-in">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                  <Card key={i} className="border-white/5 bg-card/50 shadow-xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
                      <div className={cn("p-2 rounded-xl group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold font-headline">{stat.value}</div>}
                    </CardContent>
                  </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-7">
                <Card className="lg:col-span-4 border-white/5 bg-card/50 shadow-2xl">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                          <Activity className="w-5 h-5 text-primary" /> Subscription Distribution
                        </CardTitle>
                        <CardDescription>Visual breakdown of current active user plans.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        {isLoading ? (
                             <Skeleton className="h-full w-full rounded-2xl" />
                        ) : (
                            <ChartContainer config={chartConfig} className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData}>
                                      <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                      <XAxis
                                          dataKey="name"
                                          tickLine={false}
                                          tickMargin={10}
                                          axisLine={false}
                                          tick={{ fontSize: 10, fontWeight: 700 }}
                                      />
                                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                      <ChartTooltip
                                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                          content={<ChartTooltipContent indicator="dot" />}
                                      />
                                      <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40} />
                                  </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-white/5 bg-card/50 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="font-headline text-lg flex items-center gap-2">
                          <UserPlus className="w-5 h-5 text-primary" /> Global Signups
                        </CardTitle>
                         <CardDescription>Most recent system registrations.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : recentUsers.length > 0 ? recentUsers.map(user => (
                                    <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.03]">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                                                    <AvatarFallback className="bg-muted text-[10px] font-black uppercase">{user.email[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{user.email}</p>
                                                    <div className="flex items-center gap-2">
                                                      <Badge variant="outline" className="text-[8px] h-4 px-1.5 font-black uppercase tracking-tighter border-none bg-muted/50">
                                                        {user.plan}
                                                      </Badge>
                                                      <p className="text-[10px] text-muted-foreground">
                                                        {user.createdAt ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), { addSuffix: true }) : '---'}
                                                      </p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                  <TableRow>
                                    <TableCell className="h-40 text-center text-sm text-muted-foreground">No records found.</TableCell>
                                  </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
