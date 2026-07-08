'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
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
import { Shield, History, ExternalLink, IndianRupee, Info, Tag, Edit2, Loader2, Save } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type Plan = 'free' | 'essentials' | 'pro' | 'recruiter' | 'pending' | 'cancellation_requested';

interface UserData {
  id: string;
  email: string;
  plan: Plan;
  photoURL?: string;
  createdAt?: { seconds: number };
  planUpdatedAt?: { seconds: number };
  paymentProofURL?: string;
  webhookVerified?: boolean;
  amountPaid?: number;
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

  // Edit State
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleUpdatePayment = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', editingUser.id);
      const updateData = {
        amountPaid: Number(editingUser.amountPaid) || 0,
        basePrice: Number(editingUser.basePrice) || 0,
        festiveDiscount: Number(editingUser.festiveDiscount) || 0,
        promoDiscount: Number(editingUser.promoDiscount) || 0,
        appliedPromoCode: editingUser.appliedPromoCode || null,
      };
      
      await updateDoc(userRef, updateData);
      toast({ title: 'Record Updated', description: `Payment details for ${editingUser.email} saved.` });
      setEditingUser(null);
      fetchUsers();
    } catch (e) {
      toast({ title: 'Save Failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

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
                    <div className="text-2xl font-bold">Verified</div>
                    <p className="text-xs text-muted-foreground mt-1">System & Manual</p>
                </CardContent>
            </Card>
        </div>

        <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><History /> Payment History & Ledger</CardTitle>
            <CardDescription>View and edit transaction details. Click 'Edit' to adjust amounts or discounts.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Savings Info</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Proof</TableHead>
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
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                    ))
                : users.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">No payment records found.</TableCell>
                    </TableRow>
                ) : users.map((user) => {
                    const hasDiscounts = (user.festiveDiscount && user.festiveDiscount > 0) || (user.promoDiscount && user.promoDiscount > 0);
                    return (
                    <TableRow key={user.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="font-bold text-xs truncate max-w-[120px]" title={user.email}>{user.email}</p>
                                <p className="text-[9px] text-muted-foreground font-mono">{user.id}</p>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getPlanBadgeVariant(user.plan)} className="text-[9px] h-5 font-black uppercase">
                                {user.plan}
                            </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                            ₹{user.amountPaid || 0}
                        </TableCell>
                        <TableCell>
                            {hasDiscounts ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 bg-green-500/5 text-green-600 hover:bg-green-500/10 border border-green-500/10">
                                            <Tag className="h-3 w-3" />
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
                        <TableCell className="text-[10px] font-bold text-muted-foreground uppercase">
                            {user.planUpdatedAt ? new Date(user.planUpdatedAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                        </TableCell>
                        <TableCell>
                            {user.paymentProofURL ? (
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/5">
                                    <Link href={user.paymentProofURL} target="_blank"><ExternalLink className="h-3.5 w-3.5 text-primary" /></Link>
                                </Button>
                            ) : <span className="text-[10px] text-muted-foreground">---</span>}
                        </TableCell>
                        <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="h-8 px-2 text-[10px] font-black uppercase tracking-tighter" onClick={() => setEditingUser(user)}>
                                <Edit2 className="h-3 w-3 mr-1" /> Edit
                            </Button>
                        </TableCell>
                    </TableRow>
                    )})}
            </TableBody>
            </Table>
        </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Payment Record</DialogTitle>
                    <DialogDescription>Adjust financial details for {editingUser?.email}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-black">Amount Paid (₹)</Label>
                            <Input 
                                type="number" 
                                value={editingUser?.amountPaid ?? ''} 
                                onChange={(e) => setEditingUser(prev => prev ? {...prev, amountPaid: parseInt(e.target.value) || 0} : null)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-black">Base Price (₹)</Label>
                            <Input 
                                type="number" 
                                value={editingUser?.basePrice ?? ''} 
                                onChange={(e) => setEditingUser(prev => prev ? {...prev, basePrice: parseInt(e.target.value) || 0} : null)} 
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-black">Festive Discount (%)</Label>
                            <Input 
                                type="number" 
                                value={editingUser?.festiveDiscount ?? ''} 
                                onChange={(e) => setEditingUser(prev => prev ? {...prev, festiveDiscount: parseInt(e.target.value) || 0} : null)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-black">Promo Discount (%)</Label>
                            <Input 
                                type="number" 
                                value={editingUser?.promoDiscount ?? ''} 
                                onChange={(e) => setEditingUser(prev => prev ? {...prev, promoDiscount: parseInt(e.target.value) || 0} : null)} 
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs uppercase font-black">Applied Promo Code</Label>
                        <Input 
                            value={editingUser?.appliedPromoCode ?? ''} 
                            placeholder="e.g. SAVE50"
                            onChange={(e) => setEditingUser(prev => prev ? {...prev, appliedPromoCode: e.target.value.toUpperCase()} : null)} 
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Button>
                    <Button onClick={handleUpdatePayment} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
