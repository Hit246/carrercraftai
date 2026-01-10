
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

const siteUrl = "https://careercraftai.vercel.app";

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
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
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
