'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { transformResumeAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Loader2, 
  Upload, 
  Crown, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  Zap, 
  FileText, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  History,
  GraduationCap
} from 'lucide-react';
import type { ResumeTransformerOutput } from '@/ai/flows/resume-transformer';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  currentResume: z.instanceof(File).refine(f => f.size > 0, "Upload your current resume."),
  referenceResume: z.instanceof(File).refine(f => f.size > 0, "Upload a reference resume."),
  targetRole: z.string().min(3, "Enter your desired job role."),
});

const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
};

export function ResumeTransformerPage() {
  const [result, setResult] = useState<ResumeTransformerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { effectivePlan, credits, useCredit, user, isAdmin } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { targetRole: '' }
  });

  const isPro = effectivePlan === 'pro' || effectivePlan === 'recruiter' || isAdmin;
  const canUseFeature = isPro || credits > 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!canUseFeature) {
      toast({ title: "Upgrade Required", description: "You need Pro access or credits for AI transformation.", variant: "destructive" });
      router.push('/pricing');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const [currentUri, refUri] = await Promise.all([
        fileToDataUri(values.currentResume),
        fileToDataUri(values.referenceResume)
      ]);

      const output = await transformResumeAction({
        currentResumeUri: currentUri,
        referenceResumeUri: refUri,
        targetRole: values.targetRole,
      });

      if (!isPro) await useCredit();
      setResult(output);
      toast({ title: "Transformation Complete", description: "Your resume has been optimized for " + values.targetRole });

    } catch (error: any) {
      console.error(error);
      toast({ title: "Transformation Failed", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenInBuilder = async () => {
    if (!user || !result) return;
    try {
        const name = `${result.transformedData.name}'s ${form.getValues('targetRole')} Resume`;
        const newRef = await addDoc(collection(db, `users/${user.uid}/resumeVersions`), {
            versionName: name,
            resumeData: result.transformedData,
            updatedAt: serverTimestamp()
        });
        router.push(`/resume-builder?id=${newRef.id}`);
        toast({ title: "Imported to Builder", description: "You can now edit and export your new resume." });
    } catch (e) {
        toast({ title: "Import Error", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-10 pb-20 fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" /> AI Resume Transformer
          </h1>
          <p className="text-muted-foreground">Clone the style of high-performing resumes for your target role.</p>
        </div>
        {!isPro && (
          <Badge variant="secondary" className="h-8 px-4 bg-primary/10 text-primary border-none font-bold">
            <Zap className="w-3.5 h-3.5 mr-2" /> Uses 1 AI Credit
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/40 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Transformation Settings</CardTitle>
              <CardDescription>Upload files to start the cloning process.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="targetRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target Job Role</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Senior Product Manager" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="currentResume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Resume</FormLabel>
                          <FormControl>
                            <div 
                              className={cn(
                                "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-muted/50 h-32 flex flex-col items-center justify-center",
                                field.value ? "border-primary/50 bg-primary/5" : "border-border/60"
                              )}
                              onClick={() => document.getElementById('curr-resume-up')?.click()}
                            >
                              <input id="curr-resume-up" type="file" className="hidden" accept=".pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                              {field.value ? (
                                <><FileText className="w-6 h-6 text-primary mb-1" /><p className="text-[10px] font-bold truncate w-full">{field.value.name}</p></>
                              ) : (
                                <><Upload className="w-6 h-6 text-muted-foreground mb-1" /><p className="text-[10px] font-bold">Current PDF</p></>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="referenceResume"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Reference Resume</FormLabel>
                          <FormControl>
                            <div 
                              className={cn(
                                "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-muted/50 h-32 flex flex-col items-center justify-center",
                                field.value ? "border-amber-500/50 bg-amber-500/5" : "border-border/60"
                              )}
                              onClick={() => document.getElementById('ref-resume-up')?.click()}
                            >
                              <input id="ref-resume-up" type="file" className="hidden" accept=".pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                              {field.value ? (
                                <><Target className="w-6 h-6 text-amber-500 mb-1" /><p className="text-[10px] font-bold truncate w-full">{field.value.name}</p></>
                              ) : (
                                <><Target className="w-6 h-6 text-muted-foreground mb-1" /><p className="text-[10px] font-bold">Reference PDF</p></>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" disabled={isLoading || !canUseFeature} className="w-full h-12 btn-gradient font-bold rounded-xl text-lg">
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Retraining AI...</> : 'Transform Now'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {!isPro && (
            <Alert variant="pro" className="rounded-2xl border-primary/20 bg-primary/5">
              <Crown className="w-4 h-4" />
              <AlertTitle className="font-bold">Upgrade for Style Cloning</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Cloning high-tier resumes requires intense AI processing. <Badge variant="outline" className="ml-1 text-[8px] h-4">Pro Unlimited</Badge>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {isLoading ? (
            <Card className="p-12 text-center border-border/40 h-full min-h-[500px] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
                    <Sparkles className="w-8 h-8 text-primary absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold">Optimizing Experience...</h3>
                    <p className="text-muted-foreground max-w-xs text-sm">Our AI is mapping your career facts to the benchmark resume's impact-driven style.</p>
                </div>
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                        <span>Keyword Mapping</span>
                        <span>80%</span>
                    </div>
                    <Progress value={80} className="h-1" />
                </div>
            </Card>
          ) : result ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Scores Header */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/10">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs uppercase font-black tracking-widest text-muted-foreground">Original Score</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-muted-foreground/60">{result.analysis.initialAtsScore}%</span>
                            <TrendingUp className="w-5 h-5 text-muted-foreground/40 rotate-180" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs uppercase font-black tracking-widest text-primary">Transformed Score</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-primary">{result.analysis.finalAtsScore}%</span>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
              </div>

              {/* Main Improvements */}
              <Card className="border-primary/20 shadow-2xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" /> Optimization Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h4 className="text-xs font-black uppercase text-muted-foreground mb-3 flex items-center gap-2">
                            <History className="w-3.5 h-3.5" /> Key Enhancements
                        </h4>
                        <ul className="space-y-3">
                            {result.analysis.changesMade.map((change, i) => (
                                <li key={i} className="text-sm flex gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>{change}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t">
                        <div>
                            <h4 className="text-xs font-black uppercase text-amber-600 mb-3 flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5" /> Missing Skills
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {result.analysis.missingSkills.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="bg-amber-500/5 text-amber-700 border-amber-500/20 text-[10px]">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase text-indigo-600 mb-3 flex items-center gap-2">
                                <GraduationCap className="w-3.5 h-3.5" /> Target Certs
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {result.analysis.suggestedCertifications.map((cert, i) => (
                                    <Badge key={i} variant="outline" className="bg-indigo-500/5 text-indigo-700 border-indigo-500/20 text-[10px]">{cert}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-left">
                        <p className="text-xs font-bold text-muted-foreground">Optimization based on style transfer.</p>
                        <p className="text-[10px] text-muted-foreground">Ready to export to PDF or Word via builder.</p>
                    </div>
                    <Button onClick={handleOpenInBuilder} className="btn-gradient px-8 h-11 font-bold rounded-xl shadow-xl shadow-primary/20">
                        Edit in Resume Builder <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <Card className="p-20 text-center border-2 border-dashed border-border/40 bg-card/20 rounded-3xl min-h-[500px] flex items-center justify-center">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold">Transformation Result</h3>
                <p className="text-sm text-muted-foreground">Your factual data will be rewritten to match your target resume's quality and role requirements here.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
