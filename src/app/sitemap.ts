import type { MetadataRoute } from "next";

const siteUrl = "https://carrercraftai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: siteUrl,
            changeFrequency: "daily",
            priority: 1.0,
        },
        {
            url: `${siteUrl}/pricing`,
            changeFrequency: "weekly",
            priority: 0.9,
        },
        {
            url: `${siteUrl}/contact`,
            changeFrequency: "yearly",
            priority: 0.4,
        },
        {
            url: `${siteUrl}/terms`,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${siteUrl}/privacy`,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${siteUrl}/cancellation`,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${siteUrl}/(app)/ats-optimizer`,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${siteUrl}/(app)/resume-analyzer`,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${siteUrl}/(app)/job-matcher`,
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${siteUrl}/(app)/cover-letter-generator`,
            changeFrequency: "weekly",
            priority: 0.6,
        },
        {
            url: `${siteUrl}/(app)/candidate-matcher`,
            changeFrequency: "weekly",
            priority: 0.6,
        },
    ];
}


