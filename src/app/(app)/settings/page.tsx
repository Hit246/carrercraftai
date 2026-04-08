'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Loader2, 
  Crown, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import Link from 'next/link';
import { updatePassword } from 'firebase/auth';

export default function SettingsPage() {
  const { user, userData, credits, effectivePlan, plan, updateUserProfile, logout } = useAuth();
  const { toast } = useToast();
  
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userData?.displayName) {
      setDisplayName(userData.displayName);
    } else if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [userData, user]);

  if (!mounted) return null;

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ displayName });
      toast({ title: "Profile Updated", description: "Your changes have been saved permanently." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newPassword || newPassword.length < 6) {
      toast({ title: "Invalid Password", description: "New password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(user, newPassword);
      toast({ title: "Password Changed", description: "Your security credentials have been updated." });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Password update error:", error);
      if (error.code === 'auth/requires-recent-login') {
        toast({ 
          title: "Session Expired", 
          description: "Please log out and log back in to change your password for security reasons.", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Update Failed", description: error.message || "Failed to update password. Please try again.", variant: "destructive" });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, subscription, and security.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md border border-border/40">
          <TabsTrigger value="profile" className="flex-1 gap-2 rounded-lg"><User className="w-4 h-4" /> Profile</TabsTrigger>
          <TabsTrigger value="subscription" className="flex-1 gap-2 rounded-lg"><CreditCard className="w-4 h-4" /> Billing</TabsTrigger>
          <TabsTrigger value="security" className="flex-1 gap-2 rounded-lg"><Shield className="w-4 h-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-muted/20 border border-dashed">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={userData?.photoURL || user?.photoURL || ''} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Change Avatar</Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10">Remove</Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tight">JPG, PNG, max 2MB.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="Full Name" 
                    className="h-11 rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={user?.email || ''} readOnly className="h-11 rounded-xl bg-muted/50 cursor-not-allowed" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 py-4 flex justify-between">
              <p className="text-xs text-muted-foreground italic">Last profile sync: Today</p>
              <Button className="btn-gradient px-8 h-11" onClick={handleProfileUpdate} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you want to be alerted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Credit usage warnings", desc: "Alert me when my AI credits are running low." },
                { label: "New feature announcements", desc: "Stay updated with the latest AI career tools." },
                { label: "Resume analysis complete", desc: "Get an email as soon as your PDF is audited." }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/40">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-amber-500" /> Current Plan
                    </CardTitle>
                    <CardDescription>Your active tier benefits.</CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary capitalize font-black">{plan}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span>AI Credits Used</span>
                    <span>{effectivePlan === 'pro' || effectivePlan === 'recruiter' ? '∞' : `${credits} / 50`}</span>
                  </div>
                  <Progress value={effectivePlan === 'pro' || effectivePlan === 'recruiter' ? 100 : (credits / 50) * 100} className="h-2" />
                </div>
                <div className="space-y-3">
                  {["Unlimited Resumes", "Advanced ATS Check", "Cover Letters", "Priority Support"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {item}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                {plan === 'free' ? (
                  <Button className="w-full btn-gradient h-11" asChild><Link href="/pricing">Upgrade Plan</Link></Button>
                ) : (
                  <Button className="w-full h-11" variant="outline" disabled>Manage Subscription</Button>
                )}
              </CardFooter>
            </Card>

            <Card className="border-border/40 flex flex-col justify-center items-center text-center p-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="font-bold">Billing Support</h3>
              <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Have questions about your payments or invoice?</p>
              <Button variant="link" className="mt-4 text-primary font-bold" asChild>
                <Link href="/support">Contact Support →</Link>
              </Button>
            </Card>
          </div>

          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your past transactions and invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              {userData?.paymentId ? (
                <div className="rounded-xl border border-border/40 overflow-hidden">
                  <div className="p-4 bg-muted/30 grid grid-cols-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Date</span>
                    <span>Plan</span>
                    <span>Amount</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="p-4 grid grid-cols-4 text-sm items-center border-t border-border/40">
                    <span className="font-medium">{userData.planUpdatedAt ? format(userData.planUpdatedAt.seconds * 1000, 'MMM dd, yyyy') : 'Recently'}</span>
                    <Badge variant="secondary" className="w-fit capitalize">{plan}</Badge>
                    <span className="font-bold">₹{userData.amountPaid || '---'}</span>
                    <Badge className="bg-green-500/10 text-green-500 ml-auto border-none">Success</Badge>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No transaction history found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Account Security</CardTitle>
              <CardDescription>Manage your credentials and login methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-background border shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Authentication Provider</p>
                    <p className="text-xs text-muted-foreground">Connected via {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-none">Connected</Badge>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input 
                        id="newPassword" 
                        type={showPasswords ? "text" : "password"} 
                        placeholder="Min. 6 characters" 
                        className="h-11 rounded-xl pr-10" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type={showPasswords ? "text" : "password"} 
                      placeholder="Repeat new password" 
                      className="h-11 rounded-xl" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="btn-gradient px-8 h-11" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating...</> : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2"><Trash2 className="w-5 h-5" /> Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">Once you delete your account, there is no going back. All your saved resumes, analysis history, and AI credits will be permanently removed.</p>
              <div className="flex items-center gap-4">
                <Button variant="destructive" className="h-11 rounded-xl font-bold" disabled>
                  Permanently Delete Account
                </Button>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 uppercase font-black text-[10px] tracking-widest px-3 py-1">
                  Coming Soon
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
