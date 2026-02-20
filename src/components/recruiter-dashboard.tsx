'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Users, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShortlistedCandidate {
    id: string;
    name: string;
    matchScore: number;
    justification: string;
    jobTitle: string;
    shortlistedAt: { seconds: number; nanoseconds: number } | null;
}

export function RecruiterDashboard() {
    const { user, plan } = useAuth();
    const { toast } = useToast();
    const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || plan !== 'recruiter') return;

        const shortlistRef = collection(db, `users/${user.uid}/shortlistedCandidates`);
        const q = query(shortlistRef, orderBy('shortlistedAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShortlistedCandidate));
            setCandidates(list);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching shortlisted candidates:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, plan]);

    const handleRemove = async (id: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, `users/${user.uid}/shortlistedCandidates`, id));
            toast({ title: "Removed", description: "Candidate removed from your shortlist." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove candidate.", variant: "destructive" });
        }
    }

    if (plan !== 'recruiter') {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-headline font-bold">Recruiter Dashboard</h2>
                <p className="text-muted-foreground mt-2 max-w-md">This dashboard is only available for Recruiter plans. It allows you to manage candidates you've shortlisted during the matching process.</p>
                <Button className="mt-6" asChild>
                    <a href="/pricing">View Plans</a>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline flex items-center gap-2">
                        <Users className="text-primary"/> Recruiter Dashboard
                    </CardTitle>
                    <CardDescription>
                        Manage and track all the candidates you have shortlisted for your open roles.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Job Role</TableHead>
                                <TableHead>Match Score</TableHead>
                                <TableHead className="hidden md:table-cell">Shortlisted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : candidates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No candidates shortlisted yet. Use the Candidate Matcher to find and add talent.
                                    </TableCell>
                                </TableRow>
                            ) : candidates.map((candidate) => (
                                <TableRow key={candidate.id}>
                                    <TableCell className="font-medium truncate max-w-[150px]" title={candidate.name}>
                                        {candidate.name}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {candidate.jobTitle || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={candidate.matchScore > 75 ? 'default' : candidate.matchScore > 50 ? 'secondary' : 'outline'}>
                                            {candidate.matchScore}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                        {candidate.shortlistedAt ? formatDistanceToNow(new Date(candidate.shortlistedAt.seconds * 1000), { addSuffix: true }) : 'Recently'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="max-w-xs">
                                                        <p className="font-semibold mb-1">AI Justification:</p>
                                                        <p className="text-xs">{candidate.justification}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemove(candidate.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
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
