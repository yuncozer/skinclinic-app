'use client';

import { useRouter } from 'next/navigation';
import { signOutClient } from '@/actions/auth';

type User = {
  email: string | null;
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
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">SkinClinic</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="text-gray-400 mr-2">👤</span>
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md hover:bg-gray-100 border border-gray-300"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}