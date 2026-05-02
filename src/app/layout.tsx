import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { Inter, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const siteUrl = "https://careercraftai.tech";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fontHeadline = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  verification: {
    google: 'm9NCKssWohWHN-B-t5wf3XhwCqQmitLh_apuVQep9sc'
  },
  title: {
    default: "CareerCraft AI: Build Resumes & Find Jobs with AI",
    template: "%s | CareerCraft AI",
  },
  description: "Build professional resumes, get AI-driven feedback, discover job opportunities, and streamline your job search with CareerCraft AI's ATS-friendly tools.",
  keywords: ["AI resume builder", "resume analysis", "job matcher", "career platform", "ATS optimization", "cover letter generator", "career growth India", "fresher jobs"],
  authors: [{ name: "CHAUHAN HITARTH", url: "https://github.com/Hit246" }],
  creator: "CHAUHAN HITARTH",
  openGraph: {
    title: "CareerCraft AI: An AI-Powered Career Platform",
    description: "Build professional resumes, get AI-driven feedback, discover job opportunities, and streamline your job search with CareerCraft AI.",
    url: siteUrl,
    siteName: "CareerCraft AI",
    images: [
      {
        url: `${siteUrl}/og-image.webp`,
        width: 1200,
        height: 630,
        alt: "CareerCraft AI Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerCraft AI: Build Resumes & Find Jobs with AI",
    description: "Build professional resumes, get AI-driven feedback, discover job opportunities, and streamline your job search with CareerCraft AI.",
    images: [`${siteUrl}/og-image.webp`],
  },
  icons: {
    icon: "/logo.webp",
    shortcut: "/logo.webp",
    apple: "/logo.webp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://www.googleapis.com" />
      </head>
      <body className={cn(
        "font-body antialiased",
        fontBody.variable,
        fontHeadline.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <FirebaseErrorListener />
        </ThemeProvider>
        <Script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6941887967099080"
     crossOrigin="anonymous" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
