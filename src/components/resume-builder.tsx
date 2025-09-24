'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Download, Bot, Save, Loader2, Link as LinkIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    education: [{ id: 1, school: 'University of Technology', degree: 'B.S. in Computer Science', dates: '2014 - 2018' }],
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


    React.useEffect(() => {
        const loadResumeData = async () => {
            if (user) {
                setIsLoading(true);
                const resumeRef = doc(db, 'resumes', user.uid);
                const resumeSnap = await getDoc(resumeRef);
                if (resumeSnap.exists()) {
                    const data = resumeSnap.data() as ResumeData;
                    // Ensure projects array exists
                    if (!data.projects) {
                        data.projects = [];
                    }
                    setResumeData(data);
                } else {
                    // Pre-fill with user email if available and it's a new resume
                    const newResumeData = { ...initialResumeData, email: user.email || 'your-email@example.com' };
                    setResumeData(newResumeData);
                }
                setIsLoading(false);
            }
        };
        if (!authLoading) {
            loadResumeData();
        }
    }, [user, authLoading]);

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

    const generatePdfFromDom = async () => {
        const input = resumePreviewRef.current;
        if (!input) return null;
    
        const canvas = await html2canvas(input, {
            scale: 2,
            useCORS: true,
            logging: false,
        });
        
        // A4 page dimensions in points: 595.28 x 841.89
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'pt',
            format: 'a4',
        });
    
        const a4Width = 595.28;
        const imgWidth = a4Width;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        return pdf;
    };

    const handleExport = async () => {
        toast({ title: "Generating PDF...", description: "Please wait." });
        const pdf = await generatePdfFromDom();
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
            if (plan === 'free') {
                await useCredit();
            }
            const pdf = await generatePdfFromDom();
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
        if (!user || !resumeData) return;
        setIsSaving(true);
        try {
            const resumeRef = doc(db, 'resumes', user.uid);
            await setDoc(resumeRef, resumeData);
            toast({
                title: "Resume Saved!",
                description: "Your resume has been successfully saved to the database.",
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
            <div className="space-y-6 overflow-y-auto pr-4 -mr-4 pb-8">
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
                                <Input name="dates" placeholder="Dates (e.g., 2014 - 2018)" value={edu.dates} onChange={(e) => handleNestedChange('education', edu.id, e)}/>
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
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <h3 className="font-headline text-lg">Live Preview</h3>
                    <div className="flex gap-2">
                         <Button onClick={handleSave} disabled={isSaving}>
                           <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                        </Button>
                         <Button variant="secondary" onClick={handleAnalyze} disabled={isAnalyzing || !canUseFeature}>
                           {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4" />}
                           {isAnalyzing ? "Analyzing..." : "AI Analyze"}
                        </Button>
                        <Button onClick={handleExport}>
                           <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>
                <Card className="flex-1">
                    <CardContent className="p-0 h-full overflow-y-auto">
                        <div ref={resumePreviewRef} className="p-6 sm:p-8 font-body text-sm bg-white text-gray-800 shadow-lg h-full">
                            <div className="text-center border-b-2 border-gray-200 pb-4 mb-6">
                                <h2 className="text-2xl md:text-4xl font-bold font-headline text-gray-900">{resumeData.name}</h2>
                                <p className="text-base md:text-lg text-primary font-semibold mt-1">{resumeData.title}</p>
                                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-gray-600 mt-3">
                                    <span>{resumeData.phone}</span>
                                    <span>{resumeData.email}</span>
                                    <span>{resumeData.linkedin}</span>
                                </div>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Summary</h3>
                                <p className="text-gray-700">{resumeData.summary}</p>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Experience</h3>
                                {resumeData.experience.map(exp => (
                                    <div key={exp.id} className="mb-4">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                                            <h4 className="text-base font-semibold text-gray-800">{exp.title}</h4>
                                            <p className="text-xs font-medium text-gray-600">{exp.dates}</p>
                                        </div>
                                        <p className="text-sm font-medium text-gray-700">{exp.company}</p>
                                        <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1 text-xs sm:text-sm">
                                            {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.replace(/^-/, '').trim()}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                             <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Projects</h3>
                                {resumeData.projects && resumeData.projects.map(proj => (
                                    <div key={proj.id} className="mb-4">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-base font-semibold text-gray-800">{proj.name}</h4>
                                            {proj.url && <Link href={proj.url} target="_blank" rel="noopener noreferrer"><LinkIcon className="h-3 w-3 text-primary hover:underline"/></Link>}
                                        </div>
                                        <p className="text-xs text-gray-700">{proj.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            <span className="font-semibold">Technologies:</span> {proj.technologies}
                                        </p>
                                    </div>
                                ))}
                            </div>
                             <div className="mb-6">
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Education</h3>
                                {resumeData.education.map(edu => (
                                    <div key={edu.id} className="mb-2">
                                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                                            <h4 className="text-base font-semibold text-gray-800">{edu.school}</h4>
                                            <p className="text-xs font-medium text-gray-600">{edu.dates}</p>
                                        </div>
                                        <p className="text-sm text-gray-700">{edu.degree}</p>
                                    </div>
                                ))}
                            </div>
                             <div>
                                <h3 className="text-sm font-bold font-headline uppercase tracking-wider text-primary border-b-2 border-gray-200 pb-1 mb-3">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.skills.split(',').map(skill => skill.trim() && (
                                        <span key={skill} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">{skill.trim()}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
