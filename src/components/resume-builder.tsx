'use client';
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Download, Bot, Save, Loader2, Link as LinkIcon, History, ChevronsUpDown, Crown, MoreVertical } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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

const initialResumeData: ResumeData = {
    name: 'John Doe',
    title: 'Software Engineer',
    phone: '123-456-7890',
    email: 'john.doe@email.com',
    linkedin: 'linkedin.com/in/johndoe',
    summary: 'A passionate software engineer with 5+ years of experience in building scalable web applications and leading projects from ideation to deployment.',
    experience: [
        { id: 1, title: 'Senior Developer', company: 'Tech Corp', dates: '2020 - Present', description: '- Led the development of a new microservices-based platform, improving system scalability by 40%.\n- Collaborated with cross-functional teams to define, design, and ship new features.\n- Mentored junior developers and conducted code reviews to maintain code quality.' },
        { id: 2, title: 'Junior Developer', company: 'Innovate LLC', dates: '2018 - 2020', description: '- Contributed to the frontend development of a major e-commerce website using React and Redux.\n- Implemented responsive UI components that improved user experience on mobile devices.\n- Fixed bugs and improved application performance.' }
    ],
    education: [{ id: 1, school: 'University of Technology', degree: 'B.S. in Computer Science', dates: '2014 - 2018', cgpa: '8.8/10' }],
    skills: 'React, Node.js, TypeScript, Next.js, PostgreSQL, Docker, AWS, GraphQL, REST APIs',
    projects: [
        { id: 1, name: 'E-commerce Platform', description: 'A full-stack e-commerce website with features like product search, shopping cart, and a secure checkout process.', url: 'https://github.com/johndoe/e-commerce', technologies: 'React, Node.js, Express, MongoDB' }
    ]
}

export const ResumeBuilder = () => {
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading: authLoading, plan, credits, useCredit } = useAuth();
    const [resumeData, setResumeData] = React.useState<ResumeData | null>(null);
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

        const unsubscribe = onSnapshot(versionsQuery, async (snapshot) => {
            if (snapshot.empty) {
                // Create the first version if none exist
                const firstVersionName = "Initial Resume";
                const firstVersionData = {
                    versionName: firstVersionName,
                    updatedAt: serverTimestamp(),
                    resumeData: { ...initialResumeData, email: user.email || '' }
                };
                const newVersionRef = await addDoc(collection(db, `users/${user.uid}/resumeVersions`), firstVersionData);
                
                const newVersion: ResumeVersion = { id: newVersionRef.id, ...firstVersionData };
                setVersions([newVersion]);
                setCurrentVersion(newVersion);
                setResumeData(newVersion.resumeData);
            } else {
                const fetchedVersions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeVersion));
                setVersions(fetchedVersions);

                if (!currentVersion || !fetchedVersions.some(v => v.id === currentVersion.id)) {
                    const latestVersion = fetchedVersions[0];
                    setCurrentVersion(latestVersion);
                    setResumeData(latestVersion.resumeData);
                }
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching resume versions: ", error);
            toast({ title: "Error", description: "Could not load resume versions.", variant: "destructive" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, toast, currentVersion]);

    const handleAddExperience = () => {
        if (!resumeData) return;
        setResumeData(prev => prev && {
            ...prev,
            experience: [...prev.experience, { id: Date.now(), title: '', company: '', dates: '', description: '' }]
        });
    };
    
    const handleRemoveExperience = (id: number) => {
        if (!resumeData) return;
        setResumeData(prev => prev && {
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        });
    };

    const handleAddProject = () => {
        if (!resumeData) return;
        setResumeData(prev => prev && {
            ...prev,
            projects: [...(prev.projects || []), { id: Date.now(), name: '', description: '', url: '', technologies: '' }]
        });
    };

    const handleRemoveProject = (id: number) => {
        if (!resumeData) return;
        setResumeData(prev => prev && {
            ...prev,
            projects: prev.projects.filter(proj => proj.id !== id)
        });
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

        const primaryColor = '#6d28d9'; // A purple color similar to the theme
        const textColor = '#374151';
        const lightTextColor = '#6b7280';
        
        doc.setFont('helvetica', 'normal');

        // --- HEADER ---
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
        const contactInfo = [
            resumeData.phone, 
            resumeData.email, 
            resumeData.linkedin && `https://${resumeData.linkedin}`
        ].filter(Boolean);
        
        if (contactInfo.length > 0) {
            doc.setTextColor(lightTextColor);
            const contactInfoString = contactInfo.join('  |  ');
            doc.text(contactInfoString, pageW / 2, y, { align: 'center' });
            y += 15;
        }

        // --- BORDER ---
        doc.setDrawColor(229, 231, 235); // gray-200
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

        // --- SUMMARY ---
        if (resumeData.summary) {
            addSection('Summary');
            y = addWrappedText(resumeData.summary, margin, y, { maxWidth: pageW - margin * 2, fontSize: 10 });
            y += 15;
        }

        // --- EXPERIENCE ---
        if (resumeData.experience && resumeData.experience.length > 0 && resumeData.experience.some(exp => exp.title || exp.company)) {
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
                const bulletPoints = exp.description.split('\n').map(line => line.replace(/^-/, '').trim()).filter(Boolean);
                bulletPoints.forEach(point => {
                    y = addWrappedText(`• ${point}`, margin + 10, y, { maxWidth: pageW - margin * 2 - 10, fontSize: 10 });
                });
                y += 15;
            });
        }

        // --- PROJECTS ---
        if(resumeData.projects && resumeData.projects.length > 0 && resumeData.projects.some(p => p.name)) {
            addSection('Projects');
            resumeData.projects.forEach(proj => {
                if (!proj.name) return;
                doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                doc.text(proj.name, margin, y);
                if (proj.url) {
                    doc.setTextColor(primaryColor);
                    doc.textWithLink('(link)', margin + doc.getTextWidth(proj.name) + 5, y, { url: proj.url.startsWith('http') ? proj.url : `https://${proj.url}` });
                }
                y += 14 * lineSpacing;
                
                const bulletPoints = proj.description.split('\n').map(line => line.replace(/^-/, '').trim()).filter(Boolean);
                bulletPoints.forEach(point => {
                    y = addWrappedText(`• ${point}`, margin + 10, y, { maxWidth: pageW - margin * 2 - 10, fontSize: 10, color: lightTextColor });
                });
                
                if (proj.technologies) {
                    y += 5;
                    doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(textColor);
                    doc.text('Technologies: ', margin, y);
                    doc.setFont('helvetica', 'normal').setTextColor(lightTextColor);
                    const technologiesText = proj.technologies.split(',').map(t => t.trim()).join(', ');
                    doc.text(technologiesText, margin + doc.getTextWidth('Technologies: '), y);
                }
                y += 20;
            });
        }

        // --- EDUCATION ---
        if (resumeData.education && resumeData.education.length > 0 && resumeData.education.some(edu => edu.school)) {
            addSection('Education');
            resumeData.education.forEach(edu => {
                if (!edu.school) return;
                doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                doc.text(edu.school, margin, y);
                
                doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(lightTextColor);
                doc.text(edu.dates, pageW - margin, y, { align: 'right'});
                y += 14 * lineSpacing;

                doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(textColor);
                const degreeAndCgpa = edu.cgpa ? `${edu.degree} (CGPA: ${edu.cgpa})` : edu.degree;
                doc.text(degreeAndCgpa, margin, y);
                y += 15;
            });
        }
        
        // --- SKILLS ---
        if (resumeData.skills) {
            addSection('Skills');
            const skills = resumeData.skills.split(',').map(s => s.trim()).filter(Boolean);
            let currentX = margin;
            const skillPadding = 10;
            const skillHeight = 20;
            doc.setFontSize(9);

            skills.forEach(skill => {
                const skillWidth = doc.getTextWidth(skill) + skillPadding * 2;
                if (currentX + skillWidth > pageW - margin) {
                    y += skillHeight + 5;
                    currentX = margin;
                }
                
                doc.setFillColor(239, 246, 255); // A light blue color, similar to bg-primary/10
                doc.setTextColor(primaryColor);
                doc.roundedRect(currentX, y, skillWidth, skillHeight, 5, 5, 'F');
                doc.text(skill, currentX + skillWidth / 2, y + skillHeight / 2, { align: 'center', baseline: 'middle' });
                
                currentX += skillWidth + 5;
            });
        }
        
        return doc;
    }, [resumeData]);


    const handleExport = async () => {
        toast({ title: "Generating PDF...", description: "Please wait." });
        const pdf = await generatePdfFromData();
        if (pdf) {
            pdf.save(`${resumeData?.name || 'resume'}.pdf`);
            toast({ title: "Download Complete!", description: "Your resume has been downloaded." });
        } else {
            toast({ title: "Export Failed", variant: "destructive" });
        }
    }
    
    const handleAnalyze = async () => {
        if(!canUseFeature) {
            toast({
              title: "Upgrade to Pro",
              description: "You've used all your free credits. Please upgrade to continue.",
              variant: "destructive",
            })
            router.push('/pricing');
            return;
        }

        setIsAnalyzing(true);
        toast({ title: "Analyzing Resume...", description: "Generating a snapshot and sending it to the AI." });

        try {
            if (plan === 'free' || plan === 'essentials') {
                await useCredit();
            }
            const pdf = await generatePdfFromData();
            if (pdf) {
                const dataUri = pdf.output('datauristring');
                // Store in session storage to pass to the next page
                sessionStorage.setItem('resumeDataUriForAnalysis', dataUri);
                router.push('/resume-analyzer');
            } else {
                 throw new Error("Failed to generate PDF for analysis.");
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Analysis Failed", description: "Could not prepare your resume for analysis.", variant: "destructive" });
            setIsAnalyzing(false);
        }
    }

    const handleSave = async () => {
        if (!user || !resumeData || !currentVersion) return;
        setIsSaving(true);
        try {
            const versionRef = doc(db, `users/${user.uid}/resumeVersions`, currentVersion.id);
            await setDoc(versionRef, { resumeData, updatedAt: serverTimestamp() }, { merge: true });
            toast({
                title: "Resume Saved!",
                description: `Version "${currentVersion.versionName}" has been updated.`,
            });
        } catch (error) {
            console.error("Error saving resume: ", error);
            toast({
                title: "Error",
                description: "Could not save your resume. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    }
    
    const handleSaveAsNew = async () => {
        if (!user || !resumeData || versions.length >= draftLimit) return;
        setIsSaving(true);
        try {
            // Suggest a name via AI
            const { versionName } = await suggestResumeVersionNameAction({ resumeData });

            const newVersionData = {
                versionName: versionName || `Version ${versions.length + 1}`,
                updatedAt: serverTimestamp(),
                resumeData,
            };
            const newVersionRef = await addDoc(collection(db, `users/${user.uid}/resumeVersions`), newVersionData);

            toast({
                title: "New Version Saved!",
                description: `Saved as "${newVersionData.versionName}".`,
            });

            // Set this new version as the current one
            const newVersion = { id: newVersionRef.id, ...newVersionData };
            setCurrentVersion(newVersion);

        } catch (error) {
            console.error("Error saving new version: ", error);
            toast({ title: "Error", description: "Could not save new version.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleVersionSelect = (versionId: string) => {
        const selectedVersion = versions.find(v => v.id === versionId);
        if (selectedVersion) {
            setCurrentVersion(selectedVersion);
            setResumeData(selectedVersion.resumeData);
            setVersionManagerOpen(false);
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setResumeData(prev => prev && ({ ...prev, [id]: value }));
    };

    const handleNestedChange = (section: 'experience' | 'education' | 'projects', id: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setResumeData(prev => {
            if (!prev) return null;
            const sectionData = prev[section as keyof ResumeData] as any[];
            return {
                ...prev,
                [section]: sectionData.map(item => item.id === id ? { ...item, [name]: value } : item)
            };
        });
    };
    

    if (isLoading || authLoading) {
        return (
             <div className="grid lg:grid-cols-2 gap-8 h-full">
                <div className="space-y-6">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-32 w-full" /></CardContent></Card>
                     <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
                </div>
                <div className="flex flex-col gap-4">
                     <Skeleton className="h-10 w-full" />
                    <Card className="flex-1"><CardContent className="p-6 sm:p-8"><Skeleton className="h-full w-full" /></CardContent></Card>
                </div>
            </div>
        )
    }
    
    if (!resumeData) return null;


    return (
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6 overflow-y-auto pb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5"><Label htmlFor="name">Full Name</Label><Input id="name" value={resumeData.name} onChange={handleInputChange} /></div>
                            <div className="space-y-1.5"><Label htmlFor="title">Title</Label><Input id="title" value={resumeData.title} onChange={handleInputChange} /></div>
                            <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" value={resumeData.phone} onChange={handleInputChange} /></div>
                            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" value={resumeData.email} onChange={handleInputChange} /></div>
                        </div>
                         <div className="space-y-1.5"><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" value={resumeData.linkedin} onChange={handleInputChange} /></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                    <CardContent><Textarea id="summary" value={resumeData.summary} onChange={handleInputChange} rows={5} /></CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Work Experience</CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleAddExperience}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resumeData.experience.map((exp) => (
                            <div key={exp.id} className="p-4 border rounded-lg relative space-y-2">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveExperience(exp.id)}><Trash2 className="h-4 w-4" /></Button>
                                <Input name="title" placeholder="Job Title" value={exp.title} onChange={(e) => handleNestedChange('experience', exp.id, e)} />
                                <Input name="company" placeholder="Company" value={exp.company} onChange={(e) => handleNestedChange('experience', exp.id, e)}/>
                                <Input name="dates" placeholder="Dates (e.g., Jan 2020 - Present)" value={exp.dates} onChange={(e) => handleNestedChange('experience', exp.id, e)}/>
                                <Textarea name="description" placeholder="Description (use bullet points starting with -)" value={exp.description} onChange={(e) => handleNestedChange('experience', exp.id, e)} rows={4}/>
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
                        {(resumeData.projects || []).map((proj) => (
                            <div key={proj.id} className="p-4 border rounded-lg relative space-y-2">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveProject(proj.id)}><Trash2 className="h-4 w-4" /></Button>
                                <Input name="name" placeholder="Project Name" value={proj.name} onChange={(e) => handleNestedChange('projects', proj.id, e)} />
                                <Input name="url" placeholder="Project URL" value={proj.url} onChange={(e) => handleNestedChange('projects', proj.id, e)} />
                                <Textarea name="description" placeholder="Project description..." value={proj.description} onChange={(e) => handleNestedChange('projects', proj.id, e)} rows={3} />
                                <Input name="technologies" placeholder="Technologies Used (comma-separated)" value={proj.technologies} onChange={(e) => handleNestedChange('projects', proj.id, e)} />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle>Education</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                         {resumeData.education.map((edu) => (
                            <div key={edu.id} className="p-4 border rounded-lg relative space-y-2">
                                <Input name="school" placeholder="School or University" value={edu.school} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                <Input name="degree" placeholder="Degree (e.g., B.S. in Computer Science)" value={edu.degree} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="dates" placeholder="Dates (e.g., 2014 - 2018)" value={edu.dates} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                    <Input name="cgpa" placeholder="CGPA (e.g., 8.8/10)" value={edu.cgpa || ''} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                    <CardContent><Textarea id="skills" placeholder="Comma-separated skills (e.g., React, Node.js, Python)" value={resumeData.skills} onChange={handleInputChange} rows={3} /></CardContent>
                </Card>

            </div>

            <div className="flex flex-col gap-4">
                <Card className="flex flex-col sm:flex-row justify-between items-center gap-2 p-3">
                    <Popover open={versionManagerOpen} onOpenChange={setVersionManagerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={versionManagerOpen}
                            className="w-full sm:w-[250px] justify-between"
                            >
                            <History className="mr-2 h-4 w-4" />
                            {currentVersion
                                ? currentVersion.versionName
                                : "Select version..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-0">
                            <Command>
                            <CommandInput placeholder="Search versions..." />
                            <CommandEmpty>No versions found.</CommandEmpty>
                            <CommandGroup>
                                {versions.map((version) => (
                                <CommandItem
                                    key={version.id}
                                    value={version.id}
                                    onSelect={(currentValue) => {
                                        handleVersionSelect(currentValue)
                                    }}
                                >
                                    <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        currentVersion?.id === version.id ? "opacity-100" : "opacity-0"
                                    )}
                                    />
                                    {version.versionName}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <div className="flex items-center gap-2">
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
                                        <AlertDialogDescription>
                                            You have reached the maximum number of resume drafts ({draftLimit}) for the {plan} plan. Please upgrade your plan to save more versions.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => router.push('/pricing')}>
                                            <Crown className="mr-2 h-4 w-4" />
                                            Upgrade Plan
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            }
                        </AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleAnalyze} disabled={isAnalyzing || !canUseFeature}>
                                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4" />}
                                    AI Analyze
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExport}>
                                    <Download className="mr-2 h-4 w-4" /> 
                                    Export as PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </Card>
                <Card className="flex-1 overflow-hidden">
                    <CardContent className="p-0 h-full overflow-y-auto">
                        <div ref={resumePreviewRef} className="p-4 sm:p-8 font-body text-sm bg-white text-gray-800 shadow-lg h-full">
                            <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
                                <h2 className="text-2xl md:text-4xl font-bold font-headline text-gray-900 break-words">{resumeData.name}</h2>
                                <p className="text-base md:text-lg text-primary font-semibold mt-1 break-words">{resumeData.title}</p>
                                <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-gray-600 mt-3">
                                    <span className="break-all">{resumeData.phone}</span>
                                    <Link href={`mailto:${resumeData.email}`} className="text-primary hover:underline break-all">{resumeData.email}</Link>
                                    <Link href={`https://${resumeData.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{resumeData.linkedin}</Link>
                                </div>
                            </div>
                            {resumeData.summary && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Summary</h3>
                                <p className="text-gray-700 whitespace-pre-wrap break-words">{resumeData.summary}</p>
                            </div>
                            )}
                            {resumeData.experience && resumeData.experience.length > 0 && resumeData.experience.some(exp => exp.title || exp.company) && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Experience</h3>
                                {resumeData.experience.map(exp => exp.title && exp.company && (
                                    <div key={exp.id} className="mb-4">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                                            <h4 className="text-base font-semibold text-gray-800 break-words">{exp.title}</h4>
                                            <p className="text-xs font-medium text-gray-600 flex-shrink-0">{exp.dates}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 break-words">{exp.company}</p>
                                        <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1 text-xs sm:text-sm">
                                            {exp.description.split('\n').map((line, i) => line.trim() && <li key={i} className="whitespace-pre-wrap break-words">{line.replace(/^-/, '').trim()}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            )}
                             {resumeData.projects && resumeData.projects.length > 0 && resumeData.projects.some(p => p.name) && (
                             <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Projects</h3>
                                {resumeData.projects.map(proj => proj.name && (
                                    <div key={proj.id} className="mb-4">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-semibold text-gray-800 break-words">{proj.name}</h4>
                                            {proj.url && <Link href={proj.url.startsWith('http') ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-3 w-3 text-primary hover:underline"/></Link>}
                                        </div>
                                        <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1 text-xs sm:text-sm">
                                            {proj.description.split('\n').map((line, i) => line.trim() && <li key={i} className="whitespace-pre-wrap break-words">{line.replace(/^-/, '').trim()}</li>)}
                                        </ul>
                                        {proj.technologies && (
                                        <p className="text-xs text-gray-500 mt-2 break-words">
                                            <span className="font-semibold text-gray-800">Technologies:</span> {proj.technologies}
                                        </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            )}
                             {resumeData.education && resumeData.education.length > 0 && resumeData.education.some(e => e.school) && (
                             <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Education</h3>
                                {resumeData.education.map(edu => edu.school && (
                                    <div key={edu.id} className="mb-2">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                                            <h4 className="text-base font-semibold text-gray-800 break-words">{edu.school}</h4>
                                            <p className="text-xs font-medium text-gray-600 flex-shrink-0">{edu.dates}</p>
                                        </div>
                                        <p className="text-sm text-gray-700 break-words">{edu.degree} {edu.cgpa && `(CGPA: ${edu.cgpa})`}</p>
                                    </div>
                                ))}
                            </div>
                            )}
                             {resumeData.skills && (
                             <div>
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.skills.split(',').map(skill => skill.trim() && (
                                        <span key={skill} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{skill.trim()}</span>
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
