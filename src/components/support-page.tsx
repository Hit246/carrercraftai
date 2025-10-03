
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Send, Loader2, MessageSquare, History, ChevronLeft } from 'lucide-react';
import { submitSupportRequestAction, replyToSupportRequestAction } from '@/lib/actions';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import type { SupportRequestInput, ReplySupportRequestInput } from '@/lib/types';


interface HistoryItem {
  id: string;
  message: string;
  sender: 'user' | 'admin';
  timestamp: { seconds: number; nanoseconds: number };
}

interface SupportRequest {
  id: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  lastMessageAt: { seconds: number; nanoseconds: number };
  history: HistoryItem[];
}

const formSchema = z.object({
  subject: z.string().min(5),
  message: z.string().min(20),
  category: z.enum(['billing', 'technical', 'feedback', 'other']),
});

type FormValues = z.infer<typeof formSchema>;

export function SupportPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { subject: '', message: '', category: 'technical' },
  });

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const q = query(collection(db, 'supportRequests'), where('userId', '==', user.uid), orderBy('lastMessageAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupportRequest)));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user]);
  
  useEffect(() => {
    if (!selectedRequest?.id) return;
    const historyRef = collection(db, 'supportRequests', selectedRequest.id, 'history');
    const q = query(historyRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem));
      setSelectedRequest(prev => prev ? { ...prev, history } : null);
    });
    return () => unsubscribe();
  }, [selectedRequest?.id]);


  async function onSubmit(values: FormValues) {
    if (!user || !user.email) {
      toast({ title: 'Not Authenticated', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      await submitSupportRequestAction({ ...values, userEmail: user.email, userId: user.uid });
      toast({ title: "Support Request Sent!", description: "We'll get back to you shortly." });
      form.reset();
    } catch (error) {
      toast({ title: 'Submission Failed', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReply = async () => {
    if (!selectedRequest || !replyMessage.trim()) return;
    setIsReplying(true);
    await replyToSupportRequestAction({ requestId: selectedRequest.id, message: replyMessage, sender: 'user' });
    setReplyMessage('');
    setIsReplying(false);
  }

  const getStatusBadge = (status: SupportRequest['status']) => {
    switch (status) {
      case 'open': return <Badge variant="destructive">Open</Badge>;
      case 'in-progress': return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'closed': return <Badge variant="secondary">Closed</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
        {selectedRequest ? (
             <Card className="md:col-span-3 flex flex-col">
                 <CardHeader className="border-b flex-row items-center gap-4 space-y-0">
                     <Button variant="ghost" size="icon" onClick={() => setSelectedRequest(null)}><ChevronLeft/></Button>
                     <div>
                        <CardTitle>{selectedRequest.subject}</CardTitle>
                        <CardDescription>Status: {getStatusBadge(selectedRequest.status)}</CardDescription>
                     </div>
                 </CardHeader>
                 <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                        {!selectedRequest.history ? (
                             <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="animate-spin mr-2"/>Loading history...</div>
                        ) : selectedRequest.history.map(item => (
                            <div key={item.id} className={cn('flex items-end gap-2', item.sender === 'user' && 'justify-end')}>
                                {item.sender === 'admin' && <Avatar className="h-8 w-8"><AvatarFallback>A</AvatarFallback></Avatar>}
                                <div className={cn('max-w-xs md:max-w-md rounded-lg p-3 text-sm', item.sender === 'admin' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                                    <p className="whitespace-pre-wrap">{item.message}</p>
                                    <p className="text-xs opacity-70 mt-2 text-right">{formatDistanceToNow(new Date(item.timestamp.seconds * 1000), { addSuffix: true })}</p>
                                </div>
                                {item.sender === 'user' && <Avatar className="h-8 w-8"><AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback></Avatar>}
                            </div>
                        ))}
                    </div>
                 </ScrollArea>
                 {selectedRequest.status !== 'closed' && (
                    <CardContent className="pt-4 border-t">
                        <div className="relative">
                            <Textarea placeholder="Type your reply..." className="pr-16" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} />
                            <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={handleReply} disabled={isReplying || !replyMessage.trim()}>
                            {isReplying ? <Loader2 className="animate-spin" /> : <Send />}
                            </Button>
                        </div>
                    </CardContent>
                 )}
             </Card>
        ) : (
        <>
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Send /> Submit a New Request</CardTitle>
                        <CardDescription>Fill out the form below to create a new support ticket.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="subject" render={({ field }) => ( <FormItem> <FormLabel>Subject</FormLabel> <FormControl> <Input placeholder="e.g., Issue with resume analysis" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="billing">Billing</SelectItem>
                                                <SelectItem value="technical">Technical Issue</SelectItem>
                                                <SelectItem value="feedback">Feedback</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField control={form.control} name="message" render={({ field }) => ( <FormItem> <FormLabel>Your Message</FormLabel> <FormControl> <Textarea placeholder="Please describe your issue or question in detail..." className="h-40 resize-y" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Message
                        </Button>
                        </form>
                    </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><History/> Ticket History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                         <ScrollArea className="h-96">
                            {isLoading && [...Array(3)].map((_, i) => <div key={i} className="p-4"><Skeleton className="h-10 w-full"/></div>)}
                            {!isLoading && requests.length === 0 && <p className="text-center text-muted-foreground p-4">No past tickets found.</p>}
                            {requests.map(req => (
                                <button key={req.id} onClick={() => setSelectedRequest(req)} className="block w-full text-left p-4 border-t hover:bg-muted/50">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate">{req.subject}</p>
                                        {getStatusBadge(req.status)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(req.lastMessageAt.seconds * 1000), { addSuffix: true })}</p>
                                </button>
                            ))}
                         </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </>
        )}
    </div>
  );
}

    