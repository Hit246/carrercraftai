'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, Crown, Handshake, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface UserData {
    id: string;
    email: string;
    plan: 'free' | 'essentials' | 'pro' | 'recruiter';
    createdAt?: { seconds: number, nanoseconds: number };
}

interface PlanCount {
    free: number;
    essentials: number;
    pro: number;
    recruiter: number;
}

const chartConfig = {
    count: {
        label: "Users",
    },
    free: {
        label: "Free",
        color: "hsl(var(--chart-1))",
    },
    essentials: {
        label: "Essentials",
        color: "hsl(var(--chart-4))",
    },
    pro: {
        label: "Pro",
        color: "hsl(var(--chart-2))",
    },
    recruiter: {
        label: "Recruiter",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig;


export function AdminDashboard() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [planDistribution, setPlanDistribution] = useState<PlanCount | null>(null);
    const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
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
                usersList.forEach(user => {
                    if (user.plan && (user.plan === 'free' || user.plan === 'essentials' || user.plan === 'pro' || user.plan === 'recruiter')) {
                        plans[user.plan]++;
                    } else {
                        plans['free']++;
                    }
                });
                setPlanDistribution(plans);

                const recentUsersQuery = query(usersCollectionRef, orderBy('createdAt', 'desc'), limit(5));
                const recentUsersSnapshot = await getDocs(recentUsersQuery);
                const recentUsersList = recentUsersSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as UserData));
                setRecentUsers(recentUsersList);

            } catch (error) {
                console.error("Error fetching admin data:", error);
                toast({
                    title: 'Error Fetching Data',
                    description: 'Could not load dashboard data. You may need to create a Firestore index.',
                    variant: 'destructive',
                });
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

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/4 mt-1" /> : <div className="text-2xl font-bold">{userCount}</div>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Essentials Users</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/4 mt-1" /> : <div className="text-2xl font-bold">{planDistribution?.essentials}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
                        <Crown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/4 mt-1" /> : <div className="text-2xl font-bold">{planDistribution?.pro}</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recruiter Users</CardTitle>
                        <Handshake className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/4 mt-1" /> : <div className="text-2xl font-bold">{planDistribution?.recruiter}</div>}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>User Subscription Distribution</CardTitle>
                        <CardDescription>A breakdown of users by their subscription plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {isLoading ? (
                             <div className="h-[350px] w-full flex items-center justify-center">
                                <Skeleton className="h-full w-full" />
                            </div>
                        ) : (
                            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                                <BarChart accessibilityLayer data={chartData}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                    />
                                    <YAxis />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar dataKey="count" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserPlus /> Recent Signups</CardTitle>
                         <CardDescription>The last 5 users who signed up.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Signed Up</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                            <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : recentUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={`https://placehold.co/100x100.png?text=${user.email[0].toUpperCase()}`} />
                                                    <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="truncate">
                                                    <p className="font-medium text-sm truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {user.createdAt ? formatDistanceToNow(new Date(user.createdAt.seconds * 1000), { addSuffix: true }) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
