
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
import { Shield, History } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
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

export function PaymentHistory() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(
            usersCollectionRef, 
            where('planUpdatedAt', '!=', null),
            orderBy('planUpdatedAt', 'desc')
        );
        const usersSnapshot = await getDocs(q);
        const usersList = usersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
        setUsers(usersList);

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
        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><History /> Payment History</CardTitle>
            <CardDescription>Review all historical subscription payments. This includes active and expired plans.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Last Upgrade Date</TableHead>
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
