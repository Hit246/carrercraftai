'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, UserCheck, Building, MoreVertical, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { User } from 'firebase/auth';
import { deleteTeamAction } from '@/lib/actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';


interface TeamMember {
  id: string;
  email: string;
  role: 'Admin' | 'Member';
  user?: UserData; // This will be populated with data from the 'users' collection
}

interface UserData {
  id: string;
  email: string;
  plan: string;
  teamId?: string;
}

interface Team {
  id: string;
  owner: UserData | null;
  members: TeamMember[];
}

export function TeamsManagementPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTeamsData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch all teams
      const teamsSnapshot = await getDocs(collection(db, 'teams'));
      const teamDocs = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as { owner: string }) }));

      // 2. Gather all unique user IDs and emails needed
      const ownerIds = teamDocs.map(t => t.owner);
      let allMemberEmails: string[] = [];

      const memberPromises = teamDocs.map(async teamDoc => {
        const membersSnapshot = await getDocs(collection(db, `teams/${teamDoc.id}/members`));
        return membersSnapshot.docs.map(memberDoc => {
            const data = memberDoc.data();
            allMemberEmails.push(data.email);
            return { id: memberDoc.id, ...data } as TeamMember;
        });
      });
      
      const allMembersNested = await Promise.all(memberPromises);
      allMemberEmails = [...new Set(allMemberEmails)];

      // 3. Fetch all required user documents in batches
      const allUsersMap = new Map<string, UserData>();

      // Fetch owners by ID
      if (ownerIds.length > 0) {
        const ownerDocs = await Promise.all(ownerIds.map(id => getDoc(doc(db, 'users', id))));
        ownerDocs.forEach(docSnap => {
          if (docSnap.exists()) {
            allUsersMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() } as UserData);
          }
        });
      }
      
      // Fetch members by email
      if (allMemberEmails.length > 0) {
        const emailBatches: string[][] = [];
        for (let i = 0; i < allMemberEmails.length; i += 30) {
          emailBatches.push(allMemberEmails.slice(i, i + 30));
        }

        for (const batch of emailBatches) {
          const q = query(collection(db, 'users'), where('email', 'in', batch));
          const usersSnapshot = await getDocs(q);
          usersSnapshot.forEach(userDoc => {
            allUsersMap.set(userDoc.id, { id: userDoc.id, ...userDoc.data() } as UserData);
          });
        }
      }
      
      const usersByEmail = new Map(Array.from(allUsersMap.values()).map(u => [u.email, u]));

      // 4. Structure the final data
      const finalTeamsData: Team[] = teamDocs.map((teamDoc, index) => {
        const members = allMembersNested[index];
        const owner = allUsersMap.get(teamDoc.owner) || null;

        const populatedMembers = members.map(member => {
            const user = usersByEmail.get(member.email);
            return { ...member, user };
        });

        return {
          id: teamDoc.id,
          owner: owner,
          members: populatedMembers
        };
      });

      setTeams(finalTeamsData);

    } catch (error) {
      console.error("Error fetching teams data: ", error);
      toast({ title: 'Error', description: 'Could not fetch teams data. You may need to create a Firestore index.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTeamsData();
  }, [fetchTeamsData]);

  const handleApprove = async (user: UserData, teamId: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        plan: 'recruiter',
        teamId: teamId,
      });
      toast({
        title: 'Member Approved',
        description: `${user.email} is now an active team member.`,
      });
      fetchTeamsData(); // Refresh data
    } catch (error) {
        console.error("Error approving member: ", error);
        toast({ title: 'Error', description: 'Could not approve member.', variant: 'destructive' });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    setIsDeleting(teamId);
    const result = await deleteTeamAction(teamId);
    if (result.success) {
        toast({ title: 'Team Deleted', description: 'The team and all its members have been removed.' });
        fetchTeamsData(); // re-fetch
    } else {
        toast({ title: 'Error', description: result.error || 'Failed to delete team.', variant: 'destructive' });
    }
    setIsDeleting(null);
};


  if (isLoading) {
    return (
        <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                           <Skeleton className="h-8 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Building />
                  Teams Management
              </CardTitle>
              <CardDescription>
                  Oversee all teams and approve pending member invitations.
              </CardDescription>
          </CardHeader>
      </Card>
      
      {teams.length === 0 && <Card><CardContent className="p-6 text-center text-muted-foreground">No teams found.</CardContent></Card>}

      {teams.map(team => (
        <Card key={team.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">Team Owner: {team.owner?.email || 'Unknown'}</CardTitle>
                    <CardDescription>Team ID: {team.id}</CardDescription>
                </div>
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isDeleting === team.id}>
                                {isDeleting === team.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Team
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the team, remove all its members, and downgrade their plans to 'Free'. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTeam(team.id)} className="bg-destructive hover:bg-destructive/90">
                            Confirm Deletion
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.members.map(member => {
                    const status = member.user 
                        ? (member.user.plan === 'recruiter' && member.user.teamId === team.id ? 'Active' : 'Pending Approval') 
                        : 'Invited';
                    
                    return (
                        <TableRow key={member.id}>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                                {status === 'Active' && <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>}
                                {status === 'Pending Approval' && <Badge variant="destructive">Pending Approval</Badge>}
                                {status === 'Invited' && <Badge variant="outline">Invited</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                                {status === 'Pending Approval' && member.user && (
                                    <Button size="sm" onClick={() => handleApprove(member.user!, team.id)}>
                                        <UserCheck className="mr-2 h-4 w-4"/>
                                        Approve
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
