'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Crown, User, Handshake } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function ProfilePage() {
    const { user, plan, loading, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
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
            <Card>
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                    <CardDescription>Manage your account settings and subscription plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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
                </CardFooter>
            </Card>
        </div>
    );
}
