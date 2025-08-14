'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Download, Bot } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
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

export const ResumeBuilder = () => {
    const { toast } = useToast();
    const [resumeData, setResumeData] = useState({
        name: 'John Doe',
        title: 'Software Engineer',
        phone: '123-456-7890',
        email: 'john.doe@email.com',
        linkedin: 'linkedin.com/in/johndoe',
        summary: 'A passionate software engineer with 5+ years of experience in building scalable web applications and leading projects from ideation to deployment.',
        experience: [
            { id: 1, title: 'Senior Developer', company: 'Tech Corp', dates: '2020 - Present', description: 'Led the development of a new microservices-based platform, improving system scalability by 40%.' },
            { id: 2, title: 'Junior Developer', company: 'Innovate LLC', dates: '2018 - 2020', description: 'Contributed to the frontend development of a major e-commerce website using React and Redux.' }
        ],
        education: [{ id: 1, school: 'University of Technology', degree: 'B.S. in Computer Science', dates: '2014 - 2018' }],
        skills: 'React, Node.js, TypeScript, Next.js, PostgreSQL, Docker, AWS'
    });

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

    const handleExport = () => {
        toast({
            title: "Export Functionality",
            description: "PDF and DOCX export would be implemented here in a full application.",
        });
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8 h-full">
            <div className="space-y-6 overflow-y-auto pr-4 -mr-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5"><Label htmlFor="name">Full Name</Label><Input id="name" defaultValue={resumeData.name} /></div>
                            <div className="space-y-1.5"><Label htmlFor="title">Title</Label><Input id="title" defaultValue={resumeData.title} /></div>
                            <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" defaultValue={resumeData.phone} /></div>
                            <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" defaultValue={resumeData.email} /></div>
                        </div>
                         <div className="space-y-1.5"><Label htmlFor="linkedin">LinkedIn</Label><Input id="linkedin" defaultValue={resumeData.linkedin} /></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                    <CardContent><Textarea defaultValue={resumeData.summary} rows={5} /></CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle>Work Experience</CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleAddExperience}><PlusCircle className="mr-2 h-4 w-4" /> Add</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {resumeData.experience.map((exp, index) => (
                            <div key={exp.id} className="p-4 border rounded-lg relative space-y-2">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleRemoveExperience(exp.id)}><Trash2 className="h-4 w-4" /></Button>
                                <Input placeholder="Job Title" defaultValue={exp.title} />
                                <Input placeholder="Company" defaultValue={exp.company} />
                                <Input placeholder="Dates" defaultValue={exp.dates} />
                                <Textarea placeholder="Description" defaultValue={exp.description}/>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>

            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-headline text-lg">Live Preview</h3>
                    <div className="flex gap-2">
                        <Button variant="secondary" asChild>
                           <Link href="/resume-analyzer"><Bot className="mr-2 h-4 w-4" /> AI Analyze</Link>
                        </Button>
                        <Button onClick={handleExport}>
                           <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>
                <Card className="flex-1">
                    <CardContent className="p-6 sm:p-8 font-body text-sm">
                        <div className="text-center border-b pb-4 mb-4">
                            <h2 className="text-3xl font-bold font-headline">{resumeData.name}</h2>
                            <p className="text-muted-foreground">{resumeData.title}</p>
                            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
                                <span>{resumeData.phone}</span>
                                <span className="text-muted-foreground">|</span>
                                <span>{resumeData.email}</span>
                                <span className="text-muted-foreground">|</span>
                                <span>{resumeData.linkedin}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-headline mb-2 text-primary">Summary</h3>
                            <p>{resumeData.summary}</p>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-lg font-bold font-headline mb-2 text-primary">Experience</h3>
                            {resumeData.experience.map(exp => (
                                <div key={exp.id} className="mb-3">
                                    <div className="flex justify-between">
                                        <h4 className="font-semibold">{exp.title} at {exp.company}</h4>
                                        <p className="font-medium text-muted-foreground">{exp.dates}</p>
                                    </div>
                                    <p className="mt-1">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                         <div className="mt-4">
                            <h3 className="text-lg font-bold font-headline mb-2 text-primary">Education</h3>
                            {resumeData.education.map(edu => (
                                <div key={edu.id} className="mb-3">
                                    <div className="flex justify-between">
                                        <h4 className="font-semibold">{edu.school}</h4>
                                        <p className="font-medium text-muted-foreground">{edu.dates}</p>
                                    </div>
                                    <p className="mt-1">{edu.degree}</p>
                                </div>
                            ))}
                        </div>
                         <div className="mt-4">
                            <h3 className="text-lg font-bold font-headline mb-2 text-primary">Skills</h3>
                            <p>{resumeData.skills}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
