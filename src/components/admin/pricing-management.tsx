'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, collection, onSnapshot, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth'; // ✅ ADDED: was missing from imports
import { Loader2, Save, Trash2, Plus, Tag, PartyPopper } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface PricingSettings {
  essentials: number;
  pro: number;
  recruiter: number;
  festiveDiscount: number;
  festiveName: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount: number;
  expiresAt: any;
}

export function PricingManagement() {
  const [settings, setSettings] = useState<PricingSettings>({
    essentials: 199,
    pro: 399,
    recruiter: 999,
    festiveDiscount: 0,
    festiveName: '',
  });
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth(); // ✅ ADDED

  // New Promo Code Form State
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(0);

  useEffect(() => {
    if (!user) return; // ✅ FIXED: guard prevents firing before auth resolves

    const fetchPricing = async () => {
      try {
        const docRef = doc(db, 'settings', 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as PricingSettings;
          setSettings({
            essentials: data.essentials ?? 199,
            pro: data.pro ?? 399,
            recruiter: data.recruiter ?? 999,
            festiveDiscount: data.festiveDiscount ?? 0,
            festiveName: data.festiveName ?? '',
          });
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
      }
    };

    const unsubscribePromo = onSnapshot(
      collection(db, 'promoCodes'),
      (snapshot) => {
        setPromoCodes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PromoCode)));
        setIsLoading(false);
      },
      (error) => {
        // ✅ FIXED: error handler prevents unhandled permission errors in console
        console.error("Promo snapshot error:", error);
        setIsLoading(false);
      }
    );

    fetchPricing();
    return () => unsubscribePromo();
  }, [user]); // ✅ FIXED: re-runs when auth state resolves (was [])

  const handleSavePricing = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'pricing'), settings);
      toast({ title: 'Pricing Updated', description: 'Base prices and festive discounts have been saved.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save pricing.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPromo = async () => {
    if (!newCode) return;
    try {
      const code = newCode.toUpperCase().trim();
      await setDoc(doc(db, 'promoCodes', code), {
        code,
        discount: newDiscount,
        createdAt: serverTimestamp(),
      });
      setNewCode('');
      setNewDiscount(0);
      toast({ title: 'Promo Code Created', description: `Code ${code} is now active.` });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to create promo code.', variant: 'destructive' });
    }
  };

  const handleDeletePromo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'promoCodes', id));
      toast({ title: 'Promo Deleted' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Base Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Tag /> Base Plan Prices</CardTitle>
            <CardDescription>Set the standard monthly price for each tier.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Essentials Plan (₹)</Label>
              <Input type="number" value={settings.essentials ?? 0} onChange={e => setSettings({...settings, essentials: parseInt(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Pro Plan (₹)</Label>
              <Input type="number" value={settings.pro ?? 0} onChange={e => setSettings({...settings, pro: parseInt(e.target.value) || 0})} />
            </div>
            <div className="space-y-2">
              <Label>Recruiter Plan (₹)</Label>
              <Input type="number" value={settings.recruiter ?? 0} onChange={e => setSettings({...settings, recruiter: parseInt(e.target.value) || 0})} />
            </div>
            <Button onClick={handleSavePricing} disabled={isSaving} className="w-full">
              {isSaving ? <Loader2 className="animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Base Prices
            </Button>
          </CardContent>
        </Card>

        {/* Festive Discount */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary"><PartyPopper /> Festive Discounts</CardTitle>
            <CardDescription>Apply a global percentage discount for a limited time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Discount Name (e.g., Diwali Sale)</Label>
              <Input placeholder="Enter occasion name" value={settings.festiveName || ''} onChange={e => setSettings({...settings, festiveName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Discount Percentage (%)</Label>
              <Input type="number" min="0" max="100" value={settings.festiveDiscount ?? 0} onChange={e => setSettings({...settings, festiveDiscount: parseInt(e.target.value) || 0})} />
            </div>
            <p className="text-xs text-muted-foreground italic">Note: Set to 0 to disable global discounts.</p>
            <Button onClick={handleSavePricing} variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
              Apply Global Discount
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Promo Code Management */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Codes</CardTitle>
          <CardDescription>Create unique codes for specific users or influencers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label>New Code</Label>
              <Input placeholder="SAVE50" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} />
            </div>
            <div className="space-y-2 w-[150px]">
              <Label>Discount (%)</Label>
              <Input type="number" value={newDiscount ?? 0} onChange={e => setNewDiscount(parseInt(e.target.value) || 0)} />
            </div>
            <Button onClick={handleAddPromo} className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Create Code</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No promo codes active.</TableCell></TableRow>
              ) : promoCodes.map(promo => (
                <TableRow key={promo.id}>
                  <TableCell><Badge variant="outline" className="text-sm font-mono">{promo.code}</Badge></TableCell>
                  <TableCell>{promo.discount}% Off</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeletePromo(promo.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}