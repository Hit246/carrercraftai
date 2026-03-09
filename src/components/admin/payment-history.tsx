'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
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
import { Shield, History, ExternalLink, IndianRupee, Wallet } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import Link from 'next/link';

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserData {
  id: string;
  email: string;
  plan: Plan;
  createdAt?: { seconds: number };
  planUpdatedAt?: { seconds: number };
  paymentProofURL?: string;
  webhookVerified?: boolean;
  amountPaid?: number;
}

export function PaymentHistory() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const usersCollectionRef = collection(db, 'users');
        // We fetch anyone who has ever had a plan update (payment)
        const q = query(
            usersCollectionRef, 
            where('planUpdatedAt', '!=', null),
            orderBy('planUpdatedAt', 'desc')
        );
        const usersSnapshot = await getDocs(q);
        const usersList = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
        
        setUsers(usersList);
        
        const revenue = usersList.reduce((acc, user) => acc + (user.amountPaid || 0), 0);
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
      case 'free':
          return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Lifetime Revenue</CardTitle>
                    <IndianRupee className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>}
                    <p className="text-xs text-muted-foreground mt-1">From {users.length} paying customers</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Payment Channel</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Hybrid</div>
                    <p className="text-xs text-muted-foreground mt-1">Webhook & Manual Verification</p>
                </CardContent>
            </Card>
        </div>

        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><History /> Payment History</CardTitle>
            <CardDescription>Review all historical subscription payments. Records remain here even if a plan is cancelled or expired.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Price Paid</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Proof</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading
                ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                    ))
                : users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
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
                            <p className="font-medium flex items-center gap-2 text-sm">{user.email}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{user.id}</p>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getPlanBadgeVariant(user.plan)}>
                            {user.plan === 'free' ? 'Expired/Cancelled' : user.plan}
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
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-0.5 text-sm">
                                <IndianRupee className="h-3 w-3" />
                                {user.amountPaid !== undefined ? user.amountPaid : '---'}
                            </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {user.planUpdatedAt
                            ? new Date(user.planUpdatedAt.seconds * 1000).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                            {user.paymentProofURL ? (
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={user.paymentProofURL} target="_blank">
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <span className="text-[10px] text-muted-foreground">None</span>
                            )}
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