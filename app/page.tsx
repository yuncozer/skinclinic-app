import { redirect } from 'next/navigation';
import DashboardClient from '@/components/DashboardClient';
import { createClient } from '@/lib/superbase-server';

export default async function Page() {
  // const supabase = await createClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // if (!user) {
  //   redirect('/login');
  // }

  return <DashboardClient />;
}