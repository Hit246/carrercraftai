'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight, FileSearch, Sparkles } from 'lucide-react';
import { resumeScoreAction } from '@/lib/actions';
import type { ResumeScorerOutput } from '@/ai/flows/resume-scorer';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function ResumeScorePage() {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState<ResumeScorerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latestAts, setLatestAts] = useState<number | null>(null);
  const [lastResumeText, setLastResumeText] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch latest ATS score
    const atsRef = doc(db, 'users', user.uid, 'atsResults', 'latest');
    const unsubscribeAts = onSnapshot(atsRef, (snap) => {
      if (snap.exists()) setLatestAts(snap.data().overall_score);
    });

    // Fetch latest saved resume to use as default text
    const resumeQuery = query(collection(db, `users/${user.uid}/resumeVersions`), orderBy('updatedAt', 'desc'), limit(1));
    const unsubscribeResume = onSnapshot(resumeQuery, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data().resumeData;
        const text = `${data.name}\n${data.title}\n\nSUMMARY\n${data.summary}\n\nEXPERIENCE\n${data.experience.map((e: any) => `${e.title} at ${e.company}\n${e.description}`).join('\n')}\n\nSKILLS\n${data.skills}`;
        setLastResumeText(text);
      }
    });

    return () => {
      unsubscribeAts();
      unsubscribeResume();
    };
  }, [user]);

  const handleScore = async () => {
    if (!user || !lastResumeText) return;
    setIsLoading(true);
    try {
      const result = await resumeScoreAction({
        resumeText: lastResumeText,
        atsScore: latestAts || undefined
      });
      setScoreData(result);
      
      // Save to history
      await addDoc(collection(db, `users/${user.uid}/scoreHistory`), {
        ...result,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 70) return 'text-green-500';
    if (score > 40) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">CareerCraft Score</h1>
          <p className="text-muted-foreground">Deep professional audit of your resume quality.</p>
        </div>
        <Button size="lg" onClick={handleScore} disabled={isLoading || !lastResumeText}>
          {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Analyze My Quality
        </Button>
      </div>

      {!latestAts && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-500 h-5 w-5" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Run the <strong>ATS Optimizer</strong> first to integrate keyword accuracy into your total score.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild className="border-amber-500 text-amber-700 hover:bg-amber-100">
              <Link href="/ats-optimizer">Run ATS Check</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-bold">Evaluating 23 Professional Checkpoints...</h2>
          <p className="text-muted-foreground max-w-sm">We are analyzing your bullet points, action verbs, and quantified achievements.</p>
        </div>
      )}

      {scoreData && (
        <div className="grid gap-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-1 flex flex-col items-center justify-center p-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="2" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className={cn("stroke-current transition-all duration-1000", getScoreColor(scoreData.totalScore))} strokeWidth="2" strokeDasharray={`${scoreData.totalScore}, 100`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn("text-5xl font-black", getScoreColor(scoreData.totalScore))}>{scoreData.totalScore}</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Quality Score</span>
                </div>
              </div>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {scoreData.categories.map((cat) => (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{cat.name}</span>
                      <span className="text-muted-foreground">{cat.score} / {cat.maxScore}</span>
                    </div>
                    <Progress value={(cat.score / cat.maxScore) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="text-primary h-5 w-5"/> Priority Fixes</CardTitle>
                <CardDescription>Fix these to see the biggest score jump.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {scoreData.criticalFixes.map((fix, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">{i+1}</div>
                      {fix}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><CheckCircle2 className="text-green-500 h-5 w-5"/> Improvement Path</h3>
              {scoreData.categories.map((cat) => cat.suggestions.length > 0 && (
                <div key={cat.name} className="p-4 border rounded-lg bg-card">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{cat.name}</p>
                  <ul className="space-y-2">
                    {cat.suggestions.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!scoreData && !isLoading && (
        <Card className="flex flex-col items-center justify-center p-20 text-center border-dashed">
          <FileSearch className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h2 className="text-xl font-bold">Ready for an Audit?</h2>
          <p className="text-muted-foreground max-w-sm mt-2">
            Our AI will scan your latest resume draft for impact, metrics, and professional strength.
          </p>
          <Button onClick={handleScore} className="mt-6" disabled={!lastResumeText}>
            Analyze Latest Draft
          </Button>
        </Card>
      )}
    </div>
  );
}
