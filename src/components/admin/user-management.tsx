'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
import { MoreHorizontal, Trash2, Crown, User, Shield, ExternalLink, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
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

const ADMIN_EMAILS = ['admin@careercraft.ai', 'hitarth0236@gmail.com'];

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    const usersList = usersSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as UserData))
      .sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    setUsers(usersList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePlanChange = async (userId: string, newPlan: Plan, requestedPlan: UserData['requestedPlan'] = undefined) => {
    const userRef = doc(db, 'users', userId);
    try {
      const updateData: any = { 
        plan: newPlan, 
        planUpdatedAt: newPlan !== 'free' ? new Date() : null,
      };

      if (newPlan === 'free') {
        updateData.requestedPlan = null;
      } else if (requestedPlan) {
        updateData.requestedPlan = requestedPlan;
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

  const handleDeleteUser = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    try {
      await deleteDoc(userRef);
      toast({
        title: 'User Deleted',
        description: 'User has been removed from Firestore.',
      });
      fetchUsers(); 
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

  const getPlanBadgeVariant = (plan: Plan) => {
    switch (plan) {
      case 'pro':
        return 'secondary';
      case 'recruiter':
        return 'default';
      case 'pending':
      case 'cancellation_requested':
          return 'destructive';
      default:
        return 'outline';
    }
  };
  
  const getPlanDisplayName = (user: UserData) => {
    switch (user.plan) {
      case 'pending':
        return `Pending (${user.requestedPlan})`;
      case 'cancellation_requested':
        return `Cancellation Requested`;
      default:
        return user.plan;
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View, manage, and edit user profiles and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Subscription Plan</TableHead>
              <TableHead>Payment Proof</TableHead>
              <TableHead>Last Upgraded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              : users.map((user) => {
                const isUserAdmin = ADMIN_EMAILS.includes(user.email);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://placehold.co/100x100.png?text=${user.email[0].toUpperCase()}`} />
                          <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {user.email}
                            {isUserAdmin && <Shield className="h-4 w-4 text-primary" />}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       {isUserAdmin ? (
                        <Badge>Admin</Badge>
                       ) : (
                        <Badge variant={getPlanBadgeVariant(user.plan)}>
                          {getPlanDisplayName(user)}
                        </Badge>
                       )}
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
                      {!isUserAdmin && (
                        <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              
                              {user.plan === 'pending' && user.requestedPlan && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handlePlanChange(user.id, user.requestedPlan as Plan)}>
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500"/>
                                    Approve Payment
                                  </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}>
                                    <XCircle className="mr-2 h-4 w-4 text-red-500"/>
                                    Reject Payment
                                  </DropdownMenuItem>
                                </>
                              )}

                              {user.plan === 'cancellation_requested' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}>
                                    <Ban className="mr-2 h-4 w-4 text-orange-500"/>
                                    Process Cancellation
                                  </DropdownMenuItem>
                                </>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}>
                                <User className="mr-2 h-4 w-4" />
                                Set to Free
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'pro')}>
                                <Crown className="mr-2 h-4 w-4" />
                                Set to Pro
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'recruiter')}>
                                <User className="mr-2 h-4 w-4" />
                                Set to Recruiter
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user's
                                  data from Firestore. To fully remove them, you must also delete them from the Firebase Authentication console.
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
