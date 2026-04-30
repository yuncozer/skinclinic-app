'use client';

import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, type AppUser, type CreateUserInput } from '@/actions/users';
import { getUserByEmail } from '@/actions/users';
import Header from '@/components/Header';

type Toast = { type: 'success' | 'error'; message: string };

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<{ email: string | null; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateUserInput>({ email: '', name: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCurrentUser();
    loadUsers();
  }, []);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadCurrentUser() {
    try {
      const { getUserByEmail } = await import('@/actions/users');
      const { supabase } = await import('@/lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const appUser = await getUserByEmail(user.email);
        if (appUser) {
          setCurrentUser({ email: appUser.email, name: appUser.name, role: appUser.role });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser(form);
      setForm({ email: '', name: '', role: 'user' });
      setShowForm(false);
      loadUsers();
      showToast('success', 'Usuario creado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(user: AppUser) {
    try {
      await updateUser(user.id, { active: !user.active });
      loadUsers();
      showToast('success', user.active ? 'Usuario desactivado' : 'Usuario activado');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al actualizar usuario');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
    try {
      await deleteUser(id);
      loadUsers();
      showToast('success', 'Usuario eliminado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al eliminar usuario');
    }
  }

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Administrador',
    user: 'Usuario'
  };

  const roleColors: Record<string, string> = {
    super_admin: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    user: 'bg-slate-100 text-slate-700'
  };

  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Acceso Denegado</h1>
          <p className="text-slate-500 mt-2">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}

      <Header user={{ email: currentUser.email, name: currentUser.name, role: currentUser.role as 'super_admin' | 'admin' | 'user' }} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Gestión de Usuarios</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'Cancelar' : 'Agregar Usuario'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card p-6 mb-6">
            <h2 className="text-lg font-medium text-slate-800 mb-4">Nuevo Usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Rol</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as 'super_admin' | 'admin' | 'user' })}
                  className="input"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-4"
            >
              {submitting ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        )}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Cargando...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay usuarios registrados</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Email</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Rol</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Estado</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-800">{user.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className="text-sm text-blue-600 hover:text-blue-800 mr-3"
                      >
                        {user.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}