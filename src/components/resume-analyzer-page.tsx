'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { analyzeResumeAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  resumeText: z.string().min(100, { message: 'Please paste your full resume content for an effective analysis.' }),
});

export function ResumeAnalyzerPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResumeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeText: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        const result = await analyzeResumeAction({ resumeText: values.resumeText });
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
    }
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Sparkles className="text-primary"/> AI Resume Analyzer
          </CardTitle>
          <CardDescription>
            Paste your resume content below to get AI-powered feedback. This is a premium feature, unlocked for this demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="resumeText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resume Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your resume here..."
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full">
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                ) : (
                  'Analyze My Resume'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

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
                        <p className="text-sm text-muted-foreground">{analysisResult.strengths}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <XCircle className="w-6 h-6 text-destructive" />
                        <CardTitle>Weaknesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{analysisResult.weaknesses}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                        <Lightbulb className="w-6 h-6 text-accent" />
                        <CardTitle>Suggestions for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{analysisResult.suggestions}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )}
    </div>
  );
}
