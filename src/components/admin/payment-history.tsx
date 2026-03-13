
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
import { Shield, History, ExternalLink, IndianRupee, Info, Tag } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  // Breakdown fields
  basePrice?: number;
  festiveDiscount?: number;
  promoDiscount?: number;
  appliedPromoCode?: string;
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
            description: 'Could not load payment history.',
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
      case 'pro': return 'secondary';
      case 'essentials': return 'secondary';
      case 'recruiter': return 'default';
      default: return 'outline';
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
                    <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Mixed</div>
                    <p className="text-xs text-muted-foreground mt-1">Manual & Webhook</p>
                </CardContent>
            </Card>
        </div>

        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><History /> Payment History & Breakdown</CardTitle>
            <CardDescription>View all historical payments. Click the info icon to see applied discounts.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Savings Info</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Proof</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading
                ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                    ))
                : users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">No records.</TableCell>
                    </TableRow>
                ) : users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={`https://placehold.co/100x100.png?text=${user.email[0].toUpperCase()}`} />
                                <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-xs">{user.email}</p>
                                <p className="text-[10px] text-muted-foreground font-mono">{user.id}</p>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getPlanBadgeVariant(user.plan)} className="text-[10px] h-5">
                                {user.plan === 'free' ? 'Legacy/Free' : user.plan}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                            ₹{user.amountPaid || 0}
                        </TableCell>
                        <TableCell>
                            {(user.festiveDiscount || user.promoDiscount) ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1">
                                            <Tag className="h-3 w-3 text-green-500" />
                                            View Savings
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-4 shadow-xl border-green-500/20">
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Price Breakdown</h4>
                                            <div className="flex justify-between text-sm">
                                                <span>Base Price:</span>
                                                <span className="font-medium">₹{user.basePrice || '---'}</span>
                                            </div>
                                            {user.festiveDiscount ? (
                                                <div className="flex justify-between text-sm text-green-600">
                                                    <span>Festive Sale:</span>
                                                    <span>-{user.festiveDiscount}%</span>
                                                </div>
                                            ) : null}
                                            {user.promoDiscount ? (
                                                <div className="flex justify-between text-sm text-blue-600">
                                                    <span>Promo ({user.appliedPromoCode}):</span>
                                                    <span>-{user.promoDiscount}%</span>
                                                </div>
                                            ) : null}
                                            <div className="border-t pt-2 flex justify-between font-bold text-primary">
                                                <span>Final Paid:</span>
                                                <span>₹{user.amountPaid}</span>
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                <span className="text-[10px] text-muted-foreground italic">No discounts</span>
                            )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {user.planUpdatedAt ? new Date(user.planUpdatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                            {user.paymentProofURL ? (
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                    <Link href={user.paymentProofURL} target="_blank"><ExternalLink className="h-3.5 w-3.5" /></Link>
                                </Button>
                            ) : <span className="text-[10px] text-muted-foreground">N/A</span>}
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
