import { TeamPage } from '@/components/team-page';
import { redirect } from 'next/navigation';

export default function Team() {
    // This is now a directory, redirect to the default members page
    redirect('/team/members');
}

    