import type { Metadata } from "next";
import { PricingPage } from '@/components/pricing-page';

export const metadata: Metadata = {
    title: "Pricing Plans for Job Seekers & Recruiters",
    description:
        "Choose from Free, Essentials, Pro, and Recruiter plans on CareerCraft AI to build resumes, optimize for ATS, and manage candidates with AI.",
    alternates: {
        canonical: "https://carrercraftai.vercel.app/pricing",
    },
};

export default function Pricing() {
    return <PricingPage />;
}
