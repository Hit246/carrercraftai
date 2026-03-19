import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.jpg" alt="CareerCraft AI" className="w-8 h-8 rounded-md" />
          <span className="font-bold text-white text-lg font-headline">CareerCraft AI</span>
        </div>

        {/* 404 */}
        <div className="relative mb-6">
          <p className="text-[120px] font-black text-white/5 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-6xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              404
            </p>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3 font-headline">
          Page Not Found
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 border border-gray-700 text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Help */}
        <p className="text-gray-600 text-xs mt-8">
          Need help?{" "}
          <Link href="/contact" className="text-blue-500 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
