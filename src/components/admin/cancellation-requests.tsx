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
import { MoreHorizontal, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

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

export function CancellationRequests() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    const usersCollectionRef = collection(db, 'users');
    const q = query(usersCollectionRef, where('plan', '==', 'cancellation_requested'), orderBy('planUpdatedAt', 'desc'));
    const usersSnapshot = await getDocs(q);
    const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
    setUsers(usersList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCancellation = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { 
        plan: 'free',
        planUpdatedAt: null,
        requestedPlan: null,
       });
      toast({
        title: 'Cancellation Processed',
        description: `User's plan has been reverted to free.`,
      });
      fetchUsers(); // Refresh users list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process cancellation.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cancellation Requests</CardTitle>
        <CardDescription>Review and process pending subscription cancellation requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Plan</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No pending cancellation requests.
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
                      <Badge variant="destructive">Cancellation Requested</Badge>
                    </TableCell>
                    <TableCell>
                      {user.planUpdatedAt
                        ? new Date(user.planUpdatedAt.seconds * 1000).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DropdownMenuSeparator />
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem>
                                    <Ban className="mr-2 h-4 w-4 text-orange-500"/>
                                    Process Cancellation
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This will revert the user's plan to "Free". This action cannot be undone, but you can manually re-assign a plan later.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancellation(user.id)} className="bg-destructive hover:bg-destructive/90">Confirm Cancellation</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Content>
    </Card>
  );
}
