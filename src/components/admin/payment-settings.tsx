'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, uploadFile } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { Label } from '../ui/label';

const formSchema = z.object({
  upiId: z.string().min(3, { message: 'Please enter a valid UPI ID.' }),
  qrCodeImageFile: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentSettingsData {
    upiId: string;
    qrCodeImageUrl: string;
}

export function PaymentSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentQrCodeUrl, setCurrentQrCodeUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      upiId: '',
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      try {
        const settingsRef = doc(db, 'settings', 'payment');
        const settingsSnap = await getDoc(settingsRef);
        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as PaymentSettingsData;
          form.setValue('upiId', data.upiId);
          setCurrentQrCodeUrl(data.qrCodeImageUrl);
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        form.setValue('qrCodeImageFile', file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsSaving(true);
    try {
      let qrCodeImageUrl = currentQrCodeUrl;

      if (values.qrCodeImageFile) {
        // Upload new QR code image and get its URL
        qrCodeImageUrl = await uploadFile(values.qrCodeImageFile, 'settings/qr-code.png');
      }

      const settingsRef = doc(db, 'settings', 'payment');
      const newSettings = { 
        upiId: values.upiId,
        qrCodeImageUrl: qrCodeImageUrl || ''
      };
      await setDoc(settingsRef, newSettings, { merge: true });

      // Update state immediately to reflect changes
      setCurrentQrCodeUrl(qrCodeImageUrl);
      form.setValue('upiId', values.upiId);

      toast({
        title: 'Settings Saved',
        description: 'Payment settings have been updated successfully.',
      });
      setImagePreview(null); // Clear preview after save
      form.setValue('qrCodeImageFile', undefined); // Clear file input
    } catch (error) {
      console.error(error);
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
              name="qrCodeImageFile"
              render={() => (
                <FormItem>
                  <FormLabel>QR Code Image</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="file"
                            className="pl-10"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleFileChange}
                        />
                    </div>
                  </FormControl>
                   <FormDescription>
                    Upload a new QR code image to replace the current one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className='space-y-2'>
                <Label>QR Code Preview</Label>
                <div className='p-4 border rounded-md bg-muted flex items-center justify-center'>
                     <Image
                        src={imagePreview || currentQrCodeUrl || 'https://placehold.co/200x200.png?text=No+QR+Code'}
                        alt="QR Code Preview"
                        width={150}
                        height={150}
                        className="rounded-lg"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/200x200.png?text=Error';
                            e.currentTarget.alt = 'Error loading image';
                        }}
                    />
                </div>
            </div>
            
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
