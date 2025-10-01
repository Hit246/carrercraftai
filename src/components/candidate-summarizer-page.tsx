'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { summarizeCandidateAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, NotebookPen, Upload, Crown } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
    resumeFile: z.instanceof(File).refine(
        (file) => file.size > 0, 'Please upload your resume.'
      ).refine(
        (file) => file.type === 'application/pdf',
        "Please upload a valid PDF file."
      ),
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

export function CandidateSummarizerPage() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { plan } = useAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
    setSummary(null);

    try {
        const resumeDataUri = await fileToDataUri(values.resumeFile);
        const result = await summarizeCandidateAction({ resumeDataUri });
        setSummary(result.summary);

    } catch (error) {
        console.error(error);
        toast({
          title: "Summarization Failed",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {!canUseFeature && (
        <Alert variant="pro">
            <Crown />
            <AlertTitle>This is a Recruiter Feature</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
                <span>Upgrade to the Recruiter plan to access the AI Candidate Summarizer.</span>
                <Button onClick={() => router.push('/pricing')} size="sm">Upgrade Now</Button>
            </AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <NotebookPen className="text-primary"/> AI Candidate Summarizer
          </CardTitle>
          <CardDescription>
            Upload a candidate's resume PDF to generate a quick, 3-sentence summary.
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
                    <FormLabel>Candidate's Resume (PDF)</FormLabel>
                     <FormControl>
                      <div className="relative">
                          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                              type="file"
                              className="pl-10 h-auto"
                              accept="application/pdf"
                              onChange={(e) => field.onChange(e.target.files?.[0])}
                              disabled={!canUseFeature || isLoading}
                          />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !canUseFeature} size="lg" className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Summary...</>
                ) : (
                  'Summarize Candidate'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

       {isLoading && (
         <div className="flex flex-col items-center justify-center text-center pt-10">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4"/>
              <h2 className="text-xl font-semibold">Generating Summary...</h2>
              <p className="text-muted-foreground">The AI is reading the resume. Please wait.</p>
          </div>
      )}
        
      {summary && (
        <Card>
            <CardHeader>
                <CardTitle>AI Generated Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{summary}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
