'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/actions/auth';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      setLoggingIn(true);
      await signIn(email, password);
      router.replace('/');
      router.refresh();
    } catch (err: any) {
      setLoggingIn(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      {loggingIn && (
        <div className="fixed inset-0 bg-[#f8f7f5] z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#A69686]" />
            <p className="text-[#4d443c] font-medium">Iniciando sesión...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen relative overflow-hidden bg-[#f8f7f5]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#edeae6] via-[#f8f7f5] to-[#f2ede7]"></div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#A69686]/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#c7b39b]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10 border border-[#d5cec6]">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-[#A69686]">
                SkinClinic
              </h1>
              <p className="text-[#8a7d6d] mt-2">Tu centro de estética y belleza</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#4d443c] mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#d5cec6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A69686] focus:border-[#A69686] transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4d443c] mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f8f7f5] border border-[#d5cec6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A69686] focus:border-[#A69686] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#A69686] text-white py-3.5 rounded-xl font-medium hover:bg-[#8a7d6d] disabled:opacity-50 transition-all shadow-lg"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-[#b8aca0]">Sistema de gestión exclusivo</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}