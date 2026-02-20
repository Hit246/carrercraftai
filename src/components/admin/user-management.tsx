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
import { MoreHorizontal, Trash2, Crown, User, Shield, Trophy, AlertTriangle, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { differenceInDays, addDays, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserData {
  id: string;
  email: string;
  plan: Plan;
  requestedPlan?: 'essentials' | 'pro' | 'recruiter';
  createdAt?: { seconds: number };
  planUpdatedAt?: { seconds: number };
}

const ADMIN_EMAILS = ['admin@careercraft.ai', 'hitarth0236@gmail.com'];

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersCollectionRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollectionRef);
      const usersList = usersSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as UserData))
        .sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setUsers(usersList);
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to load users.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
      toast({ title: 'Plan Updated', description: `User changed to ${newPlan}.` });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Update failed.', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteId) return;
    const userRef = doc(db, 'users', deleteId);
    try {
      await deleteDoc(userRef);
      toast({ title: 'User Deleted' });
      setDeleteId(null);
      fetchUsers(); 
    } catch (error) {
      toast({ title: 'Error', description: 'Delete failed.', variant: 'destructive' });
    }
  };

  const getPlanBadgeVariant = (plan: Plan) => {
    switch (plan) {
      case 'essentials':
      case 'pro': return 'secondary';
      case 'recruiter': return 'default';
      case 'pending':
      case 'cancellation_requested': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getPlanDisplayName = (user: UserData) => {
    switch (user.plan) {
      case 'pending': return `Pending (${user.requestedPlan})`;
      case 'cancellation_requested': return `Cancellation Requested`;
      default: return user.plan;
    }
  };

  const getExpirationInfo = (user: UserData) => {
    if (!user.planUpdatedAt || ['free', 'pending', 'cancellation_requested'].includes(user.plan)) return null;
    const upgradeDate = new Date(user.planUpdatedAt.seconds * 1000);
    const expirationDate = addDays(upgradeDate, 30);
    const daysRemaining = differenceInDays(expirationDate, new Date());
    if (daysRemaining < 0) return { status: 'expired' as const, date: expirationDate };
    if (daysRemaining <= 7) return { status: 'expires_soon' as const, date: expirationDate };
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage all user profiles and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subscription Plan</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))
                ) : (
                    users.map((user) => {
                        const isUserAdmin = ADMIN_EMAILS.includes(user.email);
                        const expirationInfo = getExpirationInfo(user);
                        return (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://placehold.co/100x100.png?text=${user.email[0].toUpperCase()}`} />
                                            <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="max-w-[150px] md:max-w-none">
                                            <p className="font-medium flex items-center gap-2 text-sm truncate">{user.email}{isUserAdmin && <Shield className="h-3 w-3 text-primary shrink-0" />}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono truncate">{user.id}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {isUserAdmin ? <Badge>Admin</Badge> : <Badge variant={getPlanBadgeVariant(user.plan)}>{getPlanDisplayName(user)}</Badge>}
                                        {expirationInfo?.status === 'expires_soon' && (
                                            <Tooltip><TooltipTrigger><Badge variant="destructive" className="bg-yellow-500">Soon</Badge></TooltipTrigger><TooltipContent><p>Expires {format(expirationInfo.date, 'MMM d')}</p></TooltipContent></Tooltip>
                                        )}
                                        {expirationInfo?.status === 'expired' && <Badge variant="destructive">Expired</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs">
                                    {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {!isUserAdmin && (
                                        <DropdownMenu modal={false}>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}><User className="mr-2 h-4 w-4" /> Set Free</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'essentials')}><Trophy className="mr-2 h-4 w-4" /> Set Essentials</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'pro')}><Crown className="mr-2 h-4 w-4" /> Set Pro</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'recruiter')}><Handshake className="mr-2 h-4 w-4" /> Set Recruiter</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(user.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })
                )}
            </TableBody>
            </Table>
        </TooltipProvider>
      </CardContent>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete User?</AlertDialogTitle>
                <AlertDialogDescription>This action is permanent and will remove all their resume data.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
