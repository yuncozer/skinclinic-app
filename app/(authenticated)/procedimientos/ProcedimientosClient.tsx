'use client';

import { useEffect, useState } from 'react';
import { 
  getStandardProcedures, 
  createStandardProcedure, 
  updateStandardProcedure, 
  deleteStandardProcedure,
  type StandardProcedure 
} from '@/actions/standardProcedures';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';

type User = {
  name: string;
  role: 'super_admin' | 'admin' | 'user';
};

type Toast = { type: 'success' | 'error'; message: string };

export default function ProcedimientosClient({ user }: { user: User }) {
  const [procedures, setProcedures] = useState<StandardProcedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', default_price: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit = user.role === 'super_admin' || user.role === 'admin';
  const filteredProcedures = searchTerm
    ? procedures.filter(p => normalizeText(p.name).includes(normalizeText(searchTerm)))
    : procedures;

  useEffect(() => {
    loadProcedures();
  }, []);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  function normalizeText(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function isDuplicateName(name: string, excludeId?: string): boolean {
    const normalizedName = normalizeText(name);
    return procedures.some(p => 
      normalizeText(p.name) === normalizedName && p.id !== excludeId
    );
  }

  async function loadProcedures() {
    try {
      const data = await getStandardProcedures();
      setProcedures(data);
    } catch (e) {
      showToast('error', 'Error al cargar procedimientos');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.default_price) {
      showToast('error', 'Todos los campos son requeridos');
      return;
    }
    if (isDuplicateName(form.name.trim(), editingId || undefined)) {
      showToast('error', 'Ya existe un procedimiento con ese nombre');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await updateStandardProcedure(editingId, {
          name: form.name.trim(),
          default_price: parseFloat(form.default_price),
        });
        showToast('success', 'Procedimiento actualizado');
      } else {
        await createStandardProcedure({
          name: form.name.trim(),
          default_price: parseFloat(form.default_price),
        });
        showToast('success', 'Procedimiento creado');
      }
      setForm({ name: '', default_price: '' });
      setShowForm(false);
      setEditingId(null);
      loadProcedures();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await deleteStandardProcedure(id);
      showToast('success', 'Procedimiento eliminado');
      loadProcedures();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al eliminar');
    }
  }

  function openEdit(proc: StandardProcedure) {
    setForm({ name: proc.name, default_price: proc.default_price.toString() });
    setEditingId(proc.id);
    setShowForm(true);
  }

  function closeForm() {
    setForm({ name: '', default_price: '' });
    setShowForm(false);
    setEditingId(null);
  }

  if (!canEdit) {
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
    <>
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-800">Procedimientos Estándar</h1>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-slate-800">
                {editingId ? 'Editar Procedimiento' : 'Nuevo Procedimiento'}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder="Nombre del procedimiento"
                  required
                />
              </div>
              <div>
                <label className="label">Precio Base ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.default_price}
                  onChange={e => setForm({ ...form, default_price: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full"
              >
                {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
              </button>
            </form>
          </div>
        )}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Cargando...</div>
          ) : procedures.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hay procedimientos registrados</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Precio Base</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Estado</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProcedures.map(proc => (
                  <tr key={proc.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 text-sm text-slate-800">{proc.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">${proc.default_price.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        proc.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {proc.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(proc)}
                        className="text-slate-600 hover:text-slate-800 mr-3"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(proc.id, proc.name)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}