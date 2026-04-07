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
import { MoreHorizontal, Trash2, Crown, User, Shield, Trophy, Handshake, AlertCircle, Loader2, Calendar, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { differenceInDays, addDays, format } from 'date-fns';
import { Input } from '../ui/input';
import { deleteUserAccountAction } from '@/lib/actions';
import { cn } from '@/lib/utils';

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

const ADMIN_EMAILS = ['support@careercraftai.tech', 'hello@careercraftai.tech', 'hitarth0236@gmail.com'];

export function UserManagementPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

      const updateData: any = { plan: newPlan };

      if (['essentials', 'pro', 'recruiter'].includes(newPlan)) {
          updateData.planUpdatedAt = new Date();
          updateData.amountPaid = amountPaid;
          updateData.credits = newPlan === 'essentials' ? increment(50) : 999999;
      } else if (newPlan === 'free') {
          updateData.credits = 5;
      }
      
      await updateDoc(userRef, { ...updateData, requestedPlan: null });
      toast({ title: 'System Access Updated', description: `User role changed to ${newPlan}.` });
      fetchUsers();
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeletingId(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      await deleteUserAccountAction(userId);
      toast({ title: 'User Purged Successfully' });
      fetchUsers(); 
    } catch (error) {
      toast({ title: 'Deletion Error', variant: 'destructive' });
    } finally {
        setIsDeletingId(null);
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const getPlanStyle = (plan: Plan) => {
    switch (plan) {
      case 'essentials': return "bg-blue-500/10 text-blue-500 border-none font-black uppercase text-[10px]";
      case 'pro': return "bg-amber-500/10 text-amber-500 border-none font-black uppercase text-[10px]";
      case 'recruiter': return "bg-indigo-500/10 text-indigo-500 border-none font-black uppercase text-[10px]";
      case 'pending': return "bg-red-500/10 text-red-500 border-none animate-pulse font-black uppercase text-[10px]";
      default: return "bg-muted/50 text-muted-foreground border-none font-black uppercase text-[10px]";
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter by email..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="h-11 pl-10 rounded-xl bg-card/50 border-white/5"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-8 border-white/10 text-muted-foreground">{filteredUsers.length} total objects</Badge>
        </div>
      </div>

      <Card className="border-white/5 bg-card/50 shadow-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/[0.02]">
            <TableRow className="border-white/5">
              <TableHead className="py-4">Account Holder</TableHead>
              <TableHead>Access Level</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Ops</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell colSpan={5} className="py-6"><Skeleton className="h-8 w-full rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.map((user) => {
              const isUserAdmin = ADMIN_EMAILS.includes(user.email);
              return (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.01]">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black uppercase">
                          {user.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate flex items-center gap-2">
                          {user.email}
                          {isUserAdmin && <Shield className="h-3 w-3 text-red-500" />}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">{user.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanStyle(user.plan)}>
                      {user.plan === 'pending' ? `Pending ${user.requestedPlan}` : user.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-muted-foreground capitalize">
                      {user.billingCycle || '---'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {user.createdAt ? format(new Date(user.createdAt.seconds * 1000), 'MMM dd, yy') : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {!isUserAdmin && (
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild disabled={isDeletingId === user.id}>
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9">
                              {isDeletingId === user.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <MoreHorizontal className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground tracking-widest px-2 pb-2">Change Role</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'free')} className="rounded-lg gap-3">
                              <User className="h-4 w-4 text-muted-foreground" /> Free
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'essentials')} className="rounded-lg gap-3">
                              <Trophy className="h-4 w-4 text-blue-500" /> Essentials
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'pro')} className="rounded-lg gap-3">
                              <Crown className="h-4 w-4 text-amber-500" /> Pro
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePlanChange(user.id, 'recruiter')} className="rounded-lg gap-3">
                              <Handshake className="h-4 w-4 text-indigo-500" /> Recruiter
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="rounded-lg gap-3 text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                <Trash2 className="h-4 w-4" /> Terminate Account
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent className="rounded-3xl border-white/10 bg-[#111118]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-headline">Purge Subject?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              This will permanently erase all user data, including resumes and payment history. This action is logged and irreversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="rounded-xl border-white/5">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="rounded-xl bg-red-500 hover:bg-red-600 font-bold">Purge User</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
