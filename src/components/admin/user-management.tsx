'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc, increment } from 'firebase/firestore';
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
import { MoreHorizontal, Trash2, Crown, User, Shield, Trophy, AlertTriangle, Handshake, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { differenceInDays, addDays, format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { deleteUserAccountAction } from '@/lib/actions';

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserData {
  id: string;
  email: string;
  plan: Plan;
  photoURL?: string;
  requestedPlan?: 'essentials' | 'pro' | 'recruiter';
  billingCycle?: 'monthly' | 'annual';
  createdAt?: { seconds: number };
  planUpdatedAt?: { seconds: number };
}

const ADMIN_EMAILS = ['support@careercraftai.tech', 'admin@careercraftai.tech', 'hitarth0236@gmail.com'];

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
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

  const handlePlanChange = async (userId: string, newPlan: Plan) => {
    const userRef = doc(db, 'users', userId);
    try {
      let amountPaid = 0;
      if (['essentials', 'pro', 'recruiter'].includes(newPlan)) {
          const pricingSnap = await getDoc(doc(db, 'settings', 'pricing'));
          if (pricingSnap.exists()) {
              const pricing = pricingSnap.data();
              amountPaid = pricing[newPlan] || 0;
              if (pricing.festiveDiscount > 0) {
                  amountPaid = Math.floor(amountPaid * (1 - pricing.festiveDiscount / 100));
              }
          }
      }

      const updateData: any = { 
        plan: newPlan,
      };

      if (['essentials', 'pro', 'recruiter'].includes(newPlan)) {
          updateData.planUpdatedAt = new Date();
          updateData.amountPaid = amountPaid;
          updateData.webhookVerified = false;
          
          if (newPlan === 'essentials') {
              updateData.credits = increment(50);
          } else if (newPlan === 'pro' || newPlan === 'recruiter') {
              updateData.credits = 999999;
          }
      } else if (newPlan === 'free') {
          updateData.credits = 5;
      }
      
      if (newPlan !== 'pending') {
        updateData.requestedPlan = null;
      }

      await updateDoc(userRef, updateData);
      toast({
        title: 'Plan Updated',
        description: `User's plan has been changed to ${newPlan}.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user plan.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeletingId(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      try {
        await deleteUserAccountAction(userId);
        toast({
            title: 'User Fully Deleted',
            description: 'Database record and authentication account have been removed.',
        });
      } catch (authError: any) {
        console.warn("Auth deletion failed:", authError);
        toast({
            title: 'Firestore Doc Deleted',
            description: 'Database record removed, but auth account requires manual deletion.',
            variant: 'destructive',
        });
      }
      
      fetchUsers(); 
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user document.',
        variant: 'destructive',
      });
    } finally {
        setIsDeletingId(null);
    }
  };

  const getPlanBadgeVariant = (plan: Plan) => {
    switch (plan) {
      case 'essentials':
        return 'secondary';
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

  const getExpirationInfo = (user: UserData) => {
    if (!user.planUpdatedAt || ['free', 'pending', 'cancellation_requested'].includes(user.plan)) {
      return null;
    }
    const upgradeDate = new Date(user.planUpdatedAt.seconds * 1000);
    const expirationDate = addDays(upgradeDate, 30);
    const daysRemaining = differenceInDays(expirationDate, new Date());

    if (daysRemaining < 0) {
      return { status: 'expired' as const, date: expirationDate };
    }
    if (daysRemaining <= 7) {
      return { status: 'expires_soon' as const, date: expirationDate };
    }
    return null;
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View, manage, and edit all user profiles and permissions.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subscription Plan</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading
                ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                    ))
                : users.map((user) => {
                    const isUserAdmin = ADMIN_EMAILS.includes(user.email);
                    const expirationInfo = getExpirationInfo(user);
                    return (
                    <TableRow key={user.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={user.photoURL || `https://placehold.co/100x100.png?text=${user.email?.[0].toUpperCase()}`} />
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
                            <div className="flex items-center gap-2">
                                {isUserAdmin ? (
                                    <Badge>Admin</Badge>
                                ) : (
                                    <Badge variant={getPlanBadgeVariant(user.plan)}>
                                    {getPlanDisplayName(user)}
                                    </Badge>
                                )}
                                {expirationInfo?.status === 'expires_soon' && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge variant="destructive" className="bg-yellow-500 hover:bg-yellow-500/80">Expires Soon</Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Expires on {format(expirationInfo.date, 'MMM d, yyyy')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                 {expirationInfo?.status === 'expired' && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                             <Badge variant="destructive">Expired</Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Expired on {format(expirationInfo.date, 'MMM d, yyyy')}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            {user.billingCycle ? (
                                <Badge variant="outline" className="capitalize text-[10px]">
                                    {user.billingCycle === 'annual' ? (
                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-green-500"/> Annual</span>
                                    ) : 'Monthly'}
                                </Badge>
                            ) : '-'}
                        </TableCell>
                        <TableCell>
                        {user.createdAt
                            ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                        {!isUserAdmin && (
                            <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild disabled={isDeletingId === user.id}>
                                <Button variant="ghost" size="icon">
                                    {isDeletingId === user.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4" />}
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}>
                                    <User className="mr-2 h-4 w-4" />
                                    Set to Free
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'essentials')}>
                                    <Trophy className="mr-2 h-4 w-4" />
                                    Set to Essentials
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'pro')}>
                                    <Crown className="mr-2 h-4 w-4" />
                                    Set to Pro
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'recruiter')}>
                                    <Handshake className="mr-2 h-4 w-4" />
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
                                <AlertDialogTitle>Delete user account permanently?</AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="space-y-4">
                                        <p>This action will delete the user's Firestore document <strong>and</strong> their Firebase Authentication account.</p>
                                        <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md flex items-start gap-2 text-amber-800 dark:text-amber-200">
                                            <AlertCircle className="h-5 w-5 shrink-0" />
                                            <div className="text-xs">
                                                <strong>Note:</strong> Authentication deletion requires a configured <code>FIREBASE_SERVICE_ACCOUNT_KEY</code>.
                                            </div>
                                        </div>
                                    </div>
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                            </AlertDialog>
                        )}
                        </TableCell>
                    </TableRow>
                    )})}
            </TableBody>
            </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
