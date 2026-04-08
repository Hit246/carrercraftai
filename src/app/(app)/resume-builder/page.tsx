'use client';

import React from 'react';
import { ResumeBuilder } from '@/components/resume-builder';

export default function ResumeBuilderPage() {
  return (
    <div className="h-full bg-background flex flex-col">
      <ResumeBuilder />
    </div>
  );
}
