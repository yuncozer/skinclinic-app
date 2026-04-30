import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';
import { createClient } from '@/lib/superbase-server';
import { getUserByEmail } from '@/actions/users';

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const appUser = await getUserByEmail(user.email!);
  
  if (!appUser) {
    redirect('/login');
  }

  return <DashboardClient user={{ email: user.email ?? null, role: appUser.role, name: appUser.name }} />;
}