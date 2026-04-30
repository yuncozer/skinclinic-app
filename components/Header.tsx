'use client';

import { useRouter } from 'next/navigation';
import { signOutClient } from '@/actions/auth';
import Link from 'next/link';

type User = {
  email: string | null;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
};

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  user: 'Usuario'
};

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  user: 'bg-slate-100 text-slate-700'
};

export default function Header({ user }: { user: User }) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOutClient();
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href={"/"}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.414 1.414.586 3.414 0 3.414V12" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">SkinClinic</h1>
          </Link>

          <div className='flex items-center gap-3'>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary flex items-center gap-1.5"
            >
              Home
            </button>
            {user.role === 'super_admin' && (
              <button
                onClick={() => router.push('/usuarios')}
                className="btn-secondary flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Usuarios
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <div className="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sm text-slate-800 font-medium">{user.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Salir
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}