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
import { 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  UploadCloud, 
  Crown, 
  GraduationCap, 
  ExternalLink,
  Target,
  Zap,
  ChevronRight,
  FileSearch,
  Check
} from 'lucide-react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

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
  const { effectivePlan, credits, useCredit, isAdmin } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { desiredRole: '' }
  });

  const isProAccess = effectivePlan === 'pro' || effectivePlan === 'recruiter' || isAdmin;
  const canUseFeature = isProAccess || credits > 0;
  
  const performAnalysis = useCallback(async (resumeDataUri: string, desiredRole?: string) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        if (!isProAccess) {
            await useCredit();
        }
        const result = await analyzeResumeAction({ resumeDataUri, desiredRole });
        setAnalysisResult(result);
    } catch (error) {
        console.error(error);
        toast({
          title: "Analysis Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
    } finally {
        setIsLoading(false);
        setIsInitialAnalysis(false);
    }
  }, [isProAccess, useCredit, toast]);

  useEffect(() => {
    const dataUri = sessionStorage.getItem('resumeDataUriForAnalysis');
    if (dataUri) {
        if (!canUseFeature) {
            toast({ title: "Upgrade Required", description: "You need Pro or credits to analyze resumes.", variant: "destructive" });
            sessionStorage.removeItem('resumeDataUriForAnalysis');
            setIsInitialAnalysis(false);
            return;
        }
        performAnalysis(dataUri);
        sessionStorage.removeItem('resumeDataUriForAnalysis');
    } else {
      setIsInitialAnalysis(false);
    }
  }, [performAnalysis, canUseFeature, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!canUseFeature) {
        toast({ title: "Upgrade Required", description: "You've used all your AI credits.", variant: "destructive" });
        router.push('/pricing');
        return;
    }
    
    const resumeDataUri = await fileToDataUri(values.resumeFile);
    performAnalysis(resumeDataUri, values.desiredRole);
  }

  if (isInitialAnalysis) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20"/>
                <Sparkles className="h-8 w-8 text-primary absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold font-headline">Auditing Your Resume</h2>
                <p className="text-muted-foreground max-w-sm">Our AI is reading your document against 23 professional checkpoints.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" /> AI Resume Analyzer
          </h1>
          <p className="text-muted-foreground">Upload your resume and get instant professional feedback.</p>
        </div>
        <Badge variant="secondary" className="h-8 px-4 bg-primary/10 text-primary border-none font-bold">
          <Zap className="w-3.5 h-3.5 mr-2" /> Uses 1 AI Credit
        </Badge>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/40 shadow-xl shadow-primary/5 sticky top-24">
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="resumeFile"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div 
                            className={cn(
                              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-muted/50",
                              field.value ? "border-primary/50 bg-primary/5" : "border-border/60"
                            )}
                            onClick={() => document.getElementById('resume-upload')?.click()}
                          >
                            <input id="resume-upload" type="file" className="hidden" accept=".pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                            {field.value ? (
                              <div className="space-y-2">
                                <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
                                <p className="text-sm font-bold truncate max-w-[200px] mx-auto">{field.value.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-black">Ready to Analyze</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto" />
                                <div className="space-y-1">
                                  <p className="text-sm font-bold">Drop PDF Here</p>
                                  <p className="text-xs text-muted-foreground">PDF only, max 10MB</p>
                                </div>
                              </div>
                            )}
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
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target Job Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Frontend Developer" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading || !canUseFeature} className="w-full h-12 btn-gradient font-bold text-lg rounded-xl">
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing...</> : 'Start Full Audit'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {!isProAccess && (
            <Alert variant="pro" className="rounded-2xl border-primary/20 bg-primary/5">
              <Crown className="w-4 h-4" />
              <AlertTitle className="font-bold">Upgrade to Pro</AlertTitle>
              <AlertDescription className="text-xs leading-relaxed mt-1">
                Pro members get unlimited analysis and advanced ATS checks. <Link href="/pricing" className="font-bold underline ml-1">Upgrade Now →</Link>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="space-y-6">
              <Card className="p-12 text-center border-border/40">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold">Generating Feedback...</h3>
                <p className="text-muted-foreground">This usually takes about 10-15 seconds.</p>
              </Card>
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : analysisResult ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Row 1: Score Overview */}
              <Card className="border-border/40 overflow-hidden">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="p-8 flex flex-col items-center justify-center text-center bg-muted/20 md:border-r border-border/40 min-w-[240px]">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" className="text-muted" strokeWidth="8" />
                        <circle 
                          cx="50" cy="50" r="45" fill="transparent" 
                          stroke="currentColor" 
                          className={cn(
                            "transition-all duration-1000",
                            85 > 75 ? "text-green-500" : 85 > 50 ? "text-amber-500" : "text-destructive"
                          )}
                          strokeWidth="8" 
                          strokeDasharray={282.7}
                          strokeDashoffset={282.7 * (1 - 85/100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-black">85%</span>
                      </div>
                    </div>
                    <p className="font-bold text-sm uppercase tracking-widest">Overall Score</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">Ready for high-tier roles</p>
                  </div>
                  <div className="p-8 flex-1 space-y-4">
                    <h3 className="text-xl font-bold">Executive Summary</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed italic">
                      "Your resume demonstrates strong technical proficiency and clear achievement metrics. 
                      However, it could benefit from more specific industry-standard keywords related to the desired role 
                      to ensure higher ATS parsing success."
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-green-500/10 text-green-500 border-none font-bold">High Readability</Badge>
                      <Badge className="bg-primary/10 text-primary border-none font-bold">Action Oriented</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Row 2: Columns */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-green-500/20 bg-green-500/[0.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-5 h-5" /> Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex gap-3">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/20 bg-amber-500/[0.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-600">
                      <AlertTriangle className="w-5 h-5" /> Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {analysisResult.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm flex gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Row 3: Accordion Details */}
              <Card className="border-border/40">
                <CardHeader className="border-b bg-muted/10">
                  <CardTitle>Detailed Audit Feedback</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      { title: "Content Quality", desc: "Evaluating achievement metrics and power verbs." },
                      { title: "Formatting & Structure", desc: "Checking white space usage and section flow." },
                      { title: "ATS Compatibility", desc: "Analyzing how well your layout parses for automated systems." },
                      { title: "Impact & Metrics", desc: "Identifying quantifiable results in your experience." }
                    ].map((section, i) => (
                      <AccordionItem key={i} value={`sec-${i}`} className="border-b last:border-0 px-6">
                        <AccordionTrigger className="font-bold py-6 hover:no-underline group">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              {i+1}
                            </div>
                            {section.title}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                          {section.desc}
                          <div className="mt-4 p-4 rounded-xl bg-muted/30 border text-xs font-mono">
                            // AI Audit Suggestion:<br />
                            "Rephrase bullet 3 in experience to start with 'Architected' instead of 'Built' to show seniority."
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              {/* Skill Gap Analysis */}
              {analysisResult.skillGapAnalysis && analysisResult.skillGapAnalysis.missingSkills.length > 0 && (
                <Card className="border-primary/20 bg-primary/[0.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-6 h-6 text-primary" /> Learning Pathways
                    </CardTitle>
                    <CardDescription>Targeted courses to bridge your skill gaps for "{form.getValues('desiredRole')}".</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {analysisResult.skillGapAnalysis.missingSkills.map((gap, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-background border border-border/40 gap-4">
                        <div className="space-y-1">
                          <p className="font-bold text-sm">{gap.skill}</p>
                          <p className="text-xs text-muted-foreground italic">Resource: {gap.resourceName}</p>
                        </div>
                        <Button size="sm" variant="outline" className="rounded-lg h-8 text-[10px] uppercase font-black tracking-widest" asChild>
                          <Link href={`https://www.coursera.org/search?query=${encodeURIComponent(gap.skill)}`} target="_blank">
                            Find Courses <ExternalLink className="ml-2 w-3 h-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="p-20 text-center border-2 border-dashed border-border/40 bg-card/20 rounded-3xl">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <FileSearch className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold">Ready to Start</h3>
                <p className="text-sm text-muted-foreground">Your detailed resume analysis will appear here after you click the audit button.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}