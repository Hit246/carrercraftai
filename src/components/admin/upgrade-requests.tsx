
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, orderBy, getDoc, increment } from 'firebase/firestore';
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
import { MoreHorizontal, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';

type Plan = 'free' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested' | 'essentials';

interface UserData {
  id: string;
  email: string;
  plan: Plan;
  requestedPlan?: 'essentials' | 'pro' | 'recruiter';
  previousPlan?: Plan;
  createdAt?: { seconds: number };
  planUpdatedAt?: { seconds: number };
  paymentProofURL?: string;
}

export function UpgradeRequestsPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef, where('plan', '==', 'pending'));
        const usersSnapshot = await getDocs(q);
        const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
        setUsers(usersList);
    } catch(e) {
        console.error(e);
        toast({
            title: 'Error Fetching Requests',
            description: 'Could not load upgrade requests.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (user: UserData) => {
    if (!user.requestedPlan) return;
    setIsProcessingId(user.id);
    try {
      // Fetch current pricing to record the amount paid
      const pricingSnap = await getDoc(doc(db, 'settings', 'pricing'));
      let amountPaid = 0;
      if (pricingSnap.exists()) {
          const pricing = pricingSnap.data();
          amountPaid = pricing[user.requestedPlan] || 0;
          // Apply festive discount if active
          if (pricing.festiveDiscount > 0) {
              amountPaid = Math.floor(amountPaid * (1 - pricing.festiveDiscount / 100));
          }
      }

      const userRef = doc(db, 'users', user.id);
      
      // Calculate credits to add
      let creditsUpdate: any = 5;
      if (user.requestedPlan === 'essentials') {
          creditsUpdate = increment(50);
      } else if (user.requestedPlan === 'pro' || user.requestedPlan === 'recruiter') {
          creditsUpdate = 999999;
      }

      await updateDoc(userRef, { 
        plan: user.requestedPlan, 
        planUpdatedAt: new Date(),
        credits: creditsUpdate,
        requestedPlan: null,
        previousPlan: null,
        amountPaid: amountPaid, // Record the price at time of approval
      });

      toast({
        title: 'Plan Approved',
        description: `User's plan has been changed to ${user.requestedPlan}.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve user plan.',
        variant: 'destructive',
      });
    } finally {
        setIsProcessingId(null);
    }
  };
  
  const handleReject = async (user: UserData) => {
    setIsProcessingId(user.id);
    const userRef = doc(db, 'users', user.id);
    const revertPlan = user.previousPlan || 'free'; 
    try {
      await updateDoc(userRef, {
        plan: revertPlan,
        // We DO NOT set planUpdatedAt to null here so that if they paid previously, 
        // that history is preserved. Rejection just stops the PENDING upgrade.
        requestedPlan: null,
        previousPlan: null,
      });
      toast({
        title: 'Request Rejected',
        description: `User's plan has been reverted to ${revertPlan}.`,
        variant: 'destructive',
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject the request.',
        variant: 'destructive',
      });
    } finally {
        setIsProcessingId(null);
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
              <TableHead>Requested On</TableHead>
              <TableHead>Proof of Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
                    <TableCell className="text-sm text-muted-foreground">
                      {user.planUpdatedAt
                        ? new Date(user.planUpdatedAt.seconds * 1000).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                        {user.paymentProofURL ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={user.paymentProofURL} target="_blank">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Proof
                                </Link>
                            </Button>
                        ) : (
                            <span className="text-xs text-muted-foreground">Not provided</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.requestedPlan && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={isProcessingId === user.id}>
                              <Button variant="ghost" size="icon">
                                {isProcessingId === user.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleApprove(user)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500"/>
                                    Approve as {user.requestedPlan}
                                  </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handleReject(user)}>
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
