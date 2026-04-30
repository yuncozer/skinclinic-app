'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUserName, updateUserPassword } from '@/actions/users';

type User = {
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  id: string;
};

type Toast = { type: 'success' | 'error'; message: string };

const roleLabels = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  user: 'Usuario'
};

export default function PerfilClient({ user }: { user: User }) {
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);

  const [nameForm, setNameForm] = useState({ name: user.name, submitting: false });
  const [passwordForm, setPasswordForm] = useState({
    new: '',
    confirm: '',
    submitting: false
  });

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nameForm.name.trim()) {
      showToast('error', 'El nombre no puede estar vacío');
      return;
    }
    setNameForm(s => ({ ...s, submitting: true }));
    try {
      await updateUserName(user.id, nameForm.name.trim());
      showToast('success', 'Nombre actualizado correctamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al actualizar nombre');
    } finally {
      setNameForm(s => ({ ...s, submitting: false }));
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordForm.new || !passwordForm.confirm) {
      showToast('error', 'Todos los campos son requeridos');
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('error', 'Las contraseñas nuevas no coinciden');
      return;
    }
    if (passwordForm.new.length < 6) {
      showToast('error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setPasswordForm(s => ({ ...s, submitting: true }));
    try {
      await updateUserPassword(user.email, '', passwordForm.new);
      setPasswordForm({ new: '', confirm: '', submitting: false });
      showToast('success', 'Contraseña actualizada correctamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al actualizar contraseña');
    } finally {
      setPasswordForm(s => ({ ...s, submitting: false }));
    }
  }
  return (
    <>
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-800 mb-8">Mi Perfil</h1>

        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Información Personal</h2>

            <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Rol: {roleLabels[user.role]}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>

            <form onSubmit={handleNameSubmit} className="flex gap-3">
              <input
                type="text"
                value={nameForm.name}
                onChange={e => setNameForm(s => ({ ...s, name: e.target.value }))}
                className="input flex-1"
                placeholder="Tu nombre"
              />
              <button
                type="submit"
                disabled={nameForm.submitting || nameForm.name === user.name}
                className="btn-primary"
              >
                {nameForm.submitting ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Cambiar Contraseña</h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="label">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.new}
                  onChange={e => setPasswordForm(s => ({ ...s, new: e.target.value }))}
                  className="input"
                  placeholder="Ingresa la nueva contraseña"
                />
              </div>
              <div>
                <label className="label">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={e => setPasswordForm(s => ({ ...s, confirm: e.target.value }))}
                  className="input"
                  placeholder="Confirma la nueva contraseña"
                />
              </div>
              <button
                type="submit"
                disabled={passwordForm.submitting || !passwordForm.new || !passwordForm.confirm}
                className="btn-primary w-full"
              >
                {passwordForm.submitting ? 'Actualizando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}