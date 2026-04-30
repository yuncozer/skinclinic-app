import { redirect } from 'next/navigation';
import { createClient } from '@/lib/superbase-server';
import { getUserByEmail, updateUserName, updateUserPassword } from '@/actions/users';
import PerfilClient from './PerfilClient';

export default async function PerfilPage() {
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

  return (
    <PerfilClient 
      user={{ 
        email: user.email!, 
        name: appUser.name, 
        role: appUser.role,
        id: appUser.id
      }} 
    />
  );
}