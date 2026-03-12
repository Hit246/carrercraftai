'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2, Sparkles, Check, ChevronRight } from 'lucide-react';
import { resumeAgentAction } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface Message {
  role: 'user' | 'model';
  content: string;
  suggestion?: any;
  explanation?: string;
}

interface ResumeAgentSidebarProps {
  currentResumeData: any;
  onApplyChanges: (newData: any) => void;
  isOpen: boolean;
}

export function ResumeAgentSidebar({ currentResumeData, onApplyChanges, isOpen }: ResumeAgentSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm your CareerCraft AI Agent. How can I help you improve your resume today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const promptChips = [
    "Improve my summary",
    "Stronger bullet points",
    "Tailor for Data Analyst",
    "Shorten experience"
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
    <div className="w-[350px] border-l bg-card flex flex-col h-full animate-in slide-in-from-right duration-300">
      <CardHeader className="border-b py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary" /> AI Resume Agent
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex flex-col gap-2", m.role === 'user' ? "items-end" : "items-start")}>
              <div className={cn(
                "max-w-[85%] rounded-lg p-3 text-sm",
                m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
              {m.suggestion && (
                <Card className="w-full border-primary/20 bg-primary/5 overflow-hidden">
                  <div className="p-3 bg-primary/10 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Proposed Update</span>
                    <Badge variant="secondary" className="text-[10px] h-4">Diff Ready</Badge>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground italic mb-3">AI suggested changes to your {m.suggestion.title ? 'profile' : 'sections'}. Click below to apply.</p>
                    <Button 
                      size="sm" 
                      className="w-full h-8 text-xs" 
                      onClick={() => onApplyChanges(m.suggestion)}
                    >
                      <Check className="w-3 h-3 mr-1" /> Apply Changes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardFooter className="p-4 border-t flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {promptChips.map(chip => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-[10px] px-2 py-1 rounded-full border bg-muted/50 hover:bg-muted transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="relative w-full">
          <Input 
            placeholder="Ask me anything..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            className="pr-10"
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </div>
  );
}