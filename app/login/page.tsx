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
        <div className="fixed inset-0 bg-primary-50/90 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-primary-700 font-medium">Iniciando sesión...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a69686' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md p-10 border border-white/50">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-primary-700">
                SkinClinic
              </h1>
              <p className="text-primary-400 mt-2">Tu centro de estética y belleza</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-primary-50 border border-primary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all"
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
                className="w-full bg-primary-500 text-white py-3.5 rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
              >
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-primary-300">Sistema de gestión exclusivo</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}