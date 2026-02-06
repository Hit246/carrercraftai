
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { Inter, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

const siteUrl = "https://careercraftai.vercel.app";

const fontBody = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontHeadline = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CareerCraft AI: Build Resumes & Find Jobs with AI",
    template: "%s | CareerCraft AI",
  },
  description: "Build professional resumes, get AI-driven feedback, discover job opportunities, and streamline your job search with CareerCraft AI.",
  keywords: ["AI resume builder", "resume analysis", "job matcher", "career platform", "ATS optimization", "cover letter generator"],
  authors: [{ name: "CHAUHAN HITARTH", url: "https://github.com/Hit246" }],
  creator: "CHAUHAN HITARTH",
  openGraph: {
    title: "CareerCraft AI: An AI-Powered Career Platform",
    description: "Build professional resumes, get AI-driven feedback, discover job opportunities, and streamline your job search with CareerCraft AI.",
    url: siteUrl,
    siteName: "CareerCraft AI",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
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
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/logo.jpg?v=1",
    shortcut: "/logo.jpg?v=1",
    apple: "/logo.jpg?v=1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head/>
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
      </body>
    </html>
  );
}
