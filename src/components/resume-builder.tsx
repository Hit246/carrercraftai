'use client';
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Download, Bot, Save, Loader2, History, ChevronsUpDown, Crown, MoreVertical, FileJson, Layout, Check, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { doc, setDoc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from './ui/skeleton';
import jsPDF from 'jspdf';
import { useRouter } from 'next/navigation';
import { suggestResumeVersionNameAction } from '@/lib/actions';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from './ui/dropdown-menu';

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

type ResumeTemplate = 'classic' | 'modern' | 'minimalist';

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
    template: ResumeTemplate;
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
    projects: [],
    template: 'classic'
};

const sampleResumeData: ResumeData = {
    name: 'John Doe',
    title: 'Senior Software Engineer',
    phone: '123-456-7890',
    email: 'john.doe@email.com',
    linkedin: 'linkedin.com/in/johndoe',
    summary: 'Innovative software engineer with 5+ years of experience in full-stack development. Proven track record of optimizing system performance and leading cross-functional teams to deliver high-quality software solutions.',
    experience: [
        { id: 1, title: 'Senior Developer', company: 'Tech Solutions Inc.', dates: '2020 - Present', description: '• Developed and maintained scalable web applications using React and Node.js.\n• Mentored junior developers and improved code review processes.\n• Reduced application load time by 40% through optimization.' }
    ],
    education: [{ id: 1, school: 'State University', degree: 'B.S. Computer Science', dates: '2014 - 2018', cgpa: '3.9/4.0' }],
    skills: 'React, Node.js, TypeScript, PostgreSQL, AWS, Docker, GraphQL',
    projects: [
        { id: 1, name: 'AI Resume Parser', description: 'Built an automated system to extract structured data from PDF resumes using NLP techniques.', url: 'github.com/johndoe/parser', technologies: 'Python, FastAPI' }
    ],
    template: 'classic'
};

const formatUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export const ResumeBuilder = () => {
    const { toast } = useToast();
    const router = useRouter();
    const { user, loading: authLoading, plan, credits, useCredit } = useAuth();
    const [resumeData, setResumeData] = React.useState<ResumeData>(emptyResumeData);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
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
            const fetchedVersions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResumeVersion));
            setVersions(fetchedVersions);

            if (fetchedVersions.length > 0 && !currentVersion) {
                const latest = fetchedVersions[0];
                setCurrentVersion(latest);
                setResumeData({ ...emptyResumeData, ...latest.resumeData });
            } else if (fetchedVersions.length === 0) {
                setResumeData(prev => ({ ...prev, email: user.email || '' }));
            }
            
            setIsLoading(false);
        }, (error) => {
            console.error("Version listener error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid, authLoading]);

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
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 40;
        let y = margin;
        const lineSpacing = 1.25;

        const primaryColor = resumeData.template === 'minimalist' ? '#000000' : '#2563eb'; 
        const textColor = '#1f2937';
        const lightTextColor = '#4b5563';
        
        doc.setFont('helvetica', 'normal');

        const addLink = (text: string, x: number, currentY: number, url: string, align: 'left' | 'center' | 'right' = 'left') => {
            const width = doc.getTextWidth(text);
            let startX = x;
            if (align === 'center') startX = x - width / 2;
            if (align === 'right') startX = x - width;
            
            doc.link(startX, currentY - 10, width, 12, { url });
        };

        const addWrappedText = (text: string, x: number, startY: number, options: { maxWidth: number, fontSize: number, style?: 'normal' | 'bold', color?: string }) => {
            doc.setFontSize(options.fontSize).setFont('helvetica', options.style || 'normal').setTextColor(options.color || textColor);
            const lines = doc.splitTextToSize(text, options.maxWidth);
            doc.text(lines, x, startY, {lineHeightFactor: lineSpacing});
            return startY + (lines.length * options.fontSize * lineSpacing);
        };

        const addSectionHeader = (title: string) => {
            if (y > pageH - margin - 40) {
                doc.addPage();
                y = margin;
            }
            
            if (resumeData.template === 'modern') {
                doc.setFontSize(13).setFont('helvetica', 'bold').setTextColor(textColor);
                doc.text(title, margin, y);
                const titleW = doc.getTextWidth(title);
                doc.setDrawColor(primaryColor).setLineWidth(1.5);
                doc.line(margin, y + 4, margin + 20, y + 4);
                y += 20;
            } else if (resumeData.template === 'minimalist') {
                doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#000000');
                doc.text(title.toUpperCase(), margin, y);
                y += 4;
                doc.setDrawColor(0).setLineWidth(0.5);
                doc.line(margin, y, pageW - margin, y);
                y += 15;
            } else {
                doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(primaryColor);
                doc.text(title.toUpperCase(), margin, y);
                y += 6;
                doc.setDrawColor(229, 231, 235).setLineWidth(1);
                doc.line(margin, y, pageW - margin, y);
                y += 15;
            }
        };

        // Header Rendering
        if (resumeData.template === 'modern') {
            doc.setFontSize(26).setFont('helvetica', 'bold').setTextColor(textColor);
            doc.text(resumeData.name || 'Your Name', margin, y);
            y += 28;
            doc.setFontSize(13).setFont('helvetica', 'bold').setTextColor(primaryColor);
            doc.text(resumeData.title || 'Professional Title', margin, y);
            y += 22;
            doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(lightTextColor);
            
            let contactX = margin;
            if (resumeData.phone) {
                doc.text(resumeData.phone, contactX, y);
                addLink(resumeData.phone, contactX, y, `tel:${resumeData.phone}`);
                contactX += doc.getTextWidth(resumeData.phone) + 12;
            }
            if (resumeData.email) {
                doc.text(resumeData.email, contactX, y);
                addLink(resumeData.email, contactX, y, `mailto:${resumeData.email}`);
                contactX += doc.getTextWidth(resumeData.email) + 12;
            }
            if (resumeData.linkedin) {
                doc.text(resumeData.linkedin, contactX, y);
                addLink(resumeData.linkedin, contactX, y, formatUrl(resumeData.linkedin));
            }
            y += 15;
            doc.setDrawColor(primaryColor).setLineWidth(2.5);
            doc.line(margin, y, margin + 40, y);
            y += 35;
        } else if (resumeData.template === 'minimalist') {
            doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor('#000000');
            doc.text(resumeData.name || 'YOUR NAME', margin, y);
            y += 24;
            doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#333333');
            doc.text((resumeData.title || 'PROFESSIONAL TITLE').toUpperCase(), margin, y);
            y += 18;
            
            doc.setFontSize(8).setTextColor('#666666');
            let headerX = margin;
            const parts = [resumeData.phone, resumeData.email, resumeData.linkedin].filter(Boolean);
            parts.forEach((part, i) => {
                doc.text(part, headerX, y);
                if (part === resumeData.email) addLink(part, headerX, y, `mailto:${part}`);
                else if (part === resumeData.phone) addLink(part, headerX, y, `tel:${part}`);
                else if (part === resumeData.linkedin) addLink(part, headerX, y, formatUrl(part));
                
                headerX += doc.getTextWidth(part);
                if (i < parts.length - 1) {
                    doc.text('  |  ', headerX, y);
                    headerX += doc.getTextWidth('  |  ');
                }
            });
            y += 15;
            doc.setDrawColor(0).setLineWidth(0.75);
            doc.line(margin, y, pageW - margin, y);
            y += 25;
        } else {
            doc.setFontSize(30).setFont('helvetica', 'bold').setTextColor(textColor);
            doc.text(resumeData.name || 'Your Name', pageW / 2, y, { align: 'center' });
            y += 35;
            doc.setFontSize(14).setFont('helvetica', 'normal').setTextColor(primaryColor);
            doc.text(resumeData.title || 'Professional Title', pageW / 2, y, { align: 'center' });
            y += 25;
            doc.setFontSize(9).setTextColor(lightTextColor);
            
            const contactItems = [];
            if (resumeData.phone) contactItems.push({ text: resumeData.phone, link: `tel:${resumeData.phone}` });
            if (resumeData.email) contactItems.push({ text: resumeData.email, link: `mailto:${resumeData.email}` });
            if (resumeData.linkedin) contactItems.push({ text: resumeData.linkedin, link: formatUrl(resumeData.linkedin) });

            let currentX = pageW / 2 - (contactItems.reduce((acc, item) => acc + doc.getTextWidth(item.text), 0) + (contactItems.length - 1) * 20) / 2;
            
            contactItems.forEach((item, i) => {
                doc.text(item.text, currentX, y);
                addLink(item.text, currentX, y, item.link);
                currentX += doc.getTextWidth(item.text);
                if (i < contactItems.length - 1) {
                    doc.text('  |  ', currentX, y);
                    currentX += doc.getTextWidth('  |  ');
                }
            });
            y += 15;
            doc.setDrawColor(229, 231, 235).setLineWidth(1);
            doc.line(margin, y, pageW - margin, y);
            y += 30;
        }

        // Summary
        if (resumeData.summary) {
            addSectionHeader(resumeData.template === 'minimalist' ? 'Profile' : 'Summary');
            y = addWrappedText(resumeData.summary, margin + (resumeData.template === 'modern' ? 10 : 0), y, { 
                maxWidth: pageW - margin * 2 - (resumeData.template === 'modern' ? 10 : 0), 
                fontSize: 10,
                color: resumeData.template === 'minimalist' ? '#000000' : textColor
            });
            y += 20;
        }

        // Experience
        if (resumeData.experience?.length > 0) {
            addSectionHeader('Experience');
            resumeData.experience.forEach(exp => {
                if (!exp.title && !exp.company) return;
                
                if (resumeData.template === 'modern') {
                    doc.setDrawColor(229, 231, 235).setLineWidth(1);
                    doc.line(margin + 5, y - 5, margin + 5, y + 40); // Timeline line
                    doc.setFillColor(255, 255, 255).setDrawColor(primaryColor).setLineWidth(1.5);
                    doc.circle(margin + 5, y, 4, 'FD'); // Timeline marker
                    
                    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                    doc.text(exp.title, margin + 20, y);
                    doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(primaryColor);
                    doc.text(exp.dates.toUpperCase(), pageW - margin, y, { align: 'right'});
                    y += 14;
                    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(lightTextColor);
                    doc.text(exp.company, margin + 20, y);
                    y += 14;
                    const points = exp.description.split('\n').filter(Boolean);
                    points.forEach(point => {
                        y = addWrappedText(`${point.trim()}`, margin + 20, y, { maxWidth: pageW - margin * 2 - 20, fontSize: 9, color: lightTextColor });
                    });
                    y += 12;
                } else if (resumeData.template === 'minimalist') {
                    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#000000');
                    doc.text(exp.company.toUpperCase(), margin, y);
                    doc.text(exp.dates, pageW - margin, y, { align: 'right'});
                    y += 12;
                    doc.setFontSize(9).setFont('helvetica', 'italic').setTextColor('#333333');
                    doc.text(exp.title, margin, y);
                    y += 14;
                    const points = exp.description.split('\n').filter(Boolean);
                    points.forEach(point => {
                        y = addWrappedText(`${point.trim()}`, margin, y, { maxWidth: pageW - margin * 2, fontSize: 9, color: '#333333' });
                    });
                    y += 10;
                } else {
                    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                    doc.text(exp.title, margin, y);
                    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(lightTextColor);
                    doc.text(exp.dates, pageW - margin, y, { align: 'right'});
                    y += 12;
                    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(lightTextColor);
                    doc.text(exp.company, margin, y);
                    y += 14;
                    const points = exp.description.split('\n').filter(Boolean);
                    points.forEach(point => {
                        y = addWrappedText(`• ${point.trim()}`, margin + 10, y, { maxWidth: pageW - margin * 2 - 10, fontSize: 9, color: lightTextColor });
                    });
                    y += 12;
                }
            });
            y += 10;
        }

        // Projects
        if(resumeData.projects?.length > 0) {
            addSectionHeader('Projects');
            resumeData.projects.forEach(proj => {
                if (!proj.name) return;
                
                if (resumeData.template === 'modern') {
                    doc.setDrawColor(229, 231, 235).setLineWidth(1);
                    doc.line(margin + 5, y - 5, margin + 5, y + 30);
                    doc.setFillColor(255, 255, 255).setDrawColor(primaryColor).setLineWidth(1.5);
                    doc.circle(margin + 5, y, 4, 'FD');

                    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                    doc.text(proj.name, margin + 20, y);
                    if (proj.url) {
                        doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(primaryColor);
                        doc.text(proj.url, pageW - margin, y, { align: 'right' });
                        addLink(proj.url, pageW - margin, y, formatUrl(proj.url), 'right');
                    }
                    y += 14;
                    const points = proj.description.split('\n').filter(Boolean);
                    points.forEach(point => {
                        y = addWrappedText(`${point.trim()}`, margin + 20, y, { maxWidth: pageW - margin * 2 - 20, fontSize: 9, color: lightTextColor });
                    });
                    y += 12;
                } else if (resumeData.template === 'minimalist') {
                    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#000000');
                    doc.text(proj.name.toUpperCase(), margin, y);
                    if (proj.url) {
                        doc.setFontSize(8).setFont('helvetica', 'normal').setTextColor('#666666');
                        doc.text(proj.url, pageW - margin, y, { align: 'right'});
                        addLink(proj.url, pageW - margin, y, formatUrl(proj.url), 'right');
                    }
                    y += 14;
                    const points = proj.description.split('\n').filter(Boolean);
                    points.forEach(point => {
                        y = addWrappedText(`${point.trim()}`, margin, y, { maxWidth: pageW - margin * 2, fontSize: 9, color: '#333333' });
                    });
                    y += 10;
                } else {
                    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                    doc.text(proj.name, margin, y);
                    if (proj.url) {
                        doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(primaryColor);
                        doc.text(proj.url, pageW - margin, y, { align: 'right' });
                        addLink(proj.url, pageW - margin, y, formatUrl(proj.url), 'right');
                    }
                    y += 14;
                    const points = proj.description.split('\n').filter(Boolean);
                    points.forEach(point => {
                        y = addWrappedText(`• ${point.trim()}`, margin + 10, y, { maxWidth: pageW - margin * 2 - 10, fontSize: 9, color: lightTextColor });
                    });
                    y += 12;
                }
            });
            y += 10;
        }

        // Education
        if (resumeData.education?.length > 0) {
            addSectionHeader('Education');
            resumeData.education.forEach(edu => {
                if (!edu.school) return;
                
                if (resumeData.template === 'minimalist') {
                    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#000000');
                    doc.text(edu.school, margin, y);
                    y += 12;
                    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor('#333333');
                    doc.text(`${edu.degree} | ${edu.dates} ${edu.cgpa ? `| ${edu.cgpa}` : ''}`, margin, y);
                    y += 18;
                } else {
                    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(textColor);
                    doc.text(edu.school, margin, y);
                    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(lightTextColor);
                    doc.text(edu.dates, pageW - margin, y, { align: 'right'});
                    y += 12;
                    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(textColor);
                    doc.text(`${edu.degree} ${edu.cgpa ? `| CGPA: ${edu.cgpa}` : ''}`, margin, y);
                    y += 18;
                }
            });
            y += 10;
        }
        
        // Skills
        if (resumeData.skills) {
            addSectionHeader('Skills');
            const skills = resumeData.skills.split(',').map(s => s.trim()).filter(Boolean);
            
            if (resumeData.template === 'minimalist') {
                y = addWrappedText(skills.join(' • '), margin, y, { maxWidth: pageW - margin * 2, fontSize: 9, color: '#333333' });
            } else if (resumeData.template === 'modern') {
                y = addWrappedText(skills.join(', '), margin + 10, y, { maxWidth: pageW - margin * 2 - 10, fontSize: 9, color: lightTextColor });
            } else {
                let currentX = margin;
                skills.forEach(skill => {
                    const skillWidth = doc.getTextWidth(skill) + 20;
                    if (currentX + skillWidth > pageW - margin) {
                        y += 22;
                        currentX = margin;
                    }
                    doc.setFillColor(243, 244, 246);
                    doc.roundedRect(currentX, y, skillWidth, 16, 2, 2, 'F');
                    doc.setFontSize(8.5).setFont('helvetica', 'normal').setTextColor(primaryColor);
                    doc.text(skill, currentX + 10, y + 11);
                    currentX += skillWidth + 6;
                });
            }
        }
        
        return doc;
    }, [resumeData]);

    const handleExport = async () => {
        const pdf = await generatePdfFromData();
        if (pdf) {
            pdf.save(`${resumeData.name.replace(/\s+/g, '_') || 'resume'}.pdf`);
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
        if (!user || !resumeData) return;
        if (versions.length >= draftLimit) {
            toast({ title: "Draft Limit Reached", description: `You can only save ${draftLimit} resumes on your current plan.`, variant: "destructive" });
            return;
        }
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
            setResumeData({ ...emptyResumeData, ...selected.resumeData });
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
        toast({ title: "Sample Data Applied" });
    }

    const setTemplate = (template: ResumeTemplate) => {
        setResumeData(prev => ({ ...prev, template }));
        toast({ title: "Template Applied", description: `Switched to ${template} layout.` });
    }

    if (isLoading || authLoading) {
        return (
             <div className="grid lg:grid-cols-2 gap-8 h-full">
                <div className="space-y-6"><Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card></div>
                <div className="flex flex-col gap-4"><Skeleton className="h-10 w-full" /><Card className="flex-1"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card></div>
            </div>
        )
    }

    const PreviewClassic = () => (
        <div className="p-8 sm:p-12 font-body text-sm bg-white text-gray-800 shadow-xl h-full min-h-[1000px]">
            <div className="text-center border-b-2 border-gray-100 pb-6 mb-8">
                <h2 className="text-3xl md:text-5xl font-bold font-headline text-gray-900">{resumeData.name || 'Your Name'}</h2>
                <p className="text-lg md:text-xl text-primary font-semibold mt-2">{resumeData.title || 'Professional Title'}</p>
                <div className="flex flex-wrap justify-center gap-x-4 text-xs text-gray-500 mt-4">
                    {resumeData.phone && <a href={`tel:${resumeData.phone}`} className="hover:text-primary transition-colors">{resumeData.phone}</a>}
                    {resumeData.email && <a href={`mailto:${resumeData.email}`} className="hover:text-primary transition-colors">{resumeData.email}</a>}
                    {resumeData.linkedin && <a href={formatUrl(resumeData.linkedin)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{resumeData.linkedin}</a>}
                </div>
            </div>
            {resumeData.summary && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold font-headline uppercase tracking-widest text-primary border-b border-gray-200 pb-1 mb-4">Summary</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{resumeData.summary}</p>
                </div>
            )}
            {resumeData.experience?.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold font-headline uppercase tracking-widest text-primary border-b border-gray-200 pb-1 mb-4">Work Experience</h3>
                    {resumeData.experience.map(exp => (exp.title || exp.company) && (
                        <div key={exp.id} className="mb-6">
                            <div className="flex justify-between items-baseline">
                                <h4 className="font-bold text-gray-900 text-base">{exp.title}</h4>
                                <p className="text-xs font-medium text-gray-500">{exp.dates}</p>
                            </div>
                            <p className="text-sm font-bold text-gray-600 mb-2">{exp.company}</p>
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{exp.description}</div>
                        </div>
                    ))}
                </div>
            )}
            {resumeData.projects?.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold font-headline uppercase tracking-widest text-primary border-b border-gray-200 pb-1 mb-4">Projects</h3>
                    {resumeData.projects.map(proj => (proj.name) && (
                        <div key={proj.id} className="mb-6">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-gray-900">{proj.name}</h4>
                                {proj.url && <a href={formatUrl(proj.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">{proj.url}</a>}
                            </div>
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{proj.description}</div>
                        </div>
                    ))}
                </div>
            )}
            {resumeData.education?.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-bold font-headline uppercase tracking-widest text-primary border-b border-gray-200 pb-1 mb-4">Education</h3>
                    {resumeData.education.map(edu => (edu.school) && (
                        <div key={edu.id} className="mb-4">
                            <div className="flex justify-between items-baseline">
                                <h4 className="font-bold text-gray-900">{edu.school}</h4>
                                <p className="text-xs text-gray-500 font-medium">{edu.dates}</p>
                            </div>
                            <p className="text-sm text-gray-700">{edu.degree} {edu.cgpa ? `• CGPA: ${edu.cgpa}` : ''}</p>
                        </div>
                    ))}
                </div>
            )}
            {resumeData.skills && (
                <div>
                    <h3 className="text-sm font-bold font-headline uppercase tracking-widest text-primary border-b border-gray-200 pb-1 mb-4">Core Competencies</h3>
                    <div className="flex flex-wrap gap-2">
                        {resumeData.skills.split(',').map(skill => skill.trim() && (
                            <span key={skill} className="bg-primary/5 text-primary border border-primary/10 text-xs px-3 py-1 rounded-full font-medium">{skill.trim()}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const PreviewModern = () => (
        <div className="p-8 sm:p-12 font-body text-sm bg-white text-gray-800 shadow-xl h-full min-h-[1000px]">
            <div className="mb-10">
                <h2 className="text-4xl font-bold font-headline text-gray-900 tracking-tight">{resumeData.name || 'Your Name'}</h2>
                <p className="text-xl text-primary font-bold mt-1">{resumeData.title || 'Professional Title'}</p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 mt-4">
                    {resumeData.phone && <a href={`tel:${resumeData.phone}`} className="hover:text-primary transition-colors">{resumeData.phone}</a>}
                    {resumeData.email && <a href={`mailto:${resumeData.email}`} className="hover:text-primary transition-colors">{resumeData.email}</a>}
                    {resumeData.linkedin && <a href={formatUrl(resumeData.linkedin)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{resumeData.linkedin}</a>}
                </div>
                <div className="h-1 w-20 bg-primary mt-6 rounded-full" />
            </div>

            <div className="space-y-8">
                {resumeData.summary && (
                    <section>
                        <h3 className="text-lg font-bold font-headline text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" /> Summary
                        </h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{resumeData.summary}</p>
                    </section>
                )}

                {resumeData.experience?.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold font-headline text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" /> Experience
                        </h3>
                        <div className="space-y-8">
                            {resumeData.experience.map(exp => (exp.title || exp.company) && (
                                <div key={exp.id} className="relative pl-6 border-l-2 border-gray-100">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-primary rounded-full" />
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                        <h4 className="font-bold text-gray-900 text-base">{exp.title}</h4>
                                        <span className="text-xs font-bold text-primary uppercase">{exp.dates}</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 italic mb-3">{exp.company}</p>
                                    <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">{exp.description}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {resumeData.projects?.length > 0 && (
                    <section>
                        <h3 className="text-lg font-bold font-headline text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-primary rounded-full" /> Projects
                        </h3>
                        <div className="space-y-6">
                            {resumeData.projects.map(proj => (proj.name) && (
                                <div key={proj.id} className="relative pl-6 border-l-2 border-gray-100">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white border-2 border-primary rounded-full" />
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-bold text-gray-900">{proj.name}</h4>
                                        {proj.url && <a href={formatUrl(proj.url)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-bold hover:underline">{proj.url}</a>}
                                    </div>
                                    <div className="whitespace-pre-wrap text-gray-600 leading-relaxed">{proj.description}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <div className="grid sm:grid-cols-2 gap-10">
                    {resumeData.education?.length > 0 && (
                        <section>
                            <h3 className="text-lg font-bold font-headline text-gray-900 mb-4">Education</h3>
                            {resumeData.education.map(edu => (edu.school) && (
                                <div key={edu.id} className="mb-4">
                                    <h4 className="font-bold text-gray-800">{edu.school}</h4>
                                    <p className="text-xs text-primary font-bold">{edu.dates}</p>
                                    <p className="text-sm text-gray-600">{edu.degree} {edu.cgpa && `| CGPA: ${edu.cgpa}`}</p>
                                </div>
                            ))}
                        </section>
                    )}
                    {resumeData.skills && (
                        <section>
                            <h3 className="text-lg font-bold font-headline text-gray-900 mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {resumeData.skills.split(',').map(skill => skill.trim() && (
                                    <span key={skill} className="bg-gray-100 text-gray-800 text-[10px] uppercase font-bold px-2 py-1 rounded">{skill.trim()}</span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );

    const PreviewMinimalist = () => (
        <div className="p-8 sm:p-12 font-body text-sm bg-white text-black shadow-xl h-full min-h-[1000px]">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold tracking-tight mb-1">{resumeData.name || 'YOUR NAME'}</h2>
                <div className="text-sm font-medium space-x-2">
                    {resumeData.title && <span className="uppercase tracking-widest">{resumeData.title}</span>}
                </div>
                <div className="text-xs mt-3 flex justify-center flex-wrap gap-x-3 gap-y-1">
                    {resumeData.phone && <a href={`tel:${resumeData.phone}`} className="hover:font-bold">{resumeData.phone}</a>}
                    {resumeData.email && <a href={`mailto:${resumeData.email}`} className="font-bold hover:underline">{resumeData.email}</a>}
                    {resumeData.linkedin && <a href={formatUrl(resumeData.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:underline">{resumeData.linkedin}</a>}
                </div>
            </div>

            <div className="space-y-8">
                {resumeData.summary && (
                    <section>
                        <h3 className="text-[11px] font-black uppercase tracking-[3px] border-b border-black mb-3 pb-1">Profile</h3>
                        <p className="text-gray-800 leading-normal whitespace-pre-wrap">{resumeData.summary}</p>
                    </section>
                )}

                {resumeData.experience?.length > 0 && (
                    <section>
                        <h3 className="text-[11px] font-black uppercase tracking-[3px] border-b border-black mb-4 pb-1">Experience</h3>
                        {resumeData.experience.map(exp => (exp.title || exp.company) && (
                            <div key={exp.id} className="mb-6">
                                <div className="flex justify-between font-bold text-sm">
                                    <span>{exp.company?.toUpperCase()}</span>
                                    <span>{exp.dates}</span>
                                </div>
                                <div className="italic text-xs mb-2">{exp.title}</div>
                                <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{exp.description}</div>
                            </div>
                        ))}
                    </section>
                )}

                {resumeData.projects?.length > 0 && (
                    <section>
                        <h3 className="text-[11px] font-black uppercase tracking-[3px] border-b border-black mb-4 pb-1">Projects</h3>
                        {resumeData.projects.map(proj => (proj.name) && (
                            <div key={proj.id} className="mb-6">
                                <div className="flex justify-between font-bold text-sm">
                                    <span>{proj.name?.toUpperCase()}</span>
                                    {proj.url && <a href={formatUrl(proj.url)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-normal hover:underline">{proj.url}</a>}
                                </div>
                                <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{proj.description}</div>
                            </div>
                        ))}
                    </section>
                )}

                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                    {resumeData.education?.length > 0 && (
                        <section>
                            <h3 className="text-[11px] font-black uppercase tracking-[3px] border-b border-black mb-3 pb-1">Education</h3>
                            {resumeData.education.map(edu => (edu.school) && (
                                <div key={edu.id} className="mb-3">
                                    <div className="font-bold text-xs">{edu.school}</div>
                                    <div className="text-[11px] text-gray-600">{edu.degree} • {edu.dates} {edu.cgpa && `• ${edu.cgpa}`}</div>
                                </div>
                            ))}
                        </section>
                    )}
                    {resumeData.skills && (
                        <section>
                            <h3 className="text-[11px] font-black uppercase tracking-[3px] border-b border-black mb-3 pb-1">Skills</h3>
                            <p className="text-xs leading-relaxed">
                                {resumeData.skills.split(',').map((s, i, arr) => (
                                    <span key={i}>{s.trim()}{i < arr.length - 1 ? ' • ' : ''}</span>
                                ))}
                            </p>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );

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
                                <Input name="url" placeholder="Project URL (e.g. github.com/user/repo)" value={proj.url} onChange={(e) => handleNestedChange('projects', proj.id, e)} />
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Layout className="mr-2 h-4 w-4" /> Template
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Choose Layout</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setTemplate('classic')}>
                                        {resumeData.template === 'classic' && <Check className="mr-2 h-4 w-4" />} Classic Professional
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTemplate('modern')}>
                                        {resumeData.template === 'modern' && <Check className="mr-2 h-4 w-4" />} Modern (LaTeX style)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTemplate('minimalist')}>
                                        {resumeData.template === 'minimalist' && <Check className="mr-2 h-4 w-4" />} Minimalist (ATS High)
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button onClick={handleSave} disabled={isSaving}>
                                <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
                            </Button>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" disabled={isSaving}>
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
                                {versions.length < draftLimit && 
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Save as New Version?</AlertDialogTitle>
                                            <AlertDialogDescription>This will create a duplicate of your current work as a new version.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleSaveAsNew}>Save New Version</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                }
                            </AlertDialog>
                            
                            <Button onClick={handleExport} className="hidden md:flex">
                                <Download className="mr-2 h-4 w-4" /> Export
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleAnalyze} disabled={isAnalyzing || !canUseFeature}>
                                        {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4" />}
                                        AI Analyze
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExport} className="md:hidden">
                                        <Download className="mr-2 h-4 w-4" /> Export as PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </Card>
                <Card className="flex-1 overflow-hidden">
                    <CardContent className="p-0 h-full overflow-y-auto bg-muted/30">
                        <div className="mx-auto max-w-[800px]">
                            {resumeData.template === 'modern' ? <PreviewModern /> : 
                             resumeData.template === 'minimalist' ? <PreviewMinimalist /> : 
                             <PreviewClassic />}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
