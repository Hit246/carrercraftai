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
import { Loader2, FileText, Upload, Crown } from 'lucide-react';
import type { GenerateCoverLetterOutput } from '@/ai/flows/cover-letter-generator';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    resumeFile: z.instanceof(File).refine(
        (file) => file.size > 0, 'Please upload your resume.'
      ).refine(
        (file) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
        "Please upload a PDF or DOCX file."
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

export function CoverLetterGeneratorPage() {
  const [coverLetter, setCoverLetter] = useState<GenerateCoverLetterOutput['coverLetter'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { plan, user, credits, useCredit } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        jobDescription: '',
    }
  });
  
  const canUseFeature = plan !== 'free' || credits > 0;

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
    
    setIsLoading(true);
    setCoverLetter(null);

    try {
        if (plan === 'free') {
            useCredit();
        }
        const resumeDataUri = await fileToDataUri(values.resumeFile);
        const result = await generateCoverLetterAction({ 
            resumeDataUri,
            jobDescription: values.jobDescription,
            userName: user?.displayName || user?.email || 'The Applicant'
         });
        setCoverLetter(result.coverLetter);
    } catch (error) {
        console.error(error);
        toast({
          title: "Cover Letter Generation Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <FileText className="text-primary"/> AI Cover Letter Generator
          </CardTitle>
          <CardDescription>
            Create a compelling, tailored cover letter in seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               <FormField
                  control={form.control}
                  name="resumeFile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Resume</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="file"
                                className="pl-10"
                                accept=".pdf,.docx"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                                disabled={!canUseFeature || isLoading}
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
                        disabled={!canUseFeature || isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !canUseFeature} size="lg" className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Cover Letter...</>
                ) : (
                  'Generate Cover Letter'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
        
        {coverLetter && (
            <Card>
                <CardHeader>
                    <CardTitle>Your Generated Cover Letter</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        value={coverLetter} 
                        readOnly 
                        className="h-[500px] bg-secondary/50"
                    />
                </CardContent>
            </Card>
        )}

    </div>
  );
}
