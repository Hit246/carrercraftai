'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Bot, Download, Edit, Rocket } from 'lucide-react';
import Image from 'next/image';
import { Progress } from './ui/progress';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps = [
  {
    title: 'Welcome to CareerCraft AI!',
    description: "Let's take a quick tour to see how you can build a stand-out resume.",
    icon: Rocket,
    image: '/tour/step1.png',
  },
  {
    title: 'Step 1: Edit Your Resume',
    description: 'This is the resume builder. You can edit all the fields on the left, and the live preview on the right will update instantly. Start by filling in your information.',
    icon: Edit,
    image: '/tour/step2.png',
  },
  {
    title: 'Step 2: Get AI Feedback',
    description: 'Once you are happy with your resume, click the "AI Analyze" button. Our AI will provide detailed feedback on strengths, weaknesses, and suggestions for improvement.',
    icon: Bot,
    image: '/tour/step3.png',
  },
  {
    title: 'Step 3: Download & Apply',
    description: 'After making improvements based on the AI feedback, click the "Export" button to download your professional resume as a PDF. You are now ready to apply for jobs!',
    icon: Download,
    image: '/tour/step4.png',
  },
];

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const currentStep = tourSteps[step];
  
  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose(); // End of tour
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 text-primary p-2 rounded-full">
              <currentStep.icon className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-headline">{currentStep.title}</DialogTitle>
          </div>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-lg border overflow-hidden">
             <Image src={currentStep.image} alt={currentStep.title} width={1200} height={700} className="w-full" data-ai-hint="guided tour step image" />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">{step + 1} / {tourSteps.length}</span>
          <Progress value={((step + 1) / tourSteps.length) * 100} className="flex-1" />
        </div>

        <DialogFooter>
          {step > 0 && (
            <Button variant="outline" onClick={handlePrev}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}
          <Button onClick={handleNext} className="ml-auto">
            {step === tourSteps.length - 1 ? 'Finish Tour' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    