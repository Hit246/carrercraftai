'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Crown, User, Handshake, Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { uploadFile } from '@/lib/firebase';


const formSchema = z.object({
    displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
    photoFile: z.instanceof(File).optional(),
});

export function ProfilePage() {
    const { user, plan, loading, logout, updateUserProfile } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            displayName: user?.displayName || '',
        }
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

    const getPlanBadge = () => {
        switch (plan) {
            case 'pro':
                return <Badge className="bg-amber-400/20 text-amber-500 border-amber-400/30"><Crown className="mr-2 h-4 w-4"/> Pro</Badge>;
            case 'recruiter':
                return <Badge className="bg-blue-400/20 text-blue-500 border-blue-400/30"><Handshake className="mr-2 h-4 w-4"/> Recruiter</Badge>;
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
        <div className="max-w-2xl mx-auto">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card>
                        <CardHeader>
                            <CardTitle>My Profile</CardTitle>
                            <CardDescription>Manage your account settings and subscription plan.</CardDescription>
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
                                    render={({ field }) => (
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

                            <div className="space-y-2">
                                <Label>Subscription Plan</Label>
                                <div className="flex items-center gap-4">
                                    {getPlanBadge()}
                                    {plan !== 'recruiter' && (
                                        <Button variant="outline" size="sm" onClick={() => router.push('/pricing')}>
                                            Upgrade Plan
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={handleLogout}>Log Out</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
