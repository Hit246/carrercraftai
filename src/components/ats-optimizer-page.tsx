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
import { Loader2, Upload, Crown, Target, Zap, TrendingUp, HelpCircle, CheckCircle2, ChevronRight, AlertTriangle, FileSearch, ShieldCheck } from 'lucide-react';
import type { AtsOptimizerOutput } from '@/ai/flows/ats-optimizer';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

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
  const { effectivePlan, credits, useCredit, isAdmin, user } = useAuth();
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

        // Save result to Firestore for history
        if (user?.uid) {
          await setDoc(
            doc(db, 'users', user.uid, 'atsResults', 'latest'),
            {
              ...result,
              savedAt: serverTimestamp(),
            }
          );
        }

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

  const getScoreColor = (score: number) => {
    if (score > 70) return 'stroke-green-500 text-green-500';
    if (score > 40) return 'stroke-amber-500 text-amber-500';
    return 'stroke-destructive text-destructive';
  };

  return (
    <div className="space-y-8 pb-12">
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
            <Target className="text-primary"/> Professional ATS Optimizer
          </CardTitle>
          <CardDescription>
            Get a comprehensive Job Match Score and a professional Quality Audit in one pass.
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
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Everything...</>
                ) : (
                  'Start Full Analysis'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

    {isLoading && (
         <div className="flex flex-col items-center justify-center text-center pt-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
              <h2 className="text-xl font-semibold">Performing Professional Audit...</h2>
              <p className="text-muted-foreground max-w-sm">We are checking match accuracy and 23 professional checkpoints.</p>
          </div>
    )}
        
    {analysisResult && (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Match Score Card */}
                <Card className="flex flex-col items-center justify-center p-8">
                    <CardHeader className="text-center p-0 mb-6">
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" /> Job Match Score
                        </CardTitle>
                        <CardDescription>Alignment with your target role</CardDescription>
                    </CardHeader>
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-muted" strokeWidth="2" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className={cn("transition-all duration-1000", getScoreColor(analysisResult.overall_score))} strokeWidth="2" strokeDasharray={`${analysisResult.overall_score}, 100`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn("text-4xl font-black", getScoreColor(analysisResult.overall_score).split(' ')[1])}>{analysisResult.overall_score}%</span>
                        </div>
                    </div>
                </Card>

                {/* Quality Score Card */}
                <Card className="flex flex-col items-center justify-center p-8">
                    <CardHeader className="text-center p-0 mb-6">
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" /> Quality Score
                        </CardTitle>
                        <CardDescription>Professional audit rating</CardDescription>
                    </CardHeader>
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-muted" strokeWidth="2" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className={cn("transition-all duration-1000", getScoreColor(analysisResult.professional_audit.quality_score))} strokeWidth="2" strokeDasharray={`${analysisResult.professional_audit.quality_score}, 100`} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={cn("text-4xl font-black", getScoreColor(analysisResult.professional_audit.quality_score).split(' ')[1])}>{analysisResult.professional_audit.quality_score}%</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Skills Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Zap className="text-primary h-5 w-5"/> Skills Matched</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.skills_matched.map((skill, i) => (
                                    <Badge key={i} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Target className="text-amber-500 h-5 w-5"/> Skills Missing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {analysisResult.skills_missing.map((skill, i) => (
                                    <Badge key={i} variant="destructive">{skill}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Audit & Suggestions Section */}
                <div className="space-y-6">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary h-5 w-5"/> Priority Fixes</CardTitle>
                            <CardDescription>Top 3 professional document improvements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {analysisResult.professional_audit.critical_fixes.map((fix, i) => (
                                    <li key={i} className="flex gap-3 text-sm">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                                        {fix}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <div className="space-y-4">
                        <h3 className="font-bold flex items-center gap-2"><CheckCircle2 className="text-green-500 h-5 w-5"/> Category Audit</h3>
                        {analysisResult.professional_audit.categories.map((cat) => (
                            <div key={cat.name} className="p-4 border rounded-lg bg-card">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{cat.name}</p>
                                    <p className="text-xs font-bold">{cat.score} / {cat.maxScore}</p>
                                </div>
                                <Progress value={(cat.score / cat.maxScore) * 100} className="h-1.5 mb-3" />
                                <ul className="space-y-1.5">
                                    {cat.suggestions.map((s, i) => (
                                        <li key={i} className="text-xs flex items-start gap-2">
                                            <ChevronRight className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )}

    </div>
  );
}
