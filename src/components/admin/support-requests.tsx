

'use client';

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { replyToSupportRequestAction } from '@/lib/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface HistoryItem {
  id: string;
  message: string;
  sender: 'user' | 'admin';
  timestamp: { seconds: number; nanoseconds: number };
}

interface SupportRequest {
  id: string;
  userEmail: string;
  subject: string;
  category: 'billing' | 'technical' | 'feedback' | 'other';
  status: 'open' | 'in-progress' | 'closed';
  lastMessageAt: { seconds: number; nanoseconds: number };
  history: HistoryItem[];
}

const isCode = (text: string) => {
    return text.includes('import ') || text.includes('function ') || text.includes('const ') || text.includes(';') || text.includes('{') || text.includes('}');
}

const MessageContent = ({ text }: { text: string }) => {
    if (isCode(text)) {
        return (
            <pre className="text-xs bg-black/80 text-white p-3 rounded-md overflow-x-auto">
                <code>{text}</code>
            </pre>
        )
    }
    return <p className="whitespace-pre-wrap">{text}</p>;
}

export function SupportRequestsPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const requestsCollectionRef = collection(db, 'supportRequests');
    const q = query(requestsCollectionRef, orderBy('lastMessageAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requestsList: SupportRequest[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        history: [],
      } as SupportRequest));
      setRequests(requestsList);
      setIsLoading(false);
    }, (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: requestsCollectionRef.path,
        operation: 'list',
      }, serverError);
      errorEmitter.emit('permission-error', permissionError);
      toast({
        title: 'Error Fetching Support Requests',
        description: 'You may not have permission to view this data.',
        variant: 'destructive',
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!selectedRequest) return;

    const historyRef = collection(db, 'supportRequests', selectedRequest.id, 'history');
    const q = query(historyRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryItem));
      setSelectedRequest(prev => prev ? { ...prev, history } : null);
    });

    return () => unsubscribe();
  }, [selectedRequest?.id]);

  const handleReply = async () => {
    if (!selectedRequest || !replyMessage.trim()) return;
    setIsReplying(true);
    await replyToSupportRequestAction({
      requestId: selectedRequest.id,
      message: replyMessage,
      sender: 'admin',
    });
    setReplyMessage('');
    setIsReplying(false);
  };
  
  const handleStatusChange = async (requestId: string, status: SupportRequest['status']) => {
    const requestRef = doc(db, 'supportRequests', requestId);
    try {
        await updateDoc(requestRef, { status });
        toast({ title: 'Status Updated', description: `Ticket status changed to ${status}.`});
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive'});
    }
  }


  const getStatusBadge = (status: SupportRequest['status']) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-500">In Progress</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Support Inbox</CardTitle>
          <CardDescription>{requests.length} tickets</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {isLoading && [...Array(5)].map((_, i) => <div key={i} className="p-4"><Skeleton className="h-10 w-full"/></div>)}
            {requests.map(req => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={cn(
                  'block w-full text-left p-4 border-b hover:bg-muted/50',
                  selectedRequest?.id === req.id && 'bg-muted'
                )}
              >
                <div className="flex justify-between items-start">
                  <p className="font-semibold truncate">{req.subject}</p>
                  {getStatusBadge(req.status)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{req.userEmail}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(req.lastMessageAt.seconds * 1000), { addSuffix: true })}
                </p>
              </button>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 flex flex-col">
        {selectedRequest ? (
          <>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center gap-4">
                <div className="flex-1">
                    <CardTitle className="truncate">{selectedRequest.subject}</CardTitle>
                    <CardDescription>{selectedRequest.userEmail}</CardDescription>
                </div>
                <Select value={selectedRequest.status} onValueChange={(value) => handleStatusChange(selectedRequest.id, value as SupportRequest['status'])}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Set status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedRequest.history.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground"><Loader2 className="animate-spin mr-2"/>Loading history...</div>
                ) : selectedRequest.history.map(item => (
                  <div key={item.id} className={cn('flex items-end gap-2', item.sender === 'admin' && 'justify-end')}>
                    {item.sender === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{selectedRequest.userEmail[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      'max-w-xs md:max-w-md rounded-lg p-3 text-sm',
                      item.sender === 'user' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                    )}>
                      <MessageContent text={item.message} />
                      <div className="text-xs opacity-70 mt-2 text-right">
                        {formatDistanceToNow(new Date(item.timestamp.seconds * 1000), { addSuffix: true })}
                      </div>
                    </div>
                     {item.sender === 'admin' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <CardContent className="pt-4 border-t">
              <div className="relative">
                <Textarea
                  placeholder="Type your response here..."
                  className="pr-16"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleReply}
                  disabled={isReplying || !replyMessage.trim()}
                >
                  {isReplying ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
            <p>Select a ticket from the inbox to view the conversation.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
