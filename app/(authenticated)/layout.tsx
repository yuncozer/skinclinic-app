import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  if (!user) {
    redirect('/login');
  }

  const { data: appUser } = await supabase
    .from('app_users')
    .select('name, role')
    .eq('id', user.id)
    .single();

  const userData = appUser || { name: user.email?.split('@')[0] || 'Usuario', role: 'user' as const };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={userData} />
      <div className="flex-1 flex flex-col">
        <Header user={userData} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}