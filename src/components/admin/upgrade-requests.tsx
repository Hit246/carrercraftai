
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

type Plan = 'free' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserData {
  id: string;
  email: string;
  plan: Plan;
  requestedPlan?: 'pro' | 'recruiter';
  createdAt?: { seconds: number };
  planUpdatedAt?: { seconds: number };
  paymentProofURL?: string;
}

export function UpgradeRequestsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('plan', '==', 'pending'), orderBy('planUpdatedAt', 'desc'));
        const usersSnapshot = await getDocs(q);
        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
        setUsers(usersList);
    } catch(e) {
        console.error(e);
        toast({
            title: 'Error Fetching Requests',
            description: 'Could not load upgrade requests. You may need to create a Firestore index.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [toast]);

  const handlePlanChange = async (userId: string, newPlan: Plan) => {
    const userRef = doc(db, 'users', userId);
    try {
      const updateData: any = { 
        plan: newPlan, 
        planUpdatedAt: newPlan !== 'free' ? new Date() : null,
      };

      if (newPlan !== 'pending') {
        updateData.requestedPlan = null;
      }

      await updateDoc(userRef, updateData);
      toast({
        title: 'Plan Updated',
        description: `User's plan has been changed to ${newPlan}.`,
      });
      fetchUsers(); // Refresh users list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user plan.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upgrade Requests</CardTitle>
        <CardDescription>Review and approve pending plan upgrades.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Requested Plan</TableHead>
              <TableHead>Payment Proof</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No pending upgrade requests.
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
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                        <Badge variant="destructive">
                          Pending ({user.requestedPlan})
                        </Badge>
                    </TableCell>
                    <TableCell>
                        {user.paymentProofURL ? (
                            <Button variant="link" asChild size="sm" className="h-auto p-0">
                                <Link href={user.paymentProofURL} target="_blank" rel="noopener noreferrer">
                                    View Proof <ExternalLink className="ml-1 h-3 w-3"/>
                                </Link>
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                        )}
                    </TableCell>
                    <TableCell>
                      {user.planUpdatedAt
                        ? new Date(user.planUpdatedAt.seconds * 1000).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.requestedPlan && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handlePlanChange(user.id, user.requestedPlan as Plan)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500"/>
                                    Approve as {user.requestedPlan}
                                  </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-500"/>
                                    Reject Payment
                                  </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
