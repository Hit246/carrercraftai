import { AuthProvider } from '@/hooks/use-auth';
import { Logo } from '@/components/icons';
import Link from 'next/link';

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
                    <Logo className="h-8 w-8 text-primary" />
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
