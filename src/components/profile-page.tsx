
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { 
    Crown, 
    User, 
    Handshake, 
    Loader2, 
    ShieldCheck, 
    Hourglass, 
    Ban, 
    Calendar, 
    BotIcon, 
    Timer,
    CheckCircle2,
    Info,
    Receipt,
    CreditCard,
    Tag
} from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { uploadFile } from '@/lib/firebase';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { addDays, differenceInDays, format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const formSchema = z.object({
    displayName: z.string().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
    phoneNumber: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).optional(),
    photoFile: z.instanceof(File).optional(),
});

const PLAN_BENEFITS = {
    free: ["5 AI Credits", "2 Resume Drafts", "Classic Template"],
    essentials: ["50 AI Credits", "10 Resume Drafts", "ATS Keywords", "Email Support"],
    pro: ["Unlimited AI Credits", "Unlimited Drafts", "Advanced Templates", "Priority Support"],
    recruiter: ["Unlimited AI Credits", "Candidate Matcher", "Recruiter Dashboard", "Talent Analytics"]
};

export function ProfilePage() {
    const { user, plan, loading, userData, credits, effectivePlan, logout, updateUserProfile, requestCancellation } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const expirationInfo = useMemo(() => {
        if (!userData?.planUpdatedAt || effectivePlan === 'free') return null;
        
        let upgradeDate: Date;
        if (userData.planUpdatedAt?.toDate) {
            upgradeDate = userData.planUpdatedAt.toDate();
        } else if (userData.planUpdatedAt?.seconds) {
            upgradeDate = new Date(userData.planUpdatedAt.seconds * 1000);
        } else {
            upgradeDate = new Date(userData.planUpdatedAt);
        }

        const expirationDate = addDays(upgradeDate, 30);
        const daysRemaining = differenceInDays(expirationDate, new Date());

        return {
            date: expirationDate,
            daysRemaining: daysRemaining < 0 ? 0 : daysRemaining,
            isNearExpiry: daysRemaining <= 7,
            isExpired: daysRemaining < 0
        };
    }, [userData, effectivePlan]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            displayName: userData?.displayName || user?.displayName || '',
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
            let photoURL: string | undefined = userData?.photoURL || user.photoURL || undefined;

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
            setPhotoPreview(null);
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
                description: 'Your request has been submitted.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit request.',
                variant: 'destructive',
            });
        }
    }

    const getPlanBadge = () => {
        switch (plan) {
            case 'essentials':
                return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"><User className="mr-2 h-3.5 w-3.5"/> Essentials</Badge>;
            case 'pro':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300"><Crown className="mr-2 h-3.5 w-3.5"/> Pro</Badge>;
            case 'recruiter':
                return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300"><Handshake className="mr-2 h-3.5 w-3.5"/> Recruiter</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse"><Hourglass className="mr-2 h-3.5 w-3.5"/> Pending Approval</Badge>;
             case 'cancellation_requested':
                return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200"><Ban className="mr-2 h-3.5 w-3.5"/> Cancellation Pending</Badge>;
            default:
                return <Badge variant="outline" className="text-muted-foreground"><User className="mr-2 h-3.5 w-3.5"/> Free Plan</Badge>;
        }
    }

    if (loading || !user) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></CardContent></Card>
                    </div>
                    <Card><CardHeader><Skeleton className="h-8 w-full" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
             {plan === 'pending' && (
                <Alert variant="default" className="border-yellow-400/50 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-500 [&>svg]:text-yellow-600">
                    <Hourglass className="h-4 w-4"/>
                    <AlertTitle className="font-bold">Your Upgrade is Pending</AlertTitle>
                    <AlertDescription>
                        An administrator is reviewing your payment. You will receive an email once your {userData?.requestedPlan || 'Pro'} plan is activated.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid md:grid-cols-12 gap-8">
                <div className="md:col-span-7 space-y-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Personal Profile</CardTitle>
                                    <CardDescription>Manage your public identity and contact information.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-muted/30 border border-dashed">
                                        <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                                            <AvatarImage src={photoPreview || userData?.photoURL || user.photoURL || `https://placehold.co/200x200.png?text=${user.email?.[0].toUpperCase()}`} />
                                            <AvatarFallback className="text-2xl">{user.email?.[0].toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-3 flex-1 w-full text-center sm:text-left">
                                            <Label className="text-sm font-semibold">Profile Picture</Label>
                                            <Input
                                                type="file"
                                                className="h-9 cursor-pointer"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                            />
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tight font-bold">JPG, PNG or WEBP. Max 2MB.</p>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="displayName"
                                            render={({ field }) => (
                                            <FormItem>
                                                <Label className="text-xs uppercase font-bold text-muted-foreground">Display Name</Label>
                                                <FormControl>
                                                    <Input placeholder="Your Full Name" {...field} className="h-10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Account Email</Label>
                                            <div className="relative">
                                                <Input id="email" value={user.email || ''} readOnly disabled className="bg-muted/50 h-10 pl-9" />
                                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                        <FormItem>
                                            <Label className="text-xs uppercase font-bold text-muted-foreground">Phone Number (Required for Payments)</Label>
                                            <FormControl>
                                                <Input type="tel" placeholder="e.g. 9876543210" {...field} className="h-10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter className="flex justify-between bg-muted/10 border-t py-4">
                                    <Button variant="ghost" size="sm" type="button" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">Log Out Account</Button>
                                    <Button type="submit" size="sm" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isSaving ? 'Updating...' : 'Save Changes'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>

                    <Card className="shadow-md overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl flex items-center gap-2"><Receipt className="h-5 w-5 text-primary"/> Billing & Payment Details</CardTitle>
                            <CardDescription>Your transaction history and billing configuration.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(plan === 'free' || plan === 'pending') && !userData?.paymentId ? (
                                <div className="p-8 text-center space-y-3">
                                    <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/30" />
                                    <div className="space-y-1">
                                        <p className="font-semibold text-sm">No payment records found</p>
                                        <p className="text-xs text-muted-foreground">Upgrade your plan to see billing history and receipts.</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => router.push('/pricing')}>View Pricing</Button>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                <ShieldCheck className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Secure Razorpay Payment</p>
                                                <p className="text-[10px] text-muted-foreground font-mono uppercase">ID: {userData?.paymentId || 'WH_SUCCESS'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold">₹{userData?.amountPaid || '---'}</p>
                                                {(userData?.festiveDiscount || userData?.promoDiscount) && (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6"><Info className="h-3.5 w-3.5"/></Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-56 text-xs p-3">
                                                            <p className="font-bold mb-2 uppercase text-[10px] text-muted-foreground">Savings Applied</p>
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between"><span>Base Price</span><span>₹{userData?.basePrice || '---'}</span></div>
                                                                {userData?.festiveDiscount ? <div className="flex justify-between text-green-600"><span>Festive Sale</span><span>-{userData.festiveDiscount}%</span></div> : null}
                                                                {userData?.promoDiscount ? <div className="flex justify-between text-blue-600"><span>Promo ({userData.appliedPromoCode})</span><span>-{userData.promoDiscount}%</span></div> : null}
                                                                <div className="border-t pt-1 flex justify-between font-bold text-primary"><span>Final Paid</span><span>₹{userData?.amountPaid}</span></div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="text-[10px] h-5 py-0 px-1 bg-green-50 text-green-700 border-green-200">Paid</Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-muted/5">
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">Billing Date</p>
                                                <p className="font-medium">{userData?.planUpdatedAt ? format(new Date(userData.planUpdatedAt.seconds * 1000), 'MMM d, yyyy') : 'N/A'}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-muted-foreground">Currency</p>
                                                <p className="font-medium">INR (₹)</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-5 space-y-8">
                    <Card className="shadow-md border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /> Current Plan</span>
                                {getPlanBadge()}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-background border flex flex-col items-center justify-center text-center space-y-1">
                                    <BotIcon className="h-5 w-5 text-primary" />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Credits</p>
                                    <p className="text-lg font-black">{effectivePlan === 'pro' || effectivePlan === 'recruiter' ? '∞' : credits}</p>
                                    <p className="text-[9px] text-muted-foreground">{effectivePlan === 'pro' || effectivePlan === 'recruiter' ? 'Unlimited Access' : 'Available units'}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-background border flex flex-col items-center justify-center text-center space-y-1">
                                    <Timer className={cn("h-5 w-5", expirationInfo?.isNearExpiry ? "text-amber-500" : "text-primary")} />
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Renewal In</p>
                                    <p className="text-lg font-black">{expirationInfo ? `${expirationInfo.daysRemaining}d` : '---'}</p>
                                    <p className="text-[9px] text-muted-foreground">30-day cycle</p>
                                </div>
                            </div>

                            {expirationInfo && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border text-xs">
                                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">Subscription Renews on:</span>
                                    <span className="font-bold ml-auto">{format(expirationInfo.date, 'MMM d, yyyy')}</span>
                                </div>
                            )}

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Info className="h-3 w-3" /> Included in your plan
                                </p>
                                <ul className="grid gap-2">
                                    {(PLAN_BENEFITS[effectivePlan as keyof typeof PLAN_BENEFITS] || PLAN_BENEFITS.free).map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs font-medium">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3 pt-0">
                            {effectivePlan !== 'recruiter' && (
                                <Button className="w-full shadow-lg shadow-primary/20" onClick={() => router.push('/pricing')}>
                                    <Crown className="mr-2 h-4 w-4" /> Upgrade Plan
                                </Button>
                            )}
                            
                            {(plan !== 'free' && plan !== 'pending' && plan !== 'cancellation_requested') && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-[10px] h-8 font-bold uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/5" 
                                    onClick={handleCancellation}
                                >
                                    Request Subscription Cancellation
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    <Card className="shadow-md overflow-hidden">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm">Plan Comparisons</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y text-[11px]">
                                <div className="p-3 flex justify-between bg-muted/30">
                                    <span className="font-bold">Feature</span>
                                    <span className="font-bold w-20 text-center">Pro</span>
                                    <span className="font-bold w-20 text-center">Recruiter</span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-muted-foreground">AI Resume Credits</span>
                                    <span className="w-20 text-center font-medium">Unlimited</span>
                                    <span className="w-20 text-center font-medium">Unlimited</span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-muted-foreground">Resume Versions</span>
                                    <span className="w-20 text-center font-medium">Unlimited</span>
                                    <span className="w-20 text-center font-medium">Unlimited</span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-muted-foreground">Candidate Ranking</span>
                                    <span className="w-20 text-center">—</span>
                                    <span className="w-20 text-center text-green-600 font-bold">Included</span>
                                </div>
                                <div className="p-3 flex justify-between items-center">
                                    <span className="text-muted-foreground">Analytics Dash</span>
                                    <span className="w-20 text-center">—</span>
                                    <span className="w-20 text-center text-green-600 font-bold">Included</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
