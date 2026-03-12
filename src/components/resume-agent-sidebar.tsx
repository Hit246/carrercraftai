
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, Sparkles, Check, ChevronRight, User, Eye, X } from 'lucide-react';
import { resumeAgentAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Message {
  role: 'user' | 'model';
  content: string;
  suggestion?: any;
}

interface ResumeAgentSidebarProps {
  currentResumeData: any;
  onApplyChanges: (newData: any) => void;
  isOpen: boolean;
}

export function ResumeAgentSidebar({ currentResumeData, onApplyChanges, isOpen }: ResumeAgentSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm your CareerCraft AI Agent. How can I help you improve your resume today? You can ask me to rewrite your summary, add skills, or tailor your experience for a specific job." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const promptChips = [
    "✨ Improve summary",
    "💪 Stronger bullets",
    "🎯 Tailor for JD",
    "📏 Shorten work"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await resumeAgentAction({
        currentResumeData,
        message: text,
        history
      });

      const modelMessage: Message = {
        role: 'model',
        content: result.explanation,
        suggestion: result.suggestedResumeData,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error processing your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <div className="w-full lg:w-[400px] border-l bg-background flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-2xl z-50">
      <CardHeader className="border-b py-4 bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span>AI Resume Agent</span>
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 p-4 bg-muted/10" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                m.role === 'user' ? "bg-primary text-white" : "bg-card border"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div className={cn("flex flex-col gap-2 max-w-[85%]", m.role === 'user' ? "items-end" : "items-start")}>
                <div className={cn(
                  "rounded-2xl p-3 text-sm shadow-sm leading-relaxed",
                  m.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border rounded-tl-none"
                )}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.suggestion && (
                  <Card className="w-full border-primary/30 bg-primary/5 overflow-hidden shadow-md animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-3 bg-primary/10 flex items-center justify-between border-b border-primary/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Proposed Update
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-4 bg-primary/20 text-primary border-none">Ready</Badge>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground italic mb-4">The AI has generated an optimized version of your resume.</p>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="w-full h-9 text-xs font-bold" 
                        onClick={() => setReviewData(m.suggestion)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Review & Apply
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-card border flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardFooter className="p-4 border-t flex-col gap-4 bg-card">
        <div className="flex flex-wrap gap-2">
          {promptChips.map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip.replace(/[^a-zA-Z ]/g, '').trim())}
              className="text-[10px] px-3 py-1.5 rounded-full border bg-muted/30 hover:bg-primary/10 hover:border-primary/30 transition-all font-medium"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="relative w-full">
          <Input 
            placeholder="Type a request..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="pr-12 h-11 rounded-xl bg-muted/20 border-muted-foreground/20 focus-visible:ring-primary shadow-inner"
          />
          <Button 
            size="icon" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </div>

    {/* Review Changes Dialog */}
    <Dialog open={!!reviewData} onOpenChange={(open) => !open && setReviewData(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
            <DialogHeader className="p-6 border-b shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <Sparkles className="text-primary h-5 w-5" /> Review Proposed Changes
                        </DialogTitle>
                        <DialogDescription>Compare the AI's suggestions with your current resume sections.</DialogDescription>
                    </div>
                </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6 bg-muted/5">
                <div className="space-y-8">
                    {/* Summary Comparison */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Professional Summary</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border bg-card/50 text-muted-foreground">
                                <p className="text-[10px] mb-2 font-bold uppercase">Current</p>
                                <p className="text-xs">{currentResumeData.summary || 'No summary provided.'}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                                <p className="text-[10px] mb-2 font-bold uppercase text-primary">New AI Version</p>
                                <p className="text-xs">{reviewData?.summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Skills Comparison */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Skills</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border bg-card/50 text-muted-foreground">
                                <p className="text-[10px] mb-2 font-bold uppercase">Current</p>
                                <p className="text-xs">{currentResumeData.skills || 'No skills listed.'}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                                <p className="text-[10px] mb-2 font-bold uppercase text-primary">New AI Version</p>
                                <p className="text-xs">{reviewData?.skills}</p>
                            </div>
                        </div>
                    </div>

                    {/* Experience Highlights */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Key Experience Updates</h4>
                        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
                            <p className="text-xs text-amber-800 dark:text-amber-300">The AI has rephrased your work history to include stronger action verbs and quantifiable metrics. Applying will replace your current experience list.</p>
                        </div>
                    </div>
                </div>
            </ScrollArea>

            <DialogFooter className="p-6 border-t bg-card shrink-0">
                <Button variant="ghost" onClick={() => setReviewData(null)}>Cancel</Button>
                <Button onClick={() => {
                    onApplyChanges(reviewData);
                    setReviewData(null);
                }}>
                    <Check className="mr-2 h-4 w-4" /> Apply All Changes
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
