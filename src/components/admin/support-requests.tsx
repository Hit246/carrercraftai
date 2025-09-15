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

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const requestsCollectionRef = collection(db, 'supportRequests');
        const q = query(requestsCollectionRef, orderBy('createdAt', 'desc'));
        const requestsSnapshot = await getDocs(q);
        const requestsList = requestsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SupportRequest));
        setRequests(requestsList);
      } catch (error) {
        console.error("Error fetching support requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>Review and manage all user-submitted support requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-[250px]'>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[150px] text-right">Submitted</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        {isLoading ? (
          <div className="space-y-2 p-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center p-10 text-muted-foreground">
            No support requests found.
          </div>
        ) : (
            <Accordion type="single" collapsible className="w-full">
            {requests.map((request) => (
                <AccordionItem value={request.id} key={request.id} className='border-b'>
                    <AccordionTrigger className='p-4 hover:no-underline hover:bg-muted/50'>
                        <div className='grid grid-cols-4 w-full text-sm text-left items-center'>
                            <div className='col-span-1 font-medium truncate pr-4'>{request.userEmail}</div>
                            <div className='col-span-1 text-muted-foreground truncate pr-4'>{request.subject}</div>
                            <div className='col-span-1 text-muted-foreground'> <Badge variant="secondary">{request.category}</Badge></div>
                            <div className='col-span-1 text-muted-foreground text-right pr-4'>
                                {formatDistanceToNow(new Date(request.createdAt.seconds * 1000), { addSuffix: true })}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-muted/20'>
                        <p className='text-muted-foreground'>{request.message}</p>
                    </AccordionContent>
                </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
