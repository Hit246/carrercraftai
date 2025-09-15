'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { LifeBuoy, Mail, User, Building, Send, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { submitSupportRequestAction } from '@/lib/actions';

const formSchema = z.object({
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(20, { message: 'Message must be at least 20 characters.' }),
  category: z.enum(['billing', 'technical', 'feedback', 'other']),
});

export function SupportPage() {
  const { toast } = useToast();
  const { plan, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
      category: 'technical',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({
            title: 'Not Authenticated',
            description: 'You must be logged in to submit a support request.',
            variant: 'destructive',
        });
        return;
    }
    setIsSubmitting(true);
    try {
        await submitSupportRequestAction({
            ...values,
            userEmail: user.email!,
            userId: user.uid,
        });

        toast({
        title: "Support Request Sent!",
        description: "Thanks for reaching out. We'll get back to you as soon as possible.",
        });
        form.reset();
    } catch (error) {
        toast({
            title: 'Submission Failed',
            description: 'There was an error submitting your request. Please try again.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center">
            <h1 className="text-3xl font-bold font-headline">Support Center</h1>
            <p className="text-muted-foreground mt-2">We're here to help. Get in touch with our team.</p>
        </div>

        {plan === 'recruiter' && (
            <Alert variant="pro" className="border-blue-400/50 text-blue-500 [&>svg]:text-blue-500">
                <User className="h-5 w-5"/>
                <AlertTitle>Dedicated Support</AlertTitle>
                <AlertDescription>
                    As a Recruiter plan member, you have a dedicated support specialist. Contact Jane at jane.doe@example.com for immediate assistance.
                </AlertDescription>
            </Alert>
        )}
        {(plan === 'pro' && plan !== 'recruiter') && (
            <Alert variant="pro">
                <Mail className="h-5 w-5"/>
                <AlertTitle>Priority Support</AlertTitle>
                <AlertDescription>
                   Your requests are prioritized. Our team will respond to you within 24 hours.
                </AlertDescription>
            </Alert>
        )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Send /> Submit a Request</CardTitle>
          <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Issue with resume analysis" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="billing">Billing</SelectItem>
                                <SelectItem value="technical">Technical Issue</SelectItem>
                                <SelectItem value="feedback">Feedback</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your issue or question in detail..."
                        className="h-40 resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Message
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}