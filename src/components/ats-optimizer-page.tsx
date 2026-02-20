'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { atsOptimizerAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Upload, Crown, Target, Zap, TrendingUp, HelpCircle } from 'lucide-react';
import type { AtsOptimizerOutput } from '@/ai/flows/ats-optimizer';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const formSchema = z.object({
    resumeFile: z.instanceof(File).refine(
        (file) => file.size > 0, 'Please upload your resume.'
      ).refine(
        (file) => file.type === 'application/pdf',
        "Please upload a valid PDF file."
      ),
    jobDescription: z.string().min(50, { message: 'Please provide a detailed job description.' }),
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

export function AtsOptimizerPage() {
  const [analysisResult, setAnalysisResult] = useState<AtsOptimizerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { effectivePlan, credits, useCredit, isAdmin } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        jobDescription: '',
    }
  });
  
  const isProAccess = effectivePlan === 'pro' || effectivePlan === 'recruiter' || isAdmin;
  const canUseFeature = isProAccess || credits > 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!canUseFeature) {
        toast({
          title: "Upgrade to Pro",
          description: "This is a Pro feature. Please upgrade or get more credits to continue.",
          variant: "destructive",
        })
        router.push('/pricing');
        return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        if (!isProAccess) {
            await useCredit();
        }
        const resumeDataUri = await fileToDataUri(values.resumeFile);
        const result = await atsOptimizerAction({ 
            resumeDataUri,
            jobDescription: values.jobDescription,
         });
        setAnalysisResult(result);
    } catch (error) {
        console.error(error);
        toast({
          title: "Optimization Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
        {!isProAccess && (
             <Alert variant="pro">
                <Crown />
                <AlertTitle>This is a Pro Feature</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                    <span>You have {credits} credits remaining. Upgrade to Pro for advanced ATS optimization.</span>
                    <Button onClick={() => router.push('/pricing')} size="sm">Upgrade Now</Button>
                </AlertDescription>
            </Alert>
        )}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Target className="text-primary"/> ATS Optimizer
          </CardTitle>
          <CardDescription>
            Optimize your resume for any job. Upload your resume and paste a job description to get a match score and improvement suggestions.
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
                            <FormLabel>Your Resume (PDF)</FormLabel>
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
                        name="jobDescription"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Description</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Paste the job description here..."
                                className="h-48 resize-y"
                                {...field}
                                disabled={isLoading}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              <Button type="submit" disabled={isLoading || !canUseFeature} size="lg" className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Optimizing...</>
                ) : (
                  'Optimize My Resume'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

    {isLoading && (
         <div className="flex flex-col items-center justify-center text-center pt-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
              <h2 className="text-xl font-semibold">Optimizing Your Resume...</h2>
              <p className="text-muted-foreground">The AI is analyzing the job description and your resume. Please wait.</p>
          </div>
    )}
        
    {analysisResult && (
        <div className="mt-8 space-y-6">
             <h3 className="text-xl font-headline text-center">Optimization Results</h3>
             <Card>
                <CardHeader>
                    <CardTitle>AI Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{analysisResult.summary}</p>
                </CardContent>
             </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <TrendingUp /> 
                        Overall Match Score
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs">This score represents how well your resume matches the job description based on keywords and skills identified by the AI. A higher score means better alignment.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                className="stroke-current text-gray-200 dark:text-gray-700"
                                strokeWidth="2"
                                fill="none"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                className="stroke-current text-primary"
                                strokeWidth="2"
                                strokeDasharray={`${analysisResult.overall_score}, 100`}
                                fill="none"
                                strokeLinecap="round"
                            />
                        </svg>
                         <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-bold text-primary">{analysisResult.overall_score}%</span>
                        </div>
                    </div>
                    <p className="text-muted-foreground mt-2">Your resume's alignment with the job description.</p>
                </CardContent>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <Zap className="w-6 h-6 text-primary" />
                        <CardTitle>Skills Matched</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {analysisResult.skills_matched.map((keyword, index) => (
                                <Badge key={index} variant="secondary">{keyword}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <Target className="w-6 h-6 text-amber-500" />
                        <CardTitle>Skills Missing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                             {analysisResult.skills_missing.map((item, index) => (
                                <Badge key={index} variant="destructive">{item}</Badge>
                             ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )}

    </div>
  );
}