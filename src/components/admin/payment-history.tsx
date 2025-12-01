
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, History, IndianRupee } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserData {
  id: string;
  email: string;
  plan: Plan;
  createdAt?: { seconds: number };
  planUpdatedAt?: { seconds: number };
  paymentProofURL?: string;
  webhookVerified?: boolean;
}

const planPrices: Record<Exclude<Plan, 'free' | 'pending' | 'cancellation_requested'>, number> = {
    essentials: 199,
    pro: 399,
    recruiter: 999,
};

export function PaymentHistory() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(
            usersCollectionRef, 
            where('plan', 'in', ['essentials', 'pro', 'recruiter']),
            orderBy('planUpdatedAt', 'desc')
        );
        const usersSnapshot = await getDocs(q);
        const usersList = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
        setUsers(usersList);

        const revenue = usersList.reduce((acc, user) => {
            if (user.plan !== 'free' && user.plan !== 'pending' && user.plan !== 'cancellation_requested') {
                return acc + (planPrices[user.plan] || 0);
            }
            return acc;
        }, 0);
        setTotalRevenue(revenue);

    } catch(e) {
        console.error(e);
        toast({
            title: 'Error Fetching History',
            description: 'Could not load payment history. You may need to create a Firestore index.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getPlanBadgeVariant = (plan: Plan) => {
    switch (plan) {
      case 'pro':
        return 'secondary';
      case 'essentials':
        return 'secondary';
      case 'recruiter':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
        <Card className="max-w-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-1/2" />
                ) : (
                    <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                )}
                <p className="text-xs text-muted-foreground">From all successful plan upgrades.</p>
            </CardContent>
        </Card>
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><History /> Payment History</CardTitle>
            <CardDescription>Review historical payment and subscription data.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subscription Plan</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Upgrade Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading
                ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                    ))
                : users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No payment history found.
                        </TableCell>
                    </TableRow>
                ) : users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={`https://placehold.co/100x100.png?text=${user.email[0].toUpperCase()}`} />
                            <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                            <p className="font-medium flex items-center gap-2">{user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.id}</p>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getPlanBadgeVariant(user.plan)}>
                            {user.plan}
                            </Badge>
                        </TableCell>
                        <TableCell>
                           {user.webhookVerified ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                    <Shield className="mr-1 h-3 w-3"/>
                                    Webhook
                                </Badge>
                            ) : (
                                <Badge variant="secondary">Manual</Badge>
                            )}
                        </TableCell>
                        <TableCell>
                        {user.planUpdatedAt
                            ? new Date(user.planUpdatedAt.seconds * 1000).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                    </TableRow>
                    ))}
            </TableBody>
            </Table>
        </CardContent>
        </Card>
    </div>
  );
}
