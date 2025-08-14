'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobMatcherAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Briefcase, ExternalLink } from 'lucide-react';
import type { JobMatcherOutput } from '@/ai/flows/job-matcher';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  resumeText: z.string().min(100, { message: 'Please paste your full resume content.' }),
  desiredJobTitle: z.string().optional(),
});

export function JobMatcherPage() {
  const [jobSuggestions, setJobSuggestions] = useState<JobMatcherOutput['jobSuggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resumeText: '',
      desiredJobTitle: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setJobSuggestions(null);

    try {
        const result = await jobMatcherAction(values);
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
    <div className="grid lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 xl:col-span-3">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Briefcase className="text-primary"/> AI Job Matcher
            </CardTitle>
            <CardDescription>
              Find jobs that fit your profile. This is a premium feature, unlocked for this demo.
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
                      <FormLabel>Your Resume Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste your resume here..."
                          className="h-48 resize-y"
                          {...field}
                        />
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
                      <FormLabel>Desired Job Title (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finding Jobs...</>
                  ) : (
                    'Find Matching Jobs'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-8 xl:col-span-9">
          <h3 className="text-xl font-headline mb-4">Suggested Jobs</h3>
          {isLoading && (
              <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                          <CardHeader>
                             <Skeleton className="h-5 w-3/4" />
                             <Skeleton className="h-4 w-1/2 mt-2" />
                          </CardHeader>
                          <CardContent className="space-y-3">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-5/6" />
                              <Skeleton className="h-2 w-full mt-2" />
                          </CardContent>
                      </Card>
                  ))}
              </div>
          )}
          {!isLoading && !jobSuggestions && (
              <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed min-h-[300px]">
                  <Briefcase className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">Your job suggestions will appear here.</p>
              </Card>
          )}
          {jobSuggestions && (
              <div className="space-y-4">
                  {jobSuggestions.map((job, index) => (
                      <Card key={index}>
                          <CardHeader>
                              <div className="flex justify-between items-start">
                                  <div>
                                      <CardTitle className="font-headline text-lg">{job.title}</CardTitle>
                                      <CardDescription>{job.company}</CardDescription>
                                  </div>
                                  <Button variant="ghost" size="icon" asChild>
                                      <Link href={job.url} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="h-4 w-4" />
                                      </Link>
                                  </Button>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <p className="text-sm text-muted-foreground mb-4">{job.description}</p>
                              <Label className="text-xs">Match Score: {Math.round(job.matchScore * 100)}%</Label>
                              <Progress value={job.matchScore * 100} className="h-2 mt-1" />
                          </CardContent>
                      </Card>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}
