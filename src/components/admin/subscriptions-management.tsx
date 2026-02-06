'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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
import { MoreHorizontal, Crown, User, Shield, Trophy, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { differenceInDays, addDays, format } from 'date-fns';

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

export function SubscriptionsManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    const usersCollectionRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollectionRef);
    const usersList = usersSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as UserData))
      .sort((a,b) => (b.planUpdatedAt?.seconds || 0) - (a.planUpdatedAt?.seconds || 0));
    setUsers(usersList);
    setIsLoading(false);
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

  const getPlanBadge = (user: UserData) => {
    if (ADMIN_EMAILS.includes(user.email)) {
        return <Badge>Admin</Badge>;
    }
    switch (user.plan) {
      case 'essentials':
        return <Badge variant="secondary">Essentials</Badge>;
      case 'pro':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">Pro</Badge>;
      case 'recruiter':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Recruiter</Badge>;
      case 'pending':
        return <Badge variant="destructive">Pending ({user.requestedPlan})</Badge>;
      case 'cancellation_requested':
          return <Badge variant="destructive">Cancellation</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getStatusBadge = (user: UserData) => {
     if (user.plan === 'pending' || user.plan === 'cancellation_requested') {
        return null; // The plan badge already shows this.
    }
    if (user.plan === 'free' || ADMIN_EMAILS.includes(user.email)) {
        return <Badge variant="secondary">N/A</Badge>;
    }

    if (user.planUpdatedAt) {
        const expirationDate = addDays(new Date(user.planUpdatedAt.seconds * 1000), 30);
        const daysRemaining = differenceInDays(expirationDate, new Date());

        if (daysRemaining < 0) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (daysRemaining <= 7) {
            return <Badge className="bg-yellow-500 hover:bg-yellow-500/80">Expires Soon</Badge>;
        }
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Active</Badge>;
    }
    return <Badge variant="outline">N/A</Badge>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
        <CardDescription>Oversee all user subscriptions, upgrade dates, and expiry.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Current Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Upgrade Date</TableHead>
              <TableHead>Expires On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : users.map((user) => {
                  const isUserAdmin = ADMIN_EMAILS.includes(user.email);
                  const upgradeDate = user.planUpdatedAt ? new Date(user.planUpdatedAt.seconds * 1000) : null;
                  const expiryDate = upgradeDate ? addDays(upgradeDate, 30) : null;
                  return (
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
                      <TableCell>{getPlanBadge(user)}</TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>{upgradeDate ? format(upgradeDate, 'MMM d, yyyy') : 'N/A'}</TableCell>
                      <TableCell>{expiryDate ? format(expiryDate, 'MMM d, yyyy') : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        {!isUserAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Change Plan</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}>
                                <User className="mr-2 h-4 w-4" /> Set to Free
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'essentials')}>
                                <Trophy className="mr-2 h-4 w-4" /> Set to Essentials
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'pro')}>
                                <Crown className="mr-2 h-4 w-4" /> Set to Pro
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'recruiter')}>
                                <Handshake className="mr-2 h-4 w-4" /> Set to Recruiter
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
