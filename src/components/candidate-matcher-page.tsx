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
import { Loader2, Users, FileSearch, Upload, Crown, TextIcon, NotebookPen } from 'lucide-react';
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

const MAX_FILES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const formSchema = z.object({
  jobDescription: z.string().min(50, { message: 'Please provide a detailed job description.' }),
  resumeFiles: z.custom<FileList>()
    .refine((files) => files && files.length > 0, 'Please upload at least one resume file.')
    .refine((files) => files.length <= MAX_FILES, `You can upload a maximum of ${MAX_FILES} files.`)
    .refine(
        (files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
        `Each file size should not exceed 5MB.`
    )
    .refine(
        (files) => Array.from(files).every((file) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)),
        "Please upload PDF or DOCX files."
    )
});

type Match = CandidateMatcherOutput['candidateMatches'][0] & { resumeDataUri: string };

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
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const { toast } = useToast();
  const { plan } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: '',
    },
  });

  const canUseFeature = plan === 'recruiter';

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!canUseFeature) {
        toast({
            title: "Upgrade to Recruiter Plan",
            description: "This feature is only available on the Recruiter plan.",
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
            resumeDataUris: resumeDataUris
        });

        const matchesWithUris: Match[] = result.candidateMatches
            .map((match, index) => ({
                ...match,
                resumeDataUri: resumeDataUris[index]
            }))
            .sort((a,b) => b.matchScore - a.matchScore);

        setCandidateMatches(matchesWithUris);

    } catch (error) {
        console.error(error);
        toast({
          title: "Candidate Matching Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
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
        console.error(error);
        setSummary("Failed to generate summary. Please try again.");
    } finally {
        setIsSummarizing(false);
    }
  }

  return (
    <div className="space-y-8">
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><NotebookPen/> AI Candidate Summary</DialogTitle>
            <DialogDescription>A quick overview of the candidate's profile.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isSummarizing ? (
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/> Generating summary...
                 </div>
            ) : (
                <p className="text-sm text-muted-foreground">{summary}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {!canUseFeature && (
        <Alert variant="pro">
            <Crown />
            <AlertTitle>This is a Recruiter Feature</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
                <span>Upgrade to the Recruiter plan to access the AI Candidate Matcher.</span>
                <Button onClick={() => router.push('/pricing')} size="sm">Upgrade Now</Button>
            </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Users className="text-primary"/> AI Candidate Matcher
          </CardTitle>
          <CardDescription>
            For recruiters and hiring managers. Paste a job description and upload multiple candidate resumes (PDF or DOCX) to find the best-fit candidates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the job description here..."
                          className="h-64 resize-y"
                          {...field}
                          disabled={!canUseFeature || isLoading}
                        />
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
                      <FormLabel>Candidate Resumes</FormLabel>
                       <FormControl>
                        <div className="relative">
                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="file"
                                className="pl-10 h-auto"
                                accept=".pdf,.docx"
                                multiple
                                onChange={(e) => field.onChange(e.target.files)}
                                disabled={!canUseFeature || isLoading}
                            />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload up to {MAX_FILES} resumes in PDF or DOCX format.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading || !canUseFeature} size="lg" className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Candidates...</>
                ) : (
                  'Find Best Matches'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="text-xl font-headline mb-4">Matching Candidates</h3>
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Resume ID</TableHead>
                        <TableHead className="w-[150px]">Match Score</TableHead>
                        <TableHead>Justification</TableHead>
                        <TableHead className="text-right w-[120px]">Summary</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                         [...Array(3)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-5/6" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    )}
                    {!isLoading && (!candidateMatches || candidateMatches.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                <FileSearch className="mx-auto h-8 w-8 text-muted-foreground mb-2"/>
                               {canUseFeature ? "No candidates found yet. Results will appear here." : "Upgrade to the Recruiter plan to find candidates."}
                            </TableCell>
                        </TableRow>
                    )}
                    {candidateMatches && candidateMatches.map((match) => (
                        <TableRow key={match.resumeId}>
                            <TableCell className="font-medium">{match.resumeId.replace('Resume', 'Resume ')}</TableCell>
                            <TableCell>
                                <Badge variant={match.matchScore > 75 ? 'default' : match.matchScore > 50 ? 'secondary' : 'outline'}>
                                    {match.matchScore.toFixed(0)} / 100
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{match.justification}</TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSummarize(match.resumeDataUri)}
                                    disabled={isSummarizing}
                                >
                                    <TextIcon className="mr-2 h-4 w-4" />
                                    Summarize
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
      </div>
    </div>
  );
}
