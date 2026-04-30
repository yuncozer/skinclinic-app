import { redirect } from 'next/navigation';
import { createClient } from '@/lib/superbase-server';
import { getUserByEmail } from '@/actions/users';
import UsersPage from './UsuariosPage';

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

  return <UsersPage user={{ email: user.email ?? null, role: appUser.role, name: appUser.name }} />;
}