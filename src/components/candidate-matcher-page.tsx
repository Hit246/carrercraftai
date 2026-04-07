'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { candidateMatcherAction, summarizeCandidateAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Users, FileSearch, Upload, Crown, TextIcon, NotebookPen, BookmarkPlus, CheckCircle2, ChevronRight, Filter, TrendingUp } from 'lucide-react';
import type { CandidateMatcherOutput } from '@/ai/flows/candidate-matcher';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  jobDescription: z.string().min(50, { message: 'Please provide a detailed job description.' }),
  jobTitle: z.string().min(3, { message: 'Please provide a job title.' }),
  resumeFiles: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'Please upload at least one resume file.')
    .refine((files) => files.length <= MAX_FILES, `You can upload a maximum of ${MAX_FILES} files.`)
    .refine(
        (files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
        `Each file size should not exceed 5MB.`
    )
    .refine(
        (files) => Array.from(files).every((file) => file.type === 'application/pdf'),
        "Please upload PDF files only."
    )
});

type Match = CandidateMatcherOutput['candidateMatches'][0] & { resumeDataUri: string, fileName: string, isShortlisted?: boolean };

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
};

export function CandidateMatcherPage() {
  const [candidateMatches, setCandidateMatches] = useState<Match[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isShortlistingId, setIsShortlistingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const { toast } = useToast();
  const { effectivePlan, user } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: '',
      jobTitle: '',
    },
  });

  const canUseFeature = effectivePlan === 'recruiter';

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!canUseFeature) {
        toast({
            title: "Recruiter Plan Required",
            description: "Please upgrade to access talent matching tools.",
            variant: "destructive",
        });
        router.push('/pricing');
        return;
    }

    setIsLoading(true);
    setCandidateMatches(null);

    try {
        const resumeFiles = Array.from(values.resumeFiles);
        const resumeDataUris = await Promise.all(resumeFiles.map(file => fileToDataUri(file)));

        const result = await candidateMatcherAction({
            jobDescription: values.jobDescription,
            resumeDataUris: resumeDataUris,
        });

        const matchesWithUris: Match[] = result.candidateMatches
            .map((match) => {
                const originalIndex = parseInt(match.resumeId.split(' ')[1]);
                return {
                    ...match,
                    resumeDataUri: resumeDataUris[originalIndex],
                    fileName: resumeFiles[originalIndex].name
                }
            })
            .sort((a,b) => b.matchScore - a.matchScore);

        setCandidateMatches(matchesWithUris);
        toast({ title: "Ranking Complete", description: "Top candidates identified." });

    } catch (error) {
        console.error(error);
        toast({ title: "Analysis Failed", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  const handleSummarize = async (resumeDataUri: string) => {
    setIsSummarizing(true);
    setSummary(null);
    setIsSummaryDialogOpen(true);
    try {
        const result = await summarizeCandidateAction({ resumeDataUri });
        setSummary(result.summary);
    } catch (error) {
        setSummary("Failed to generate summary.");
    } finally {
        setIsSummarizing(false);
    }
  }

  const handleShortlist = async (match: Match) => {
    if (!user) return;
    setIsShortlistingId(match.resumeId);
    try {
        const candidateRef = collection(db, `users/${user.uid}/shortlistedCandidates`);
        await addDoc(candidateRef, {
            name: match.fileName.replace('.pdf', ''),
            matchScore: match.matchScore,
            jobTitle: form.getValues('jobTitle'),
            justification: match.justification,
            addedAt: serverTimestamp(),
            status: 'New'
        });

        setCandidateMatches(prev => prev ? prev.map(m => m.resumeId === match.resumeId ? { ...m, isShortlisted: true } : m) : null);
        toast({ title: "Added to Shortlist" });
    } catch (e) {
        toast({ title: "Failed to Shortlist", variant: "destructive" });
    } finally {
        setIsShortlistingId(null);
    }
  }

  return (
    <div className="space-y-8 fade-in">
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><NotebookPen className="text-primary" /> AI Candidate Summary</DialogTitle>
            <DialogDescription>Automated overview based on resume parsing.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {isSummarizing ? (
                 <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20"/>
                    <p className="text-sm font-bold text-muted-foreground">Reading resume details...</p>
                 </div>
            ) : (
                <div className="bg-muted/20 p-6 rounded-2xl border border-dashed border-border/60">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</p>
                </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
          <Users className="w-8 h-8 text-primary" /> Candidate Matcher
        </h1>
        <p className="text-muted-foreground">Batch analyze resumes against a job description to rank top talent.</p>
      </div>

      {!canUseFeature && (
        <Alert variant="pro" className="rounded-2xl border-primary/20 bg-primary/5">
            <Crown className="w-4 h-4" />
            <AlertTitle className="font-bold">Recruiter Access Only</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                <span>Unlock mass resume ranking and recruiter dashboards with the Recruiter plan.</span>
                <Button onClick={() => router.push('/pricing')} size="sm" className="font-bold rounded-lg px-6 shrink-0">Upgrade Plan</Button>
            </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <Card className="border-border/40 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Target Requirements</CardTitle>
              <CardDescription>Upload candidate pool and job details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Job Role Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Senior Backend Engineer" {...field} className="h-11 rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Job Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Paste JD requirements..." className="h-40 rounded-xl resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resumeFiles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Resume Pool (Max {MAX_FILES})</FormLabel>
                        <FormControl>
                          <div 
                            className={cn(
                              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-muted/50",
                              field.value?.length ? "border-primary/50 bg-primary/5" : "border-border/60"
                            )}
                            onClick={() => document.getElementById('mass-resume-upload')?.click()}
                          >
                            <input id="mass-resume-upload" type="file" className="hidden" accept=".pdf" multiple onChange={(e) => field.onChange(e.target.files)} />
                            {field.value?.length ? (
                              <div className="space-y-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                  <Users className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-sm font-bold">{field.value.length} Files Selected</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                                <p className="text-sm font-bold">Click to Upload PDF Pool</p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading || !canUseFeature} className="w-full h-12 btn-gradient font-bold rounded-xl">
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Talent Pool...</> : 'Rank Candidates'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> AI Rankings
            </h3>
            {candidateMatches && (
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary uppercase text-[10px] font-black tracking-widest">
                Scored by Gemini
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-border/40">
                  <CardContent className="p-6 flex items-center gap-6">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : candidateMatches ? (
            <div className="grid gap-4">
              {candidateMatches.map((match, i) => (
                <Card key={i} className="group card-hover border-border/40">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:scale-110",
                        match.matchScore > 80 ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                        match.matchScore > 50 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                        "bg-muted/50 text-muted-foreground border-border/40"
                      )}>
                        <span className="text-xl font-black">{match.matchScore}%</span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold truncate text-lg">{match.fileName.replace('.pdf', '')}</h4>
                          {match.isShortlisted && <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] uppercase font-black tracking-tighter">Shortlisted</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground italic line-clamp-1">"{match.justification}"</p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl h-10 font-bold flex-1 sm:flex-none"
                          onClick={() => handleSummarize(match.resumeDataUri)}
                          disabled={isSummarizing}
                        >
                          <NotebookPen className="w-4 h-4 mr-2" /> Summary
                        </Button>
                        <Button
                          variant={match.isShortlisted ? "secondary" : "default"}
                          size="sm"
                          className="rounded-xl h-10 font-bold flex-1 sm:flex-none shadow-lg shadow-primary/10"
                          onClick={() => handleShortlist(match)}
                          disabled={isShortlistingId === match.resumeId || match.isShortlisted}
                        >
                          {isShortlistingId === match.resumeId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : match.isShortlisted ? (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved</>
                          ) : (
                            <><BookmarkPlus className="w-4 h-4 mr-2" /> Shortlist</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-20 text-center border-2 border-dashed border-border/40 bg-card/20 rounded-3xl min-h-[500px] flex items-center justify-center">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <FileSearch className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold">Pool Rankings</h3>
                <p className="text-sm text-muted-foreground">Upload multiple resumes to see them ranked by relevance to your job description.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
