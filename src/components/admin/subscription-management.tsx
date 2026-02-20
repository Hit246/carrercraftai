
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
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
import { MoreHorizontal, CreditCard, Calendar, User, Crown, Trophy, Handshake, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { format, addDays, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserData {
  id: string;
  email: string;
  displayName?: string;
  plan: Plan;
  planUpdatedAt?: { seconds: number };
  createdAt?: { seconds: number };
  paymentProofURL?: string;
}

const ADMIN_EMAILS = ['admin@careercraft.ai', 'hitarth0236@gmail.com'];

export function SubscriptionManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, orderBy('planUpdatedAt', 'desc'));
      const usersSnapshot = await getDocs(q);
      const usersList = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as UserData));
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription data.',
        variant: 'destructive',
      });
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
      await updateDoc(userRef, {
        plan: newPlan,
        planUpdatedAt: new Date(),
      });
      toast({
        title: 'Role Updated',
        description: `User role changed to ${newPlan}.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    }
  };

  const getPlanBadge = (plan: Plan) => {
    switch (plan) {
      case 'pro':
        return <Badge className="bg-amber-500 hover:bg-amber-600"><Crown className="w-3 h-3 mr-1" /> Pro</Badge>;
      case 'essentials':
        return <Badge variant="secondary"><Trophy className="w-3 h-3 mr-1" /> Essentials</Badge>;
      case 'recruiter':
        return <Badge variant="default"><Handshake className="w-3 h-3 mr-1" /> Recruiter</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>;
      case 'cancellation_requested':
        return <Badge variant="destructive">Cancelling</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getExpiryInfo = (user: UserData) => {
    if (!user.planUpdatedAt || user.plan === 'free' || user.plan === 'pending') return null;
    
    const purchaseDate = new Date(user.planUpdatedAt.seconds * 1000);
    const expiryDate = addDays(purchaseDate, 30);
    const daysLeft = differenceInDays(expiryDate, new Date());
    
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (daysLeft < 0) status = 'expired';
    else if (daysLeft <= 7) status = 'expiring';
    
    return { purchaseDate, expiryDate, daysLeft, status };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Subscription Management
        </CardTitle>
        <CardDescription>
          View and manage user subscriptions, track billing cycles, and manually override roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Plan</TableHead>
                <TableHead>Billing Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Proof</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map((user) => {
                  const expiryInfo = getExpiryInfo(user);
                  const isUserAdmin = ADMIN_EMAILS.includes(user.email);

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://placehold.co/100x100.png?text=${user.email[0].toUpperCase()}`} />
                            <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm flex items-center gap-1">
                              {user.email}
                              {isUserAdmin && <Shield className="w-3 h-3 text-primary" />}
                            </span>
                            <span className="text-xs text-muted-foreground">{user.displayName || 'No name'}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getPlanBadge(user.plan)}</TableCell>
                      <TableCell>
                        {expiryInfo ? (
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Paid: {format(expiryInfo.purchaseDate, 'MMM d, yyyy')}</div>
                            <div className="flex items-center gap-1 text-muted-foreground"><AlertTriangle className="w-3 h-3" /> Ends: {format(expiryInfo.expiryDate, 'MMM d, yyyy')}</div>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {expiryInfo ? (
                          <div className="flex items-center gap-2">
                            {expiryInfo.status === 'active' && (
                              <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                            )}
                            {expiryInfo.status === 'expiring' && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="text-orange-500 border-orange-500 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Expires Soon
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>{expiryInfo.daysLeft} days remaining</TooltipContent>
                              </Tooltip>
                            )}
                            {expiryInfo.status === 'expired' && (
                              <Badge variant="destructive">Expired</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.paymentProofURL ? (
                          <Button asChild variant="outline" size="sm" className="h-8">
                            <Link href={user.paymentProofURL} target="_blank">
                              <ExternalLink className="w-3 h-3 mr-2" /> View Proof
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!isUserAdmin && (
                          <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')}>
                                <User className="w-4 h-4 mr-2" /> Free
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'essentials')}>
                                <Trophy className="w-4 h-4 mr-2" /> Essentials
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'pro')}>
                                <Crown className="w-4 h-4 mr-2" /> Pro
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'recruiter')}>
                                <Handshake className="w-4 h-4 mr-2" /> Recruiter
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
