'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Shield, 
  Loader2, 
  Crown, 
  CheckCircle2, 
  AlertCircle,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Upload,
  X,
  Timer,
  Calendar,
  BotIcon,
  Info,
  Receipt,
  Handshake,
  Ban
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { updatePassword } from 'firebase/auth';
import { uploadFile } from '@/lib/firebase';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const PLAN_BENEFITS = {
    free: ["5 AI Credits", "2 Resume Drafts", "Classic Template"],
    essentials: ["50 AI Credits", "10 Resume Drafts", "ATS Keywords", "Email Support"],
    pro: ["Unlimited AI Credits", "Unlimited Drafts", "Advanced Templates", "Priority Support"],
    recruiter: ["Unlimited AI Credits", "Candidate Matcher", "Recruiter Dashboard", "Talent Analytics"]
};

export default function SettingsPage() {
  const { user, userData, credits, effectivePlan, plan, updateUserProfile, requestCancellation, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userData) {
      setDisplayName(userData.displayName || '');
      setPhoneNumber(userData.phoneNumber || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [userData, user]);

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

  if (!mounted) return null;

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({ displayName, phoneNumber });
      toast({ title: "Profile Updated", description: "Your changes have been saved permanently." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Image must be under 2MB.", variant: "destructive" });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const downloadURL = await uploadFile(file, `avatars/${user.uid}/${Date.now()}-${file.name}`);
      await updateUserProfile({ photoURL: downloadURL });
      toast({ title: "Avatar Updated", description: "Your profile picture has been changed." });
    } catch (error) {
      toast({ title: "Upload Failed", description: "Could not upload image.", variant: "destructive" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      await updateUserProfile({ photoURL: null });
      toast({ title: "Avatar Removed", description: "Your profile picture has been cleared." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove avatar.", variant: "destructive" });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancellationRequest = async () => {
    try {
        await requestCancellation();
        toast({ title: 'Cancellation Requested', description: 'Your request has been submitted for review.' });
    } catch (error) {
        toast({ title: 'Error', description: 'Failed to submit request.', variant: 'destructive' });
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
      if (error.code === 'auth/requires-recent-login') {
        toast({ 
          title: "Session Expired", 
          description: "Please log out and log back in to change your password for security reasons.", 
          variant: "destructive" 
        });
      } else {
        toast({ title: "Update Failed", description: error.message || "Failed to update password.", variant: "destructive" });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">Manage your identity, billing, and security.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl h-12 w-full max-w-md border border-border/40">
          <TabsTrigger value="profile" className="flex-1 gap-2 rounded-lg"><User className="w-4 h-4" /> Profile</TabsTrigger>
          <TabsTrigger value="billing" className="flex-1 gap-2 rounded-lg"><CreditCard className="w-4 h-4" /> Billing</TabsTrigger>
          <TabsTrigger value="security" className="flex-1 gap-2 rounded-lg"><Shield className="w-4 h-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary"/> Personal Information</CardTitle>
              <CardDescription>Update your public profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-muted/20 border border-dashed border-border/60">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl shrink-0">
                  <AvatarImage src={userData?.photoURL || user?.photoURL || ''} />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {(userData?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-3 flex-1 w-full text-center sm:text-left">
                  <Label className="font-bold text-sm">Profile Photo</Label>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                    <Button size="sm" variant="outline" onClick={() => document.getElementById('avatar-upload')?.click()} className="h-9 font-bold px-4" disabled={isUploadingPhoto}>
                      {isUploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                      Change Avatar
                    </Button>
                    {(userData?.photoURL || user?.photoURL) && (
                      <Button size="sm" variant="ghost" className="h-9 text-destructive hover:bg-destructive/10 font-bold px-4" onClick={handleRemovePhoto} disabled={isUploadingPhoto}>
                        <X className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tight">JPG, PNG or WEBP. Max 2MB.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Full Name" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input id="email" value={user?.email || ''} readOnly className="h-11 rounded-xl bg-muted/50 cursor-not-allowed pl-9" />
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. 9876543210" className="h-11 rounded-xl" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground italic">Profile synced with cloud vault</p>
              <Button className="btn-gradient px-10 h-11 font-bold w-full sm:w-auto" onClick={handleProfileUpdate} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl flex items-center gap-2"><Receipt className="h-5 w-5 text-primary"/> Billing History</CardTitle>
                <CardDescription>Your past transactions and invoices.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {!userData?.paymentId ? (
                    <div className="p-12 text-center space-y-3">
                        <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/30" />
                        <div className="space-y-1">
                            <p className="font-semibold text-sm">No payment records found</p>
                            <p className="text-xs text-muted-foreground">Upgrade your plan to see billing history and receipts.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push('/pricing')}>View Plans</Button>
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
                                    <p className="text-[10px] text-muted-foreground font-mono uppercase">ID: {userData?.paymentId}</p>
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
                                    <p className="font-medium">{userData?.planUpdatedAt ? format(new Date(userData.planUpdatedAt.seconds * 1000), 'MMM d, yyyy') : 'Recently'}</p>
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
        </TabsContent>

        <TabsContent value="billing" className="space-y-8">
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
                <Card className="shadow-md border-primary/20 bg-primary/5 h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2"><Crown className="h-5 w-5 text-amber-500" /> Subscription Status</span>
                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary capitalize font-black">{plan}</Badge>
                        </CardTitle>
                        <CardDescription>Your active tier benefits and renewal info.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-background border flex flex-col items-center justify-center text-center space-y-1 shadow-sm">
                                <BotIcon className="h-5 w-5 text-primary" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AI Credits</p>
                                <p className="text-xl font-black">{effectivePlan === 'pro' || effectivePlan === 'recruiter' ? '∞' : credits}</p>
                                <p className="text-[9px] text-muted-foreground">Available units</p>
                            </div>
                            <div className="p-4 rounded-xl bg-background border flex flex-col items-center justify-center text-center space-y-1 shadow-sm">
                                <Timer className={cn("h-5 w-5", expirationInfo?.isNearExpiry ? "text-amber-500" : "text-primary")} />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Renewal In</p>
                                <p className="text-xl font-black">{expirationInfo ? `${expirationInfo.daysRemaining}d` : '---'}</p>
                                <p className="text-[9px] text-muted-foreground">30-day cycle</p>
                            </div>
                        </div>

                        {expirationInfo && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50 border text-xs">
                                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">Renews on:</span>
                                <span className="font-bold ml-auto">{format(expirationInfo.date, 'MMM d, yyyy')}</span>
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Info className="h-3 w-3" /> Included in your plan
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        {plan === 'free' ? (
                            <Button className="w-full btn-gradient h-11" onClick={() => router.push('/pricing')}>Upgrade Plan</Button>
                        ) : plan !== 'pending' && plan !== 'cancellation_requested' ? (
                            <Button variant="outline" size="sm" className="w-full text-[10px] h-8 font-black uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={handleCancellationRequest}>
                                Request Subscription Cancellation
                            </Button>
                        ) : null}
                    </CardFooter>
                </Card>
            </div>

            <div className="md:col-span-5 space-y-6">
                <Card className="border-border/40 flex flex-col justify-center items-center text-center p-8 bg-card/50 shadow-sm">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="font-bold">Billing Support</h3>
                    <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">Have questions about your payments or invoice?</p>
                    <Button variant="link" className="mt-4 text-primary font-bold" onClick={() => router.push('/support')}>
                        Contact Support →
                    </Button>
                </Card>

                <Card className="shadow-sm overflow-hidden">
                    <CardHeader className="py-4 border-b">
                        <CardTitle className="text-sm">Plan Comparison</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y text-[11px]">
                            <div className="p-3 flex justify-between bg-muted/30">
                                <span className="font-bold">Feature</span>
                                <span className="font-bold w-12 text-center text-primary">Pro</span>
                                <span className="font-bold w-12 text-center text-indigo-500">Rec.</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-muted-foreground">AI Credits</span>
                                <span className="w-12 text-center font-bold">∞</span>
                                <span className="w-12 text-center font-bold">∞</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-muted-foreground">Resume Count</span>
                                <span className="w-12 text-center font-bold">∞</span>
                                <span className="w-12 text-center font-bold">∞</span>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                                <span className="text-muted-foreground">Talent Tools</span>
                                <span className="w-12 text-center">—</span>
                                <span className="w-12 text-center text-green-600 font-bold">Yes</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Security Center</CardTitle>
              <CardDescription>Manage your credentials and login methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-background border shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Authentication Method</p>
                    <p className="text-xs text-muted-foreground">Connected via {user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</p>
                  </div>
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-none">Secure</Badge>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-4 border-t">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input id="newPassword" type={showPasswords ? "text" : "password"} placeholder="Min. 6 characters" className="h-11 rounded-xl pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type={showPasswords ? "text" : "password"} placeholder="Repeat new password" className="h-11 rounded-xl" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="btn-gradient px-8 h-11 font-bold" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating...</> : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5 relative overflow-hidden shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-destructive flex items-center gap-2"><Trash2 className="w-5 h-5" /> Danger Zone</CardTitle>
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 uppercase font-black text-[10px] tracking-widest px-3 py-1">
                  Coming Soon
                </Badge>
              </div>
              <CardDescription>Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">Once you delete your account, there is no going back. All your saved resumes, analysis history, and AI credits will be permanently removed from our secure servers.</p>
              <div className="flex items-center gap-4">
                <Button variant="destructive" className="h-11 rounded-xl font-bold opacity-50 cursor-not-allowed" disabled>
                  Permanently Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
