import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { getUserByEmail } from '@/actions/users';

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
        setAll() { },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const appUser = await getUserByEmail(user.email!);

  if (!appUser) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <div className="h-full">
        <Sidebar user={appUser} />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header fijo */}
        <div className="shrink-0">
          <Header user={appUser} />
        </div>

        {/* Scroll SOLO aquí */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}