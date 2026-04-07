'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobMatcherAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Briefcase, Upload, Crown, MapPin, Clock, Calendar, Bookmark, ExternalLink, Zap, TextSearch } from 'lucide-react';
import type { JobMatcherOutput } from '@/ai/flows/job-matcher';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    resumeFile: z.instanceof(File).refine(
        (file) => file.size > 0, 'Please upload your resume.'
      ).refine(
        (file) => file.type === 'application/pdf',
        "Please upload a valid PDF file."
      ),
  desiredJobTitle: z.string().optional(),
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

export function JobMatcherPage() {
  const [jobSuggestions, setJobSuggestions] = useState<JobMatcherOutput['jobSuggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { effectivePlan, credits, useCredit, isAdmin } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        desiredJobTitle: '',
    }
  });

  const isProAccess = effectivePlan === 'pro' || effectivePlan === 'recruiter' || isAdmin;
  const canUseFeature = isProAccess || credits > 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!canUseFeature) {
        toast({
          title: "Upgrade to Pro",
          description: "Job Matching is a Pro feature. Please upgrade or get more credits to continue.",
          variant: "destructive",
        })
        router.push('/pricing');
        return;
    }
    
    setIsLoading(true);
    setJobSuggestions(null);

    try {
        if (!isProAccess) {
            await useCredit();
        }
        const resumeDataUri = await fileToDataUri(values.resumeFile);
        const result = await jobMatcherAction({ 
            resumeDataUri,
            desiredJobTitle: values.desiredJobTitle
         });
        setJobSuggestions(result.jobSuggestions);
    } catch (error) {
        console.error(error);
        toast({
          title: "Job Matching Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary" /> Smart Job Matching
          </h1>
          <p className="text-muted-foreground">Discover roles across India that perfectly fit your unique skill set.</p>
        </div>
        {!isProAccess && (
          <Badge variant="secondary" className="h-8 px-4 bg-primary/10 text-primary border-none font-bold">
            <Zap className="w-3.5 h-3.5 mr-2" /> Uses 1 AI Credit
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/40 shadow-xl shadow-primary/5 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Analysis Settings</CardTitle>
              <CardDescription>Upload your latest resume to find matches.</CardDescription>
            </CardHeader>
            <CardContent>
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
                            onClick={() => document.getElementById('job-resume-upload')?.click()}
                          >
                            <input id="job-resume-upload" type="file" className="hidden" accept=".pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                            {field.value ? (
                              <div className="space-y-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                  <Briefcase className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-sm font-bold truncate max-w-[180px] mx-auto">{field.value.name}</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                                <div className="space-y-1">
                                  <p className="text-sm font-bold">Upload Resume</p>
                                  <p className="text-xs text-muted-foreground">PDF only</p>
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
                    name="desiredJobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Preferred Title</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <TextSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="e.g. Data Scientist" {...field} className="h-11 pl-9 rounded-xl" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading || !canUseFeature} className="w-full h-12 btn-gradient font-bold rounded-xl">
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Scanning Market...</> : 'Find Matches'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {!isProAccess && (
            <Alert variant="pro" className="rounded-2xl border-primary/20 bg-primary/5">
              <Crown className="w-4 h-4" />
              <AlertTitle className="font-bold">Pro Feature</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Pro members get unlimited matching and salary insights. <Link href="/pricing" className="font-bold underline ml-1">Upgrade →</Link>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-headline">Recommended Roles</h3>
            {jobSuggestions && (
              <p className="text-xs font-medium text-muted-foreground">Found {jobSuggestions.length} targeted opportunities</p>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-border/40">
                  <CardContent className="p-6 flex gap-6">
                    <Skeleton className="h-16 w-16 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobSuggestions ? (
            <div className="grid gap-4">
              {jobSuggestions.map((job, i) => (
                <Card key={i} className="group card-hover border-border/40 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-2xl border border-primary/10 shrink-0">
                        {job.company[0]}
                      </div>
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{job.title}</h4>
                            <p className="font-medium text-muted-foreground">{job.company}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge className={cn(
                              "text-[10px] font-black uppercase px-2 py-0.5 border-none",
                              job.matchScore > 80 ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                              {job.matchScore}% Match
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {job.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" /> Remote / India
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" /> Full-time
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" /> Posted 2d ago
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/40">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black bg-muted/30">React</Badge>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black bg-muted/30">Node.js</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl">
                              <Bookmark className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="rounded-xl font-bold h-9" asChild>
                              <a href={job.url} target="_blank" rel="noopener noreferrer">
                                Details <ExternalLink className="ml-2 w-3 h-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-20 text-center border-2 border-dashed border-border/40 bg-card/20 rounded-3xl">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold">Find Your Fit</h3>
                <p className="text-sm text-muted-foreground">Upload your resume to see personalized job matches with detailed fit scores.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
