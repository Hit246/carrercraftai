'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  ChevronLeft, 
  Save, 
  Download, 
  Loader2, 
  Plus, 
  Trash2, 
  Layout, 
  History,
  FileText,
  Sparkles,
  GripVertical
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ResumeBuilder } from '@/components/resume-builder';

// We override the standard layout padding for the builder
export default function ResumeBuilderPage() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <ResumeBuilder />
    </div>
  );
}