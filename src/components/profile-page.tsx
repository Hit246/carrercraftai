'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Crown, User, Handshake, Loader2, Upload, ExternalLink, ShieldCheck, Hourglass, Ban, Wallet, Calendar, BotIcon } from 'lucide-react';
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
    phoneNumber: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).optional(),
    photoFile: z.instanceof(File).optional(),
});

export function ProfilePage() {
    const { user, plan, loading, userData, credits, logout, updateUserProfile, requestCancellation } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            displayName: user?.displayName || '',
            phoneNumber: userData?.phoneNumber || '',
        }
    });

    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
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
            
            const profileData = {
                displayName: values.displayName || user.displayName,
                photoURL: photoURL,
                phoneNumber: values.phoneNumber || userData?.phoneNumber,
            }

            await updateUserProfile(profileData);

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
            case 'essentials':
                return <Badge className="bg-gray-400/20 text-gray-500 border-gray-400/30"><User className="mr-2 h-4 w-4"/> Essentials</Badge>;
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
                        An administrator will review your payment soon. Your request is being processed. If you haven't already, you can submit your proof of payment on the order status page.
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
                                    <AvatarImage src={photoPreview || userData?.photoURL || user.photoURL || `https://placehold.co/100x100.png?text=${user.email?.[0].toUpperCase()}`} />
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

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                <FormItem>
                                    <Label>Phone Number</Label>
                                    <FormControl>
                                        <Input type="tel" placeholder="Your 10-digit phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
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
                    <div className="space-y-4 rounded-lg border p-4">
                         <div className="flex items-center justify-between">
                            <Label>Current Plan</Label>
                            {getPlanBadge()}
                         </div>
                         <div className="flex items-center justify-between">
                            <Label>AI Credits</Label>
                            <Badge variant="outline">
                                <BotIcon className="mr-2 h-4 w-4"/>
                                {plan === 'pro' || plan === 'recruiter' ? 'Unlimited' : `${credits} remaining`}
                            </Badge>
                         </div>
                    </div>
                    
                    { (plan !== 'free' && plan !== 'pending' && plan !== 'cancellation_requested') && (
                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-muted-foreground"/>
                                <h4 className="font-semibold">Payment Details</h4>
                            </div>
                            {userData?.planUpdatedAt && (
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4"/> Last Payment</Label>
                                    <p className="text-sm font-medium">
                                        {new Date(userData.planUpdatedAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                            {userData?.paymentId && (
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4"/> Payment ID</Label>
                                    <p className="text-sm font-mono text-muted-foreground truncate" title={userData.paymentId}>
                                        {userData.paymentId}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
                {(plan === 'pro' || plan === 'recruiter' || plan === 'essentials') && (
                     <CardFooter className="flex justify-between items-center border-t pt-4">
                        <p className="text-xs text-muted-foreground">Need to cancel? <Link href="/cancellation" className="underline">View policy</Link></p>
                        <Button variant="destructive" onClick={handleCancellation} disabled={plan === 'cancellation_requested'}>
                            <Ban className="mr-2 h-4 w-4" />
                            {plan === 'cancellation_requested' ? 'Cancellation Requested' : 'Request Cancellation'}
                        </Button>
                    </CardFooter>
                )}
                 {plan === 'free' && (
                     <CardFooter className="border-t pt-4">
                        <Button className="w-full" onClick={() => router.push('/pricing')}>
                            <Crown className="mr-2 h-4 w-4" />
                            Upgrade to Pro
                        </Button>
                    </CardFooter>
                )}
                 {plan === 'pending' && (
                     <CardFooter className="border-t pt-4">
                        <Button className="w-full" onClick={() => router.push('/pricing')} variant="secondary">
                            Change Plan
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
