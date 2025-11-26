
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background min-h-screen">
       <header className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold font-headline text-foreground">
                    CareerCraft AI
                    </h1>
                </Link>
                <Button asChild>
                    <Link href="/dashboard">Back to App</Link>
                </Button>
            </div>
        </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-stone dark:prose-invert max-w-none">
            <p>
              CareerCraft AI ("us", "we", or "our") operates the careercraftai.vercel.app website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>

            <section>
              <h2 className="text-xl font-semibold font-headline">1. Information Collection and Use</h2>
              <p>
                We collect several different types of information for various purposes to provide and improve our Service to you.
              </p>
              <p>Types of Data Collected:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally, identifiable information may include, but is not limited to: Email address, First name and last name, Phone number.</li>
                <li><strong>Usage Data:</strong> We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
                <li><strong>Resume Data:</strong> Any resume files or data you provide for analysis or building are processed by our AI models to provide you with the service. We do not store this data long-term for any purpose other than providing the immediate service requested.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold font-headline">2. Use of Data</h2>
              <p>CareerCraft AI uses the collected data for various purposes:</p>
               <ul className="list-disc pl-5 space-y-2">
                <li>To provide and maintain the Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide customer care and support</li>
                <li>To provide analysis or valuable information so that we can improve the Service</li>
                <li>To monitor the usage of the Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold font-headline">3. Security of Data</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </section>

             <section>
              <h2 className="text-xl font-semibold font-headline">4. Service Providers</h2>
              <p>
                We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. This includes Google AI for our AI features and Razorpay for payment processing.
              </p>
            </section>
            
            <section>
                <h2 className="text-xl font-semibold font-headline">5. Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
