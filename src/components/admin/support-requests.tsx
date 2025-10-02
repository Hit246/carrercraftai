
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
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
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

interface SupportRequest {
  id: string;
  userEmail: string;
  subject: string;
  message: string;
  category: 'billing' | 'technical' | 'feedback' | 'other';
  status: 'open' | 'closed';
  createdAt: { seconds: number, nanoseconds: number };
}

export function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRequests = () => {
      setIsLoading(true);
      const requestsCollectionRef = collection(db, 'supportRequests');
      const q = query(requestsCollectionRef, orderBy('createdAt', 'desc'));
      
      getDocs(q)
        .then((requestsSnapshot) => {
            const requestsList = requestsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupportRequest));
            setRequests(requestsList);
        })
        .catch((serverError) => {
             // This is a generic error, so we assume it might be a permission issue.
             // We create a contextual error to help with debugging.
             const permissionError = new FirestorePermissionError({
                path: requestsCollectionRef.path,
                operation: 'list',
             }, serverError);
             errorEmitter.emit('permission-error', permissionError);

             // Also inform the user in the UI, as the listener is for dev debugging.
             toast({
                title: 'Error Fetching Support Requests',
                description: 'You may not have permission to view this data. Check the console for details.',
                variant: 'destructive',
             });
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    fetchRequests();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>Review and manage all user-submitted support requests.</CardDescription>
      </CardHeader>
      <CardContent>
         <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className='w-[250px]'>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-[120px]">Category</TableHead>
                <TableHead className="w-[150px] text-right">Submitted</TableHead>
                </TableRow>
            </TableHeader>
             <TableBody>
                {isLoading ? (
                    [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                        </TableRow>
                    ))
                ) : requests.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    No support requests found.
                    </TableCell>
                </TableRow>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {requests.map((request) => (
                            <AccordionItem value={request.id} key={request.id}>
                                <TableRow className="w-full cursor-pointer hover:bg-muted/50">
                                    <AccordionTrigger asChild>
                                        <>
                                            <TableCell className='font-medium truncate pr-4'>{request.userEmail}</TableCell>
                                            <TableCell className='text-muted-foreground truncate pr-4'>{request.subject}</TableCell>
                                            <TableCell className='text-muted-foreground'> <Badge variant="secondary">{request.category}</Badge></TableCell>
                                            <TableCell className='text-muted-foreground text-right pr-4'>
                                                {formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true })}
                                            </TableCell>
                                        </>
                                    </AccordionTrigger>
                                </TableRow>
                                <AccordionContent asChild>
                                   <tr className='bg-muted/40'>
                                        <td colSpan={4} className='p-4'>
                                             <p className='text-muted-foreground'>{request.message}</p>
                                        </td>
                                   </tr>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </TableBody>
            </Table>
         </div>
      </CardContent>
    </Card>
  );
}
