'use client';

import { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser, type AppUser, type CreateUserInput } from '@/actions/users';
import { getUserByEmail } from '@/actions/users';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

type Toast = { type: 'success' | 'error'; message: string };
type User = {
    email: string | null;
    name: string;
    role: 'super_admin' | 'admin' | 'user';
};

type Role = 'super_admin' | 'admin' | 'user';

export default function UsersPage({ user: currentUser }: { user: User }) {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<CreateUserInput>({ email: '', name: '', role: 'user', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const [newUserCredentials, setNewUserCredentials] = useState<{ email: string; password: string } | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    function showToast(type: 'success' | 'error', message: string) {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
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
            const { password } = await createUser(form);
            setForm({ email: '', name: '', role: 'user', password: '' });
            setShowForm(false);
            setNewUserCredentials({ email: form.email, password });
            loadUsers();
            showToast('success', 'Usuario creado exitosamente');
        } catch (err) {
            showToast('error', err instanceof Error ? err.message : 'Error al crear usuario');
        } finally {
            setSubmitting(false);
        }
    }

    function copyPassword() {
        if (newUserCredentials) {
            navigator.clipboard.writeText(newUserCredentials.password);
            showToast('success', 'Contraseña copiada al portapapeles');
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

            {newUserCredentials && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">Usuario Creado</h3>
                            <p className="text-slate-500 text-sm mt-1">Comparte estas credenciales con el nuevo usuario</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="label">Email</label>
                                <div className="input bg-slate-50 flex justify-between items-center">
                                    <span className="text-slate-800">{newUserCredentials.email}</span>
                                    <button 
                                        onClick={() => { navigator.clipboard.writeText(newUserCredentials.email); showToast('success', 'Email copiado'); }}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="label">Contraseña Temporal</label>
                                <div className="input bg-slate-50 flex justify-between items-center">
                                    <span className="text-slate-800 font-mono">{newUserCredentials.password}</span>
                                    <button 
                                        onClick={copyPassword}
                                        className="text-slate-400 hover:text-slate-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setNewUserCredentials(null)}
                            className="btn-primary w-full mt-6"
                        >
                            Entendido
                        </button>
                    </div>
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
                            <div>
                                <label className="label">Contraseña (opcional)</label>
                                <input
                                    placeholder="Dejar en blanco para generar automáticamente"
                                    type="password"
                                    value={form.password || ''}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="input"
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