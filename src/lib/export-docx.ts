import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface Experience {
    title: string;
    company: string;
    dates: string;
    description: string;
}

interface Education {
    school: string;
    degree: string;
    dates: string;
    cgpa?: string;
}

interface Project {
    name: string;
    description: string;
    url: string;
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

export const exportToDocx = async (data: ResumeData) => {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Name
                    new Paragraph({
                        text: data.name || 'Your Name',
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    // Contact Info
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun({
                                text: [data.email, data.phone, data.linkedin].filter(Boolean).join(' | '),
                                size: 20,
                            }),
                        ],
                    }),
                    new Paragraph({
                        text: '',
                        border: {
                            bottom: {
                                color: "auto",
                                space: 1,
                                style: BorderStyle.SINGLE,
                                size: 6,
                            },
                        },
                    }),

                    // Summary
                    ...(data.summary ? [
                        new Paragraph({ text: '', spacing: { before: 200 } }),
                        new Paragraph({
                            children: [new TextRun({ text: 'PROFESSIONAL SUMMARY', bold: true, size: 24 })],
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: data.summary, size: 22 })],
                            spacing: { before: 100 },
                        }),
                    ] : []),

                    // Experience
                    ...(data.experience?.length > 0 ? [
                        new Paragraph({ text: '', spacing: { before: 200 } }),
                        new Paragraph({
                            children: [new TextRun({ text: 'WORK EXPERIENCE', bold: true, size: 24 })],
                        }),
                        ...data.experience.flatMap(exp => [
                            new Paragraph({
                                spacing: { before: 150 },
                                children: [
                                    new TextRun({ text: exp.company || '', bold: true, size: 22 }),
                                    new TextRun({ text: `\t${exp.dates || ''}`, bold: true, size: 22 }),
                                ],
                                tabStops: [{ type: 'right' as any, position: 9000 }],
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: exp.title || '', italic: true, size: 22 })],
                            }),
                            ...exp.description.split('\n').filter(Boolean).map(line => 
                                new Paragraph({
                                    text: line.trim().startsWith('•') ? line.trim() : `• ${line.trim()}`,
                                    bullet: { level: 0 },
                                    spacing: { before: 50 },
                                })
                            )
                        ])
                    ] : []),

                    // Projects
                    ...(data.projects?.length > 0 ? [
                        new Paragraph({ text: '', spacing: { before: 200 } }),
                        new Paragraph({
                            children: [new TextRun({ text: 'PROJECTS', bold: true, size: 24 })],
                        }),
                        ...data.projects.flatMap(proj => [
                            new Paragraph({
                                spacing: { before: 150 },
                                children: [
                                    new TextRun({ text: proj.name || '', bold: true, size: 22 }),
                                    ...(proj.url ? [new TextRun({ text: `\t${proj.url}`, size: 18, color: "2563eb" })] : []),
                                ],
                                tabStops: [{ type: 'right' as any, position: 9000 }],
                            }),
                            ...proj.description.split('\n').filter(Boolean).map(line => 
                                new Paragraph({
                                    text: line.trim().startsWith('•') ? line.trim() : `• ${line.trim()}`,
                                    bullet: { level: 0 },
                                    spacing: { before: 50 },
                                })
                            )
                        ])
                    ] : []),

                    // Education
                    ...(data.education?.length > 0 ? [
                        new Paragraph({ text: '', spacing: { before: 200 } }),
                        new Paragraph({
                            children: [new TextRun({ text: 'EDUCATION', bold: true, size: 24 })],
                        }),
                        ...data.education.flatMap(edu => [
                            new Paragraph({
                                spacing: { before: 150 },
                                children: [
                                    new TextRun({ text: edu.school || '', bold: true, size: 22 }),
                                    new TextRun({ text: `\t${edu.dates || ''}`, bold: true, size: 22 }),
                                ],
                                tabStops: [{ type: 'right' as any, position: 9000 }],
                            }),
                            new Paragraph({
                                children: [new TextRun({ text: `${edu.degree || ''}${edu.cgpa ? ` (CGPA: ${edu.cgpa})` : ''}`, size: 22 })],
                            }),
                        ])
                    ] : []),

                    // Skills
                    ...(data.skills ? [
                        new Paragraph({ text: '', spacing: { before: 200 } }),
                        new Paragraph({
                            children: [new TextRun({ text: 'SKILLS', bold: true, size: 24 })],
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: data.skills, size: 22 })],
                            spacing: { before: 100 },
                        }),
                    ] : []),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${data.name.replace(/\s+/g, '-')}-Resume.docx`;
    saveAs(blob, fileName);
};