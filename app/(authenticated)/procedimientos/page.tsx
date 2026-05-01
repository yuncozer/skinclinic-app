import ProcedimientosClient from './ProcedimientosClient';
import { getUserByEmail } from '@/actions/users';
import { createClient } from '@/lib/superbase-server';
import { redirect } from 'next/navigation';

export default async function ProcedimientosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const appUser = await getUserByEmail(user.email!);

  return <ProcedimientosClient user={{ role: appUser?.role || 'user', name: appUser?.name || 'Usuario' }} />;
}