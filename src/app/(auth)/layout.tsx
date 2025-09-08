
import { AuthProvider } from '@/hooks/use-auth';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
       <div className="flex min-h-screen flex-col">
        <header className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.jpg" alt="CareerCraft AI Logo" width={32} height={32} className="rounded-full object-cover" />
                    <h1 className="text-2xl font-bold font-headline text-foreground">
                    CareerCraft AI
                    </h1>
                </Link>
            </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
            {children}
        </main>
      </div>
    </AuthProvider>
  );
}

    