'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Crown, User, Handshake, Loader2, Upload, ExternalLink, ShieldCheck, Hourglass, Ban } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { uploadFile } from '@/lib/firebase';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const formSchema = z.object({
    displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
    photoFile: z.instanceof(File).optional(),
});

const paymentFormSchema = z.object({
    proofFile: z.instanceof(File).refine(file => file.size > 0, "Please upload a file."),
})

export function ProfilePage() {
    const { user, plan, loading, userData, logout, updateUserProfile, updatePaymentProof, requestCancellation } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            displayName: user?.displayName || '',
        }
    });

    const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
        resolver: zodResolver(paymentFormSchema)
    });

    const handleLogout = async () => {
        await logout();
        router.push('/');
    }
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue('photoFile', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) return;
        setIsSaving(true);
        try {
            let photoURL: string | undefined = user.photoURL || undefined;

            if (values.photoFile) {
                 photoURL = await uploadFile(values.photoFile, `avatars/${user.uid}`);
            }

            await updateUserProfile({
                displayName: values.displayName,
                photoURL: photoURL,
            });

            toast({
                title: 'Profile Updated',
                description: 'Your profile has been successfully updated.',
            });
            setPhotoPreview(null); // Clear preview after successful upload
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to update profile.',
                variant: 'destructive',
            })
        } finally {
            setIsSaving(false);
        }
    }

    const onPaymentSubmit = async (values: z.infer<typeof paymentFormSchema>) => {
        if (!user) return;
        setIsUploadingProof(true);
        try {
            const proofUrl = await uploadFile(values.proofFile, `payment_proofs/${user.uid}/${values.proofFile.name}`);
            await updatePaymentProof(proofUrl);
            toast({
                title: 'Payment Proof Uploaded',
                description: 'Your payment proof has been submitted for review. An admin will verify it shortly.',
            });
            paymentForm.reset();
        } catch (error) {
            console.error("Failed to upload proof", error);
            toast({
                title: 'Upload Failed',
                description: 'There was an error uploading your payment proof. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploadingProof(false);
        }
    }

    const handleCancellation = async () => {
        if(!user) return;
        try {
            await requestCancellation();
            toast({
                title: 'Cancellation Requested',
                description: 'Your request has been submitted. An admin will process it shortly.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit cancellation request.',
                variant: 'destructive',
            });
        }
    }


    const getPlanBadge = () => {
        switch (plan) {
            case 'pro':
                return <Badge className="bg-amber-400/20 text-amber-500 border-amber-400/30"><Crown className="mr-2 h-4 w-4"/> Pro</Badge>;
            case 'recruiter':
                return <Badge className="bg-blue-400/20 text-blue-500 border-blue-400/30"><Handshake className="mr-2 h-4 w-4"/> Recruiter</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-400/20 text-yellow-500 border-yellow-400/30"><Hourglass className="mr-2 h-4 w-4"/> Pending Approval</Badge>;
             case 'cancellation_requested':
                return <Badge variant="destructive"><Ban className="mr-2 h-4 w-4"/> Cancellation Requested</Badge>;
            default:
                return <Badge variant="secondary"><User className="mr-2 h-4 w-4"/> Free</Badge>;
        }
    }

    if (loading || !user) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <Card>
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
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-1/2" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                         <Skeleton className="h-10 w-32" />
                         <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
             {plan === 'pending' && (
                <Alert variant="pro" className="border-yellow-400/50 text-yellow-600 dark:text-yellow-500 [&>svg]:text-yellow-500">
                    <Hourglass/>
                    <AlertTitle>Your Upgrade is Pending</AlertTitle>
                    <AlertDescription>
                        An administrator will review your payment soon. To speed up the process, please upload your proof of payment below if you haven't already.
                    </AlertDescription>
                </Alert>
            )}
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Manage your account settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={photoPreview || user.photoURL || `https://placehold.co/100x100.png?text=${user.email?.[0].toUpperCase()}`} />
                                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                 <FormField
                                    control={form.control}
                                    name="photoFile"
                                    render={() => (
                                    <FormItem className="flex-1">
                                        <Label>Profile Picture</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                        <FormMessage />
                                    </FormItem>
                                     )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                <FormItem>
                                    <Label>Full Name</Label>
                                    <FormControl>
                                        <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" value={user.email || ''} readOnly disabled />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={handleLogout}>Log Out</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>

            <Card>
                <CardHeader>
                    <CardTitle>My Subscription</CardTitle>
                    <CardDescription>Manage your subscription plan and payment details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <Label>Current Plan</Label>
                            <div className="mt-1">{getPlanBadge()}</div>
                        </div>
                         {plan !== 'recruiter' && plan !== 'pending' && plan !== 'cancellation_requested' && (
                            <Button variant="outline" size="sm" onClick={() => router.push('/pricing')}>
                                Upgrade Plan
                            </Button>
                        )}
                    </div>
                    
                    { (plan === 'pro' || plan === 'recruiter' || plan === 'pending') && (
                        <div className="space-y-4">
                            {userData?.planUpdatedAt && (plan !== 'pending' && plan !== 'free') && (
                                <div className="space-y-1">
                                    <Label>Last Upgrade Date</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(userData.planUpdatedAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                            )}

                             <div className="space-y-2">
                                <Label>Payment Proof</Label>
                                {userData?.paymentProofURL ? (
                                    <div className="flex items-center gap-2 text-sm text-green-600">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>Proof submitted.</span>
                                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                                            <Link href={userData.paymentProofURL} target="_blank" rel="noopener noreferrer">
                                                View Proof <ExternalLink className="ml-1 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <Form {...paymentForm}>
                                        <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="flex items-center gap-4">
                                            <FormField
                                                control={paymentForm.control}
                                                name="proofFile"
                                                render={({ field }) => (
                                                <FormItem className="flex-1">
                                                     <FormControl>
                                                        <Input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            onChange={(e) => field.onChange(e.target.files?.[0])}
                                                            disabled={isUploadingProof}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                                )}
                                            />
                                            <Button type="submit" disabled={isUploadingProof}>
                                                {isUploadingProof ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                Upload
                                            </Button>
                                        </form>
                                    </Form>
                                )}
                            </div>
                        </div>
                    )}

                </CardContent>
                {(plan === 'pro' || plan === 'recruiter') && (
                     <CardFooter className="flex justify-end border-t pt-4">
                        <Button variant="destructive" onClick={handleCancellation} disabled={plan === 'cancellation_requested'}>
                            <Ban className="mr-2 h-4 w-4" />
                            {plan === 'cancellation_requested' ? 'Cancellation Requested' : 'Request Cancellation'}
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
