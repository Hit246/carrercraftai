'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { analyzeResumeAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Sparkles, CheckCircle, XCircle, Lightbulb, Upload } from 'lucide-react';
import type { AnalyzeResumeOutput } from '@/ai/flows/resume-analyzer';
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  resumeFile: z.instanceof(File).refine(
    (file) => file.size > 0, 'Please upload your resume.'
  ).refine(
    (file) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
    "Please upload a PDF or DOCX file."
  )
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
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        const resumeDataUri = await fileToDataUri(values.resumeFile);
        const result = await analyzeResumeAction({ resumeDataUri });
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
            Upload your resume (PDF or DOCX) to get AI-powered feedback. This is a premium feature, unlocked for this demo.
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
                    <FormLabel>Resume File</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="file"
                                className="pl-10"
                                accept=".pdf,.docx"
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                            />
                        </div>
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
