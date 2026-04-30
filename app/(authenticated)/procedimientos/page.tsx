import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import ProcedimientosClient from './ProcedimientosClient';

export default async function ProcedimientosPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const { data: appUser } = await supabase
    .from('app_users')
    .select('name, role')
    .eq('id', user?.id)
    .single();

  return <ProcedimientosClient user={{ role: appUser?.role || 'user', name: appUser?.name || 'Usuario' }} />;
}