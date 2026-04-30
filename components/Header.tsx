'use client';

import { useRouter } from 'next/navigation';
import { signOutClient } from '@/actions/auth';

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

  async function handleLogout() {
    await signOutClient();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{user.name}</p>
          <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-sm text-slate-600 hover:text-slate-800 px-3 py-2 rounded hover:bg-slate-100"
      >
        Cerrar Sesión
      </button>
    </header>
  );
}