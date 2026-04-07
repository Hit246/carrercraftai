'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateCoverLetterAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, FileText, Upload, Crown, Copy, Download, RotateCcw, Zap, Sparkles, Check } from 'lucide-react';
import type { GenerateCoverLetterOutput } from '@/ai/flows/cover-letter-generator';
import { useToast } from "@/hooks/use-toast";
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
    jobDescription: z.string().min(50, { message: 'Please provide a detailed job description.' }),
    companyName: z.string().min(2, { message: 'Please enter company name.' }),
    jobTitle: z.string().min(2, { message: 'Please enter job title.' }),
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

export function CoverLetterGeneratorPage() {
  const [coverLetter, setCoverLetter] = useState<GenerateCoverLetterOutput['coverLetter'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tone, setTone] = useState<'professional' | 'friendly' | 'confident'>('professional');
  const [isCopied, setIsCopied] = useState(false);
  
  const { toast } = useToast();
  const { user, effectivePlan, credits, useCredit } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        jobDescription: '',
        companyName: '',
        jobTitle: '',
    }
  });
  
  const canUseFeature = effectivePlan !== 'free' || credits > 0;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if(!canUseFeature) {
        toast({
          title: "Upgrade Plan",
          description: "You've used all your free credits. Please upgrade to continue.",
          variant: "destructive",
        })
        router.push('/pricing');
        return;
    }
    
    setIsLoading(true);
    setCoverLetter(null);

    try {
        if (effectivePlan === 'free') {
            await useCredit();
        }
        const resumeDataUri = await fileToDataUri(values.resumeFile);
        const result = await generateCoverLetterAction({ 
            resumeDataUri,
            jobDescription: `Role: ${values.jobTitle} at ${values.companyName}\n\n${values.jobDescription}\n\nTone: ${tone}`,
            userName: user?.displayName || user?.email || 'The Applicant'
         });
        setCoverLetter(result.coverLetter);
    } catch (error) {
        console.error(error);
        toast({
          title: "Generation Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({ title: "Copied to clipboard" });
    }
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" /> AI Cover Letter Generator
          </h1>
          <p className="text-muted-foreground">Generate a perfectly tailored letter for any role in seconds.</p>
        </div>
        {effectivePlan === 'free' && (
          <Badge variant="secondary" className="h-8 px-4 bg-primary/10 text-primary border-none font-bold">
            <Zap className="w-3.5 h-3.5 mr-2" /> Uses 1 AI Credit
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <Card className="border-border/40 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Letter Details</CardTitle>
              <CardDescription>Provide context for the AI writer.</CardDescription>
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
                              "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-muted/50",
                              field.value ? "border-primary/50 bg-primary/5" : "border-border/60"
                            )}
                            onClick={() => document.getElementById('cl-resume-upload')?.click()}
                          >
                            <input id="cl-resume-upload" type="file" className="hidden" accept=".pdf" onChange={(e) => field.onChange(e.target.files?.[0])} />
                            {field.value ? (
                              <div className="flex items-center justify-center gap-3">
                                <Check className="w-5 h-5 text-primary" />
                                <p className="text-sm font-bold truncate max-w-[200px]">{field.value.name}</p>
                              </div>
                            ) : (
                              <p className="text-sm font-bold text-muted-foreground">Select Resume PDF</p>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="jobTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Job Title</FormLabel>
                          <FormControl><Input placeholder="e.g. UX Designer" {...field} className="h-11 rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Company</FormLabel>
                          <FormControl><Input placeholder="e.g. Flipkart" {...field} className="h-11 rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="jobDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Job Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Paste job details..." className="h-32 rounded-xl resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Writing Tone</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['professional', 'friendly', 'confident'] as const).map((t) => (
                        <Button
                          key={t}
                          type="button"
                          variant={tone === t ? "default" : "outline"}
                          className="capitalize h-10 rounded-xl font-bold"
                          onClick={() => setTone(t)}
                        >
                          {t}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={isLoading || !canUseFeature} className="w-full h-12 btn-gradient font-bold rounded-xl text-lg">
                    {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Drafting...</> : 'Generate Letter'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7">
          {isLoading ? (
            <Card className="border-border/40 h-full min-h-[600px]">
              <CardContent className="p-12 flex flex-col items-center justify-center h-full text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <h3 className="text-xl font-bold">Writing Your Story...</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm italic">
                  "Our AI is selecting your most relevant achievements to highlight for this specific role."
                </p>
              </CardContent>
            </Card>
          ) : coverLetter ? (
            <Card className="border-border/40 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
              <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10">
                <div className="space-y-1">
                  <CardTitle className="text-lg">Generated Letter</CardTitle>
                  <p className="text-xs font-medium text-muted-foreground">{coverLetter.split(' ').length} words written</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold" onClick={handleCopy}>
                    {isCopied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold">
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="max-w-[650px] mx-auto prose prose-sm dark:prose-invert font-body text-base leading-relaxed whitespace-pre-wrap">
                  {coverLetter}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-20 text-center border-2 border-dashed border-border/40 bg-card/20 rounded-3xl h-full min-h-[600px] flex items-center justify-center">
              <div className="max-w-xs mx-auto space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold">Preview Result</h3>
                <p className="text-sm text-muted-foreground">Your AI-generated cover letter will appear here formatted and ready to send.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
