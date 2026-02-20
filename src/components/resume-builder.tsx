'use client';
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Download, Bot, Save, Loader2, Link as LinkIcon, History, ChevronsUpDown, Crown, MoreVertical, FileJson } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';
import jsPDF from 'jspdf';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { suggestResumeVersionNameAction } from '@/lib/actions';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface Experience {
    id: number;
    title: string;
    company: string;
    dates: string;
    description: string;
}

interface Education {
    id: number;
    school: string;
    degree: string;
    dates: string;
    cgpa?: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    url: string;
    technologies: string;
}

interface ResumeData {
    name: string;
    title: string;
    phone: string;
    email: string;
    linkedin: string;
    summary: string;
    experience: Experience[];
    education: Education[];
    skills: string;
    projects: Project[];
}

interface ResumeVersion {
    id: string;
    versionName: string;
    updatedAt: any;
    resumeData: ResumeData;
}

const emptyResumeData: ResumeData = {
    name: '',
    title: '',
    phone: '',
    email: '',
    linkedin: '',
    summary: '',
    experience: [],
    education: [],
    skills: '',
    projects: []
};

const sampleResumeData: ResumeData = {
    name: 'John Doe',
    title: 'Software Engineer',
    phone: '123-456-7890',
    email: 'john.doe@email.com',
    linkedin: 'linkedin.com/in/johndoe',
    summary: 'A passionate software engineer with 5+ years of experience in building scalable web applications.',
    experience: [
        { id: 1, title: 'Senior Developer', company: 'Tech Corp', dates: '2020 - Present', description: '- Led development of cloud platforms.\n- Improved performance by 30%.' }
    ],
    education: [{ id: 1, school: 'University of Tech', degree: 'B.S. CS', dates: '2014 - 2018', cgpa: '3.8/4.0' }],
    skills: 'React, Node.js, TypeScript',
    projects: []
};

export const ResumeBuilder = () => {
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading: authLoading, plan, credits, useCredit } = useAuth();
    const [resumeData, setResumeData] = React.useState<ResumeData>(emptyResumeData);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const resumePreviewRef = React.useRef<HTMLDivElement>(null);
    const [versions, setVersions] = React.useState<ResumeVersion[]>([]);
    const [currentVersion, setCurrentVersion] = React.useState<ResumeVersion | null>(null);
    const [versionManagerOpen, setVersionManagerOpen] = React.useState(false);
    const [draftLimit, setDraftLimit] = React.useState(2);

    React.useEffect(() => {
        if (plan === 'essentials') setDraftLimit(10);
        else if (plan === 'pro' || plan === 'recruiter') setDraftLimit(Infinity);
        else setDraftLimit(2);
    }, [plan]);

    React.useEffect(() => {
        if (authLoading || !user) return;

        setIsLoading(true);
        const versionsQuery = query(collection(db, `users/${user.uid}/resumeVersions`), orderBy('updatedAt', 'desc'));

        const unsubscribe = onSnapshot(versionsQuery, (snapshot) => {
            if (snapshot.empty) {
                setVersions([]);
                if (!currentVersion) {
                    setResumeData({ ...emptyResumeData, email: user.email || '' });
                }
            } else {
                const fetchedVersions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeVersion));
                setVersions(fetchedVersions);

                if (!currentVersion) {
                    const latest = fetchedVersions[0];
                    setCurrentVersion(latest);
                    setResumeData(latest.resumeData);
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching resume versions: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, currentVersion]);

    const handleAddExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now(), title: '', company: '', dates: '', description: '' }]
        }));
    };
    
    const handleRemoveExperience = (id: number) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    const handleAddEducation = () => {
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, { id: Date.now(), school: '', degree: '', dates: '', cgpa: '' }]
        }));
    };

    const handleRemoveEducation = (id: number) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    const handleAddProject = () => {
        setResumeData(prev => ({
            ...prev,
            projects: [...(prev.projects || []), { id: Date.now(), name: '', description: '', url: '', technologies: '' }]
        }));
    };

    const handleRemoveProject = (id: number) => {
        setResumeData(prev => ({
            ...prev,
            projects: prev.projects.filter(proj => proj.id !== id)
        }));
    };
    
    const canUseFeature = plan !== 'free' || credits > 0;

     const generatePdfFromData = useCallback(async () => {
        if (!resumeData) return null;

        const doc = new jsPDF({
            orientation: 'p',
            unit: 'pt',
            format: 'a4'
        });
        
        const pageW = doc.internal.pageSize.getWidth();
        const margin = 40;
        let y = margin;
        const lineSpacing = 1.25;

        const primaryColor = '#6d28d9'; 
        const textColor = '#374151';
        const lightTextColor = '#6b7280';
        
        doc.setFont('helvetica', 'normal');

        if(resumeData.name) {
            doc.setFontSize(28).setFont('helvetica', 'bold');
            doc.setTextColor(textColor);
            doc.text(resumeData.name, pageW / 2, y, { align: 'center' });
            y += 30;
        }

        if(resumeData.title) {
            doc.setFontSize(14).setFont('helvetica', 'normal');
            doc.setTextColor(primaryColor);
            doc.text(resumeData.title, pageW / 2, y, { align: 'center' });
            y += 20;
        }

        doc.setFontSize(9);
        doc.setTextColor(primaryColor);

        const contactInfo = [resumeData.phone, resumeData.email, resumeData.linkedin].filter(Boolean);
        const contactInfoString = contactInfo.join('  |  ');
        const totalWidth = doc.getStringUnitWidth(contactInfoString) * doc.getFontSize();
        let currentX = (pageW - totalWidth) / 2;

        if (resumeData.phone) {
            doc.textWithLink(resumeData.phone, currentX, y, { url: `tel:${resumeData.phone}` });
            currentX += doc.getTextWidth(resumeData.phone) + doc.getTextWidth('  |  ');
        }
        if (resumeData.email) {
            doc.textWithLink(resumeData.email, currentX, y, { url: `mailto:${resumeData.email}` });
            currentX += doc.getTextWidth(resumeData.email) + doc.getTextWidth('  |  ');
        }
        if (resumeData.linkedin) {
            const linkedInUrl = resumeData.linkedin.startsWith('http') ? resumeData.linkedin : `https://${resumeData.linkedin}`;
            doc.textWithLink(resumeData.linkedin, currentX, y, { url: linkedInUrl });
        }
        y += 15;

        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageW - margin, y);
        y += 25;

        const addSection = (title: string) => {
            if (y > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                y = margin;
            }
            doc.setFontSize(11).setFont('helvetica', 'bold');
            doc.setTextColor(primaryColor);
            doc.text(title.toUpperCase(), margin, y);
            y += 8;
            doc.setDrawColor(229, 231, 235);
            doc.line(margin, y, pageW - margin, y);
            y += 15;
        };
        
        const addWrappedText = (text: string, x: number, startY: number, options: { maxWidth: number, fontSize: number, style?: 'normal' | 'bold', color?: string, lineSpacing?: number }) => {
            doc.setFontSize(options.fontSize).setFont('helvetica', options.style || 'normal');
            doc.setTextColor(options.color || textColor);
            const lines = doc.splitTextToSize(text, options.maxWidth);
            doc.text(lines, x, startY, {lineHeightFactor: options.lineSpacing || lineSpacing});
            return startY + (lines.length * options.fontSize * (options.lineSpacing || lineSpacing));
        };

        if (resumeData.summary) {
            addSection('Summary');
            y = addWrappedText(resumeData.summary, margin, y, { maxWidth: pageW - margin * 2, fontSize: 10 });
            y += 15;
        }

        if (resumeData.experience?.length > 0) {
            addSection('Experience');
            resumeData.experience.forEach(exp => {
                if (!exp.title && !exp.company) return;
                doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                doc.text(exp.title, margin, y);
                doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(lightTextColor);
                doc.text(exp.dates, pageW - margin, y, { align: 'right'});
                y += 14 * lineSpacing;
                doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(textColor);
                doc.text(exp.company, margin, y);
                y += 14 * lineSpacing;
                doc.setFontSize(10).setTextColor(lightTextColor);
                const bulletPoints = exp.description.split('\n').filter(Boolean);
                bulletPoints.forEach(point => {
                    y = addWrappedText(`• ${point.replace(/^-/, '').trim()}`, margin + 10, y, { maxWidth: pageW - margin * 2 - 10, fontSize: 10 });
                });
                y += 15;
            });
        }

        if(resumeData.projects?.length > 0) {
            addSection('Projects');
            resumeData.projects.forEach(proj => {
                if (!proj.name) return;
                doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                doc.text(proj.name, margin, y);
                y += 14 * lineSpacing;
                const bulletPoints = proj.description.split('\n').filter(Boolean);
                bulletPoints.forEach(point => {
                    y = addWrappedText(`• ${point.replace(/^-/, '').trim()}`, margin + 10, y, { maxWidth: pageW - margin * 2 - 10, fontSize: 10, color: lightTextColor });
                });
                y += 15;
            });
        }

        if (resumeData.education?.length > 0) {
            addSection('Education');
            resumeData.education.forEach(edu => {
                if (!edu.school) return;
                doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                doc.text(edu.school, margin, y);
                doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(lightTextColor);
                doc.text(edu.dates, pageW - margin, y, { align: 'right'});
                y += 14 * lineSpacing;
                doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(textColor);
                doc.text(`${edu.degree} ${edu.cgpa ? `(CGPA: ${edu.cgpa})` : ''}`, margin, y);
                y += 15;
            });
        }
        
        if (resumeData.skills) {
            addSection('Skills');
            const skills = resumeData.skills.split(',').map(s => s.trim()).filter(Boolean);
            let currentX = margin;
            skills.forEach(skill => {
                const skillWidth = doc.getTextWidth(skill) + 20;
                if (currentX + skillWidth > pageW - margin) {
                    y += 25;
                    currentX = margin;
                }
                doc.setFillColor(239, 246, 255);
                doc.setTextColor(primaryColor);
                doc.roundedRect(currentX, y, skillWidth, 20, 5, 5, 'F');
                doc.text(skill, currentX + skillWidth / 2, y + 10, { align: 'center', baseline: 'middle' });
                currentX += skillWidth + 5;
            });
        }
        
        return doc;
    }, [resumeData]);

    const handleExport = async () => {
        const pdf = await generatePdfFromData();
        if (pdf) {
            pdf.save(`${resumeData.name || 'resume'}.pdf`);
            toast({ title: "Download Complete!" });
        }
    }
    
    const handleAnalyze = async () => {
        if(!canUseFeature) {
            toast({ title: "Upgrade Plan", description: "You've used all your free credits.", variant: "destructive" });
            router.push('/pricing');
            return;
        }
        setIsAnalyzing(true);
        try {
            if (plan === 'free' || plan === 'essentials') await useCredit();
            const pdf = await generatePdfFromData();
            if (pdf) {
                sessionStorage.setItem('resumeDataUriForAnalysis', pdf.output('datauristring'));
                router.push('/resume-analyzer');
            }
        } catch (error) {
            toast({ title: "Analysis Failed", variant: "destructive" });
            setIsAnalyzing(false);
        }
    }

    const handleSave = async () => {
        if (!user || !resumeData) return;
        setIsSaving(true);
        try {
            if (currentVersion) {
                const versionRef = doc(db, `users/${user.uid}/resumeVersions`, currentVersion.id);
                await setDoc(versionRef, { resumeData, updatedAt: serverTimestamp() }, { merge: true });
                toast({ title: "Resume Saved!" });
            } else {
                const { versionName } = await suggestResumeVersionNameAction({ resumeData });
                const name = versionName || "My First Resume";
                const newRef = await addDoc(collection(db, `users/${user.uid}/resumeVersions`), {
                    versionName: name,
                    resumeData,
                    updatedAt: serverTimestamp()
                });
                setCurrentVersion({ id: newRef.id, versionName: name, resumeData, updatedAt: new Date() });
                toast({ title: "First Version Created!", description: `Saved as "${name}"` });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error Saving", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleSaveAsNew = async () => {
        if (!user || !resumeData || versions.length >= draftLimit) return;
        setIsSaving(true);
        try {
            const { versionName } = await suggestResumeVersionNameAction({ resumeData });
            const name = versionName || `Version ${versions.length + 1}`;
            const newRef = await addDoc(collection(db, `users/${user.uid}/resumeVersions`), {
                versionName: name,
                resumeData,
                updatedAt: serverTimestamp(),
            });
            setCurrentVersion({ id: newRef.id, versionName: name, resumeData, updatedAt: new Date() });
            toast({ title: "New Version Saved!", description: `Saved as "${name}"` });
        } catch (error) {
            toast({ title: "Error", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleVersionSelect = (versionId: string) => {
        const selected = versions.find(v => v.id === versionId);
        if (selected) {
            setCurrentVersion(selected);
            setResumeData(selected.resumeData);
            setVersionManagerOpen(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => ({ ...prev, [id]: value }));
    };

    const handleNestedChange = (section: 'experience' | 'education' | 'projects', id: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => {
            const sectionData = prev[section] as any[];
            return {
                ...prev,
                [section]: sectionData.map(item => item.id === id ? { ...item, [name]: value } : item)
            };
        });
    };

    const fillSampleData = () => {
        setResumeData(sampleResumeData);
        toast({ title: "Sample Data Applied", description: "You can now edit this to match your profile." });
    }

    if (isLoading || authLoading) {
        return (
             <div className="grid lg:grid-cols-2 gap-8 h-full">
                <div className="space-y-6">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
                </div>
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Card className="flex-1"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6 overflow-y-auto pb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Personal Information</CardTitle>
                        {versions.length === 0 && (
                            <Button variant="outline" size="sm" onClick={fillSampleData}>
                                <FileJson className="mr-2 h-4 w-4" /> Load Sample
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5"><Label htmlFor="name">Full Name</Label><Input id="name" value={resumeData.name} onChange={handleInputChange} placeholder="e.g. John Doe" /></div>
                            <div className="space-y-1.5"><Label htmlFor="title">Title</Label><Input id="title" value={resumeData.title} onChange={handleInputChange} placeholder="e.g. Software Engineer" /></div>
                            <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" value={resumeData.phone} onChange={handleInputChange} placeholder="e.g. 123-456-7890" /></div>
                            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" value={resumeData.email} onChange={handleInputChange} placeholder="e.g. john@example.com" /></div>
                        </div>
                         <div className="space-y-1.5"><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" value={resumeData.linkedin} onChange={handleInputChange} placeholder="linkedin.com/in/username" /></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                    <CardContent><Textarea id="summary" value={resumeData.summary} onChange={handleInputChange} rows={5} placeholder="Briefly describe your career goals and achievements..." /></CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Work Experience</CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleAddExperience}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resumeData.experience.map((exp) => (
                            <div key={exp.id} className="p-4 border rounded-lg relative space-y-2">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveExperience(exp.id)}><Trash2 className="h-4 w-4" /></Button>
                                <Input name="title" placeholder="Job Title" value={exp.title} onChange={(e) => handleNestedChange('experience', exp.id, e)} />
                                <Input name="company" placeholder="Company" value={exp.company} onChange={(e) => handleNestedChange('experience', exp.id, e)}/>
                                <Input name="dates" placeholder="Dates" value={exp.dates} onChange={(e) => handleNestedChange('experience', exp.id, e)}/>
                                <Textarea name="description" placeholder="Achievements (use bullet points)" value={exp.description} onChange={(e) => handleNestedChange('experience', exp.id, e)} rows={4}/>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Projects</CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleAddProject}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resumeData.projects.map((proj) => (
                            <div key={proj.id} className="p-4 border rounded-lg relative space-y-2">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveProject(proj.id)}><Trash2 className="h-4 w-4" /></Button>
                                <Input name="name" placeholder="Project Name" value={proj.name} onChange={(e) => handleNestedChange('projects', proj.id, e)} />
                                <Textarea name="description" placeholder="Project description..." value={proj.description} onChange={(e) => handleNestedChange('projects', proj.id, e)} rows={3} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Education</CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleAddEducation}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         {resumeData.education.map((edu) => (
                            <div key={edu.id} className="p-4 border rounded-lg relative space-y-2">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveEducation(edu.id)}><Trash2 className="h-4 w-4" /></Button>
                                <Input name="school" placeholder="School" value={edu.school} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                <Input name="degree" placeholder="Degree" value={edu.degree} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="dates" placeholder="Dates" value={edu.dates} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                    <Input name="cgpa" placeholder="CGPA" value={edu.cgpa || ''} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                    <CardContent><Textarea id="skills" placeholder="Comma-separated skills..." value={resumeData.skills} onChange={handleInputChange} rows={3} /></CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4">
                <Card className="p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <Popover open={versionManagerOpen} onOpenChange={setVersionManagerOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full sm:w-auto flex-1 min-w-[200px] justify-between">
                                <History className="mr-2 h-4 w-4" />
                                <span className="truncate">{currentVersion?.versionName || "New Resume (unsaved)"}</span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0">
                                <Command>
                                <CommandInput placeholder="Search versions..." />
                                <CommandEmpty>No versions found.</CommandEmpty>
                                <CommandGroup>
                                    {versions.map((v) => (
                                    <CommandItem key={v.id} value={v.id} onSelect={() => handleVersionSelect(v.id)}>
                                        <Check className={cn("mr-2 h-4 w-4", currentVersion?.id === v.id ? "opacity-100" : "opacity-0")} />
                                        {v.versionName}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <Button onClick={handleSave} disabled={isSaving}>
                                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" disabled={isSaving || versions.length >= draftLimit}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Save as New
                                    </Button>
                                </AlertDialogTrigger>
                                {versions.length >= draftLimit && 
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Draft Limit Reached</AlertDialogTitle>
                                            <AlertDialogDescription>Max {draftLimit} drafts for {plan} plan.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => router.push('/pricing')}><Crown className="mr-2 h-4 w-4" /> Upgrade</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                }
                            </AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleAnalyze} disabled={isAnalyzing || !canUseFeature}>
                                        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4" />}
                                        AI Analyze
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export as PDF</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </Card>
                <Card className="flex-1 overflow-hidden">
                    <CardContent className="p-0 h-full overflow-y-auto">
                        <div ref={resumePreviewRef} className="p-4 sm:p-8 font-body text-sm bg-white text-gray-800 shadow-lg h-full">
                            <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
                                <h2 className="text-2xl md:text-4xl font-bold font-headline text-gray-900">{resumeData.name || 'Your Name'}</h2>
                                <p className="text-base md:text-lg text-primary font-semibold mt-1">{resumeData.title || 'Professional Title'}</p>
                                <div className="flex flex-wrap justify-center gap-x-3 text-xs text-gray-600 mt-3">
                                    <span>{resumeData.phone}</span>
                                    <span>{resumeData.email}</span>
                                    <span>{resumeData.linkedin}</span>
                                </div>
                            </div>
                            {resumeData.summary && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Summary</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{resumeData.summary}</p>
                            </div>
                            )}
                            {resumeData.experience?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Experience</h3>
                                {resumeData.experience.map(exp => (exp.title || exp.company) && (
                                    <div key={exp.id} className="mb-4">
                                        <div className="flex justify-between">
                                            <h4 className="font-semibold text-gray-800">{exp.title}</h4>
                                            <p className="text-xs text-gray-600">{exp.dates}</p>
                                        </div>
                                        <p className="text-sm font-medium">{exp.company}</p>
                                        <ul className="mt-2 list-disc list-inside text-xs sm:text-sm">
                                            {exp.description.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            )}
                            {resumeData.projects?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Projects</h3>
                                {resumeData.projects.map(proj => (proj.name) && (
                                    <div key={proj.id} className="mb-4">
                                        <div className="flex justify-between">
                                            <h4 className="font-semibold text-gray-800">{proj.name}</h4>
                                            <p className="text-xs text-gray-600">{proj.url}</p>
                                        </div>
                                        <ul className="mt-2 list-disc list-inside text-xs sm:text-sm">
                                            {proj.description.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            )}
                            {resumeData.education?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Education</h3>
                                {resumeData.education.map(edu => (edu.school) && (
                                    <div key={edu.id} className="mb-4">
                                        <div className="flex justify-between">
                                            <h4 className="font-semibold text-gray-800">{edu.school}</h4>
                                            <p className="text-xs text-gray-600">{edu.dates}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{edu.degree} {edu.cgpa ? `(CGPA: ${edu.cgpa})` : ''}</p>
                                    </div>
                                ))}
                            </div>
                            )}
                            {resumeData.skills && (
                             <div>
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.skills.split(',').map(skill => skill.trim() && (
                                        <span key={skill} className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full">{skill.trim()}</span>
                                    ))}
                                </div>
                            </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};