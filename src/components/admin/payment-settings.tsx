'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { Label } from '../ui/label';

const formSchema = z.object({
  upiId: z.string().min(3, { message: 'Please enter a valid UPI ID.' }),
  qrCodeImageUrl: z.string().url({ message: 'Please enter a valid URL for the QR code image.' }),
});

export function PaymentSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upiId: '',
      qrCodeImageUrl: '',
    },
  });

  const qrCodeUrl = form.watch('qrCodeImageUrl');

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settingsRef = doc(db, 'settings', 'payment');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          form.reset(settingsSnap.data() as z.infer<typeof formSchema>);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch payment settings.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true);
    try {
      const settingsRef = doc(db, 'settings', 'payment');
      await setDoc(settingsRef, values, { merge: true });
      toast({
        title: 'Settings Saved',
        description: 'Payment settings have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error Saving Settings',
        description: 'There was a problem saving the payment settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
           <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>
          Configure the UPI ID and QR code that will be displayed to users during the payment process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input placeholder="your-upi-id@bank" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the UPI ID users will send payments to.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qrCodeImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>QR Code Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/qr-code.png" {...field} />
                  </FormControl>
                   <FormDescription>
                    The public URL of the QR code image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {qrCodeUrl && (
                <div className='space-y-2'>
                    <Label>QR Code Preview</Label>
                    <div className='p-4 border rounded-md bg-muted flex items-center justify-center'>
                         <Image
                            src={qrCodeUrl}
                            alt="QR Code Preview"
                            width={150}
                            height={150}
                            className="rounded-lg"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                    </div>
                </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
