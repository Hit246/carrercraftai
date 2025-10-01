
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { analyzeResumeAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, CheckCircle, XCircle, Lightbulb, Upload, Crown, GraduationCap, ExternalLink } from 'lucide-react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  resumeFile: z.instanceof(File).refine(
    (file) => file.size > 0, 'Please upload a PDF of your resume.'
  ).refine(
    (file) => file.type === 'application/pdf',
    "Please upload a valid PDF file."
  ),
  desiredRole: z.string().optional(),
});

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

export function ResumeAnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialAnalysis, setIsInitialAnalysis] = useState(true);
  const { toast } = useToast();
  const { plan, credits, useCredit } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desiredRole: '',
    }
  });

  const canUseFeature = plan !== 'free' || credits > 0;
  
  const performAnalysis = useCallback(async (resumeDataUri: string, desiredRole?: string) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        if (plan === 'free' || plan === 'essentials') {
            await useCredit();
        }
        const result = await analyzeResumeAction({ resumeDataUri, desiredRole });
        setAnalysisResult(result);
    } catch (error) {
        console.error(error);
        toast({
          title: "Analysis Failed",
          description: "Something went wrong while analyzing your resume. Please try again.",
          variant: "destructive",
        })
    } finally {
        setIsLoading(false);
        setIsInitialAnalysis(false);
    }
  }, [plan, useCredit, toast]);

  useEffect(() => {
    const dataUri = sessionStorage.getItem('resumeDataUriForAnalysis');
    if (dataUri) {
        performAnalysis(dataUri);
        // Clean up session storage after use
        sessionStorage.removeItem('resumeDataUriForAnalysis');
    } else {
      setIsInitialAnalysis(false);
    }
  }, [performAnalysis]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!canUseFeature) {
        toast({
          title: "Upgrade to Pro",
          description: "You've used all your free credits. Please upgrade to continue.",
          variant: "destructive",
        })
        router.push('/pricing');
        return;
    }
    
    const resumeDataUri = await fileToDataUri(values.resumeFile);
    performAnalysis(resumeDataUri, values.desiredRole);
  }

  if (isInitialAnalysis) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
              <h2 className="text-xl font-semibold">Analyzing Your Resume...</h2>
              <p className="text-muted-foreground">The AI is reviewing your document. Please wait a moment.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
        {plan === 'free' && (
             <Alert variant="pro">
                <Crown />
                <AlertTitle>This is a Pro Feature</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <span>You have {credits} free credits remaining. Upgrade for unlimited use.</span>
                    <Button onClick={() => router.push('/pricing')} size="sm">Upgrade Now</Button>
                </AlertDescription>
            </Alert>
        )}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Sparkles className="text-primary"/> AI Resume Analyzer
          </CardTitle>
          <CardDescription>
            Upload a PDF of your resume to get AI-powered feedback. For a more targeted analysis, provide your desired job role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="resumeFile"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Upload Resume (PDF)</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="file"
                                    className="pl-10"
                                    accept="application/pdf"
                                    onChange={(e) => field.onChange(e.target.files?.[0])}
                                    disabled={isLoading}
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="desiredRole"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Desired Role (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Senior Product Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
               </div>
              <Button type="submit" disabled={isLoading || !canUseFeature} size="lg" className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  'Analyze Resume'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    
    {isLoading && (
         <div className="flex flex-col items-center justify-center text-center pt-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
              <h2 className="text-xl font-semibold">Analyzing Your Resume...</h2>
              <p className="text-muted-foreground">The AI is reviewing your document. Please wait a moment.</p>
          </div>
    )}

    {analysisResult && (
        <div className="mt-8 space-y-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-headline text-center">Analysis Results</h3>
            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <CheckCircle className="w-6 h-6 text-primary" />
                        <CardTitle>Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                            {analysisResult.strengths.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <XCircle className="w-6 h-6 text-destructive" />
                        <CardTitle>Weaknesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                            {analysisResult.weaknesses.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <Lightbulb className="w-6 h-6 text-amber-500" />
                        <CardTitle>Suggestions for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                             {analysisResult.suggestions.map((item, index) => <li key={index}>{item}</li>)}
                        </ul>
                    </CardContent>
                </Card>
                {analysisResult.skillGapAnalysis && analysisResult.skillGapAnalysis.missingSkills.length > 0 && (
                    <Card>
                         <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                            <GraduationCap className="w-6 h-6 text-blue-500" />
                            <CardTitle>Skill Gap Analysis & Learning</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {analysisResult.skillGapAnalysis.missingSkills.map((gap, index) => {
                                    const searchUrl = `https://www.coursera.org/search?query=${encodeURIComponent(gap.skill)}`;
                                    return (
                                    <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md border bg-muted/50">
                                        <div className='flex-1'>
                                            <p className="font-semibold">{gap.skill}</p>
                                            <p className="text-sm text-muted-foreground">Suggested resource: {gap.resourceName}</p>
                                        </div>
                                        <Button asChild size="sm" variant="link" className="mt-2 sm:mt-0">
                                            <Link href={searchUrl} target="_blank" rel="noopener noreferrer">
                                                Find Courses <ExternalLink className="ml-2 h-4 w-4"/>
                                            </Link>
                                        </Button>
                                    </li>
                                )})}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )}
    </div>
  );
}
