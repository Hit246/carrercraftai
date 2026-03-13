import { db } from '@/lib/firebase';
import { collectionGroup, query, where, getDocs, limit } from 'firebase/firestore';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface Props {
    params: Promise<{ slug: string }>;
}

async function getResumeBySlug(slug: string) {
    try {
        const q = query(
            collectionGroup(db, 'resumeVersions'),
            where('shareSlug', '==', slug),
            where('isPublic', '==', true),
            limit(1)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return snapshot.docs[0].data();
    } catch (error) {
        console.error("Error fetching public resume:", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const resume = await getResumeBySlug(slug);
    if (!resume || !resume.resumeData) return { title: 'Resume Not Found' };

    const data = resume.resumeData;
    return {
        title: `${data.name || 'Resume'} - ${data.title || 'Professional'} | CareerCraft AI`,
        description: data.summary || `View the professional resume of ${data.name}.`,
        openGraph: {
            title: `${data.name} - ${data.title}`,
            description: data.summary,
            type: 'website',
            images: ['/og-image.png'],
        }
    };
}

export default async function PublicResumePage({ params }: Props) {
    const { slug } = await params;
    const resume = await getResumeBySlug(slug);

    if (!resume || !resume.resumeData) return notFound();

    const data = resume.resumeData;

    const formatUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden">
                <div className="bg-slate-900 text-white p-8 md:p-12">
                    <h1 className="text-4xl font-bold font-headline mb-2">{data.name || 'Name Not Provided'}</h1>
                    <p className="text-xl text-slate-300 font-medium mb-6">{data.title || 'Professional Title'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                        {data.phone && <span>{data.phone}</span>}
                        {data.linkedin && <a href={formatUrl(data.linkedin)} className="hover:text-white underline">{data.linkedin}</a>}
                        {data.email && <span>{data.email?.split('@')[0]}@***.com (Protected)</span>}
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    {data.summary && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b pb-2">Profile</h2>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
                        </section>
                    )}

                    {(data.experience || []).length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 border-b pb-2">Experience</h2>
                            <div className="space-y-8">
                                {data.experience.map((exp: any, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="text-lg font-bold text-slate-900">{exp.title}</h3>
                                            <span className="text-sm font-medium text-slate-500">{exp.dates}</span>
                                        </div>
                                        <p className="text-slate-600 font-bold mb-3">{exp.company}</p>
                                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {(data.education || []).length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 border-b pb-2">Education</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {data.education.map((edu: any, i: number) => (
                                    <div key={i}>
                                        <h3 className="font-bold text-slate-900">{edu.school}</h3>
                                        <p className="text-slate-600 text-sm">{edu.degree}</p>
                                        <p className="text-slate-400 text-xs">{edu.dates}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {data.skills && (
                        <section>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b pb-2">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {(data.skills || '').split(',').map((skill: string, i: number) => skill.trim() && (
                                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                                        {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="bg-slate-50 p-8 text-center border-t">
                    <p className="text-slate-500 text-sm mb-4">Want a professional resume like this?</p>
                    <Button asChild size="lg" className="rounded-full px-8">
                        <Link href="/">Create Your Resume with CareerCraft AI</Link>
                    </Button>
                </div>
            </div>
            <div className="max-w-4xl mx-auto mt-8 flex justify-center items-center gap-2 text-slate-400 text-xs">
                <Image src="/logo.jpg" alt="CareerCraft AI" width={20} height={20} className="rounded-full" />
                <span>Powered by CareerCraft AI — An AI-Powered Career Platform</span>
            </div>
        </div>
    );
}
