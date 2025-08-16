'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Users2, UserPlus, Trash2, Crown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
}

const initialTeamMembers: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob Williams', email: 'bob@example.com', role: 'Member' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'Member' },
];

export function TeamPage() {
  const { toast } = useToast();
  const { plan, user } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);

  useEffect(() => {
    if (plan !== 'recruiter') {
        router.push('/pricing');
    }
  }, [plan, router]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  if (plan !== 'recruiter') {
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

  function onInvite(values: z.infer<typeof formSchema>) {
    toast({
      title: "Invitation Sent!",
      description: `An invitation has been sent to ${values.email}.`,
    });
    // In a real app, this would trigger an email and update the database.
    // For this prototype, we'll just add them to the list with a temporary name.
    const newMember: TeamMember = {
        id: Date.now(),
        name: `Invited User`,
        email: values.email,
        role: 'Member'
    }
    setTeamMembers(prev => [...prev, newMember]);
    form.reset();
  }

  function onRemove(id: number) {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    toast({
        title: "Member Removed",
        description: "The team member has been removed successfully.",
        variant: "destructive"
      });
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
                                {teamMembers.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://placehold.co/100x100.png?text=${member.name[0]}`} data-ai-hint="avatar placeholder" />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.role === 'Admin' ? 'default' : 'secondary'}>
                                            {member.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {member.email !== user?.email && (
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
                                        <Input type="email" placeholder="new.member@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <Button type="submit" className="w-full">
                                    Send Invitation
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
