'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Users, UserPlus, Crown, Handshake } from "lucide-react";
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

interface UserData {
    id: string;
    email: string;
    plan: 'free' | 'pro' | 'recruiter';
    createdAt?: { seconds: number, nanoseconds: number };
}

interface PlanCount {
    free: number;
    pro: number;
    recruiter: number;
}

export function AdminDashboard() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [planDistribution, setPlanDistribution] = useState<PlanCount | null>(null);
    const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const usersCollectionRef = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollectionRef);
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));

                // Set total user count
                setUserCount(usersList.length);

                // Calculate plan distribution
                const plans: PlanCount = { free: 0, pro: 0, recruiter: 0 };
                usersList.forEach(user => {
                    if (user.plan) {
                        plans[user.plan]++;
                    } else {
                        plans['free']++; // Default to free if no plan is set
                    }
                });
                setPlanDistribution(plans);

                // Get recent users
                const recentUsersQuery = query(usersCollectionRef, orderBy('createdAt', 'desc'), limit(5));
                const recentUsersSnapshot = await getDocs(recentUsersQuery);
                const recentUsersList = recentUsersSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as UserData));
                setRecentUsers(recentUsersList);

            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartData = planDistribution ? [
        { name: 'Free', count: planDistribution.free, fill: 'var(--color-free)' },
        { name: 'Pro', count: planDistribution.pro, fill: 'var(--color-pro)' },
        { name: 'Recruiter', count: planDistribution.recruiter, fill: 'var(--color-recruiter)' },
    ] : [];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="p-2 bg-background border rounded-lg shadow-lg">
              <p className="font-bold">{`${label} : ${payload[0].value}`}</p>
            </div>
          );
        }
        return null;
      };

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={chartData} style={{
                                    '--color-free': 'hsl(var(--chart-1))',
                                    '--color-pro': 'hsl(var(--chart-2))',
                                    '--color-recruiter': 'hsl(var(--chart-3))',
                                } as React.CSSProperties}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                                    <Tooltip content={<CustomTooltip />}/>
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
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
