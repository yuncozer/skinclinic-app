'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOutClient } from '@/actions/auth';
import { Loader2 } from 'lucide-react';

type User = {
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  id: string;
  email: string;
};

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  user: 'Usuario'
};

export default function Header({ user }: { user: User }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await signOutClient();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {loggingOut && (
        <div className="fixed inset-0 bg-primary-50/90 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-primary-700 font-medium">Cerrando sesión...</p>
          </div>
        </div>
      )}
      <header className="h-16 bg-white border-b border-primary-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-primary-700">{user.name}</p>
            <p className="text-xs text-primary-400">{roleLabels[user.role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-sm text-primary-600 hover:text-primary-800 px-3 py-2 rounded hover:bg-primary-50 disabled:opacity-50"
        >
          Cerrar Sesión
        </button>
      </header>
    </>
  );
}