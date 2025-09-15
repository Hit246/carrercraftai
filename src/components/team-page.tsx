'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Users2, UserPlus, Trash2, Crown, Loader2, Building } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, onSnapshot, doc, deleteDoc, getDoc, setDoc, query, writeBatch, updateDoc } from 'firebase/firestore';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

interface TeamMember {
  id: string;
  name?: string;
  email: string;
  role: 'Admin' | 'Member';
  uid?: string;
}

export function TeamPage() {
  const { toast } = useToast();
  const { plan, user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamOwner, setTeamOwner] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Effect to listen for team members once teamId is available
  useEffect(() => {
    if (!userData?.teamId) {
      if (plan === 'recruiter') {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    const teamId = userData.teamId;
    const teamRef = doc(db, 'teams', teamId);
    const membersRef = collection(db, `teams/${teamId}/members`);
    
    const unsubscribe = onSnapshot(query(membersRef), async (snapshot) => {
        const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
        
        try {
            const teamSnap = await getDoc(teamRef);
            if (!teamSnap.exists()) {
                setIsLoading(false);
                return;
            }
            const ownerId = teamSnap.data()?.owner;

            if (ownerId) {
                const ownerUserSnap = await getDoc(doc(db, 'users', ownerId));
                if (ownerUserSnap.exists()) {
                    const ownerData = ownerUserSnap.data();
                    const owner: TeamMember = {
                        id: ownerUserSnap.id,
                        uid: ownerUserSnap.id,
                        email: ownerData.email,
                        role: 'Admin',
                        name: ownerData.displayName || ownerData.email,
                    };
                    setTeamOwner(owner);
                    const allMembers = [owner, ...members.filter(m => m.email !== owner.email)];
                    setTeamMembers(allMembers);
                }
            } else {
                setTeamMembers(members);
                setTeamOwner(null);
            }
        } catch (error) {
            console.error("Error fetching team details:", error);
            toast({ title: "Error", description: "Could not load team details.", variant: "destructive"});
        } finally {
            setIsLoading(false);
        }
    });

    return () => unsubscribe();
  }, [userData, plan, toast]);

  const handleCreateTeam = async () => {
    if (authLoading || !user || plan !== 'recruiter') {
        return;
    }
    setIsCreatingTeam(true);
    try {
        const teamRef = await addDoc(collection(db, 'teams'), {
            owner: user.uid,
            createdAt: new Date(),
        });
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { teamId: teamRef.id });
        
        toast({ title: "Team Created!", description: "You can now start inviting members."});
        // The userData update will trigger the useEffect to fetch members
    } catch (error) {
        console.error("Failed to create team:", error);
        toast({ title: "Error", description: "Could not create your team. Please refresh and try again.", variant: "destructive"});
    } finally {
        setIsCreatingTeam(false);
    }
  }


  if (plan !== 'recruiter' && !authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
         <Alert variant="pro" className="max-w-lg">
            <Crown />
            <AlertTitle>This is a Recruiter Feature</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
                <span>Upgrade to the Recruiter plan to access Team Management.</span>
                <Button onClick={() => router.push('/pricing')} size="sm">Upgrade Now</Button>
            </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!userData?.teamId && plan === 'recruiter') {
     return (
        <div className="flex h-full items-center justify-center">
            <Card className="max-w-lg text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center justify-center gap-2">
                        <Building className="text-primary"/>
                        Create Your Team
                    </CardTitle>
                    <CardDescription>
                        To start managing members, you first need to create your team.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleCreateTeam} disabled={isCreatingTeam}>
                        {isCreatingTeam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Team
                    </Button>
                </CardContent>
            </Card>
        </div>
     )
  }

  async function onInvite(values: z.infer<typeof formSchema>) {
    if (!userData?.teamId || !user || !teamOwner || user.uid !== teamOwner.uid) {
        toast({
            title: "Permission Denied",
            description: "Only the team owner can invite new members.",
            variant: "destructive"
        });
        return;
    }

    const isAlreadyMember = teamMembers.some(member => member.email === values.email);
    if(isAlreadyMember) {
        toast({
            title: "Member Already Exists",
            description: `${values.email} is already part of your team.`,
            variant: "destructive"
        });
        return;
    }

    try {
        const newMemberRef = doc(collection(db, `teams/${userData.teamId}/members`));
        await setDoc(newMemberRef, {
            email: values.email,
            role: 'Member',
            addedBy: user.email,
        });

        toast({
        title: "Invitation Sent!",
        description: `An invitation has been sent to ${values.email}. They will have access once they sign up with this email.`,
        });
        form.reset();
    } catch (error) {
        console.error("Error inviting member:", error);
        toast({
            title: "Error inviting member",
            description: "There was a problem inviting the new member. Please try again.",
            variant: "destructive"
          });
    }
  }

  async function onRemove(id: string) {
    if (!userData?.teamId) return;
    try {
        await deleteDoc(doc(db, `teams/${userData.teamId}/members`, id));
        toast({
            title: "Member Removed",
            description: "The team member has been removed successfully.",
          });
    } catch {
        toast({
            title: "Error",
            description: "Failed to remove the team member.",
            variant: "destructive"
          });
    }
  }

  return (
    <div className="space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users2/> Team Members</CardTitle>
                        <CardDescription>Manage your team and their access.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Loading team members...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : teamMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://placehold.co/100x100.png?text=${member.email[0]}`} data-ai-hint="avatar placeholder" />
                                                <AvatarFallback>{member.email[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name || member.email}</p>
                                                {!member.uid && <p className="text-sm text-muted-foreground">Invited</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {member.role !== 'Admin' && (
                                            <Button variant="ghost" size="icon" onClick={() => onRemove(member.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserPlus /> Invite New Member</CardTitle>
                        <CardDescription>Enter an email to invite a new member to your team.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                                <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="new.member@example.com" {...field} disabled={isLoading || !teamOwner || user?.uid !== teamOwner?.uid} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" className="w-full" disabled={isLoading || !teamOwner || user?.uid !== teamOwner?.uid}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Send Invitation'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
