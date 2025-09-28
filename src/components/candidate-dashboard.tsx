'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Contact, ExternalLink, Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

type CandidateStatus = 'New' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected';

interface Candidate {
  id: string;
  name: string;
  matchScore: number;
  skills: string[];
  status: CandidateStatus;
  resumeURL: string;
  addedAt: { seconds: number, nanoseconds: number };
  jobTitle: string;
}

export function CandidateDashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobTitleFilter, setJobTitleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'All'>('All');

  useEffect(() => {
    if (!userData?.teamId) {
      setIsLoading(false);
      return;
    }

    const candidatesRef = collection(db, `teams/${userData.teamId}/candidates`);
    
    const unsubscribe = onSnapshot(candidatesRef, (snapshot) => {
      const candidatesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
      setCandidates(candidatesData.sort((a,b) => b.addedAt.seconds - a.addedAt.seconds));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
    if (!userData?.teamId) return;
    const candidateRef = doc(db, `teams/${userData.teamId}/candidates`, candidateId);
    await updateDoc(candidateRef, { status: newStatus });
  };
  
  const getStatusBadgeVariant = (status: CandidateStatus) => {
    switch (status) {
        case 'New': return 'secondary';
        case 'Shortlisted': return 'default';
        case 'Interview': return 'secondary';
        case 'Hired': return 'default';
        case 'Rejected': return 'destructive';
        default: return 'outline';
    }
  };
  
  const filteredCandidates = candidates.filter(c => {
    const jobMatch = jobTitleFilter ? c.jobTitle.toLowerCase().includes(jobTitleFilter.toLowerCase()) : true;
    const statusMatch = statusFilter !== 'All' ? c.status === statusFilter : true;
    return jobMatch && statusMatch;
  });

  const uniqueJobTitles = [...new Set(candidates.map(c => c.jobTitle))];


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Contact /> Candidate Dashboard</CardTitle>
          <CardDescription>View, filter, and manage all candidates matched for your team's job openings.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Input 
                    placeholder="Filter by job title..."
                    value={jobTitleFilter}
                    onChange={(e) => setJobTitleFilter(e.target.value)}
                    className="max-w-xs"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full sm:w-auto">
                            <Filter className="mr-2 h-4 w-4"/>
                            Status: {statusFilter}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as CandidateStatus | 'All')}>
                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="New">New</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Shortlisted">Shortlisted</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Interview">Interview</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Hired">Hired</DropdownMenuRadioItem>
                             <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Resume</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </TableCell>
                    </TableRow>
                ) : filteredCandidates.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            No candidates found for the current filters.
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell>{candidate.jobTitle}</TableCell>
                        <TableCell>
                            <Badge variant={candidate.matchScore > 75 ? 'default' : candidate.matchScore > 50 ? 'secondary' : 'outline'}>
                                {candidate.matchScore.toFixed(0)}%
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Badge variant={getStatusBadgeVariant(candidate.status)} className="cursor-pointer">
                                        {candidate.status}
                                    </Badge>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuRadioGroup value={candidate.status} onValueChange={(v) => handleStatusChange(candidate.id, v as CandidateStatus)}>
                                        <DropdownMenuRadioItem value="New">New</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Shortlisted">Shortlisted</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Interview">Interview</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Hired">Hired</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(candidate.addedAt.seconds * 1000), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={candidate.resumeURL} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    