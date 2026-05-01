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
      console.error('Error caught:', err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      {loggingIn && (
        <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-slate-600 font-medium">Iniciando sesión...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-linear-to-br from-blue-400 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">SkinClinic</h1>
            <p className="text-gray-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-200 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}