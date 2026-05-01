'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  getPatients, createPatient, updatePatient, deletePatient,
  type Patient, type CreatePatientInput, type UpdatePatientInput
} from '@/actions/patients';
import {
  getProceduresByPatient, createProcedure, deleteProcedure,
  type Procedure, type CreateProcedureInput
} from '@/actions/procedures';
import { 
  getPaymentsByProcedure, createPayment, deletePayment, getTotalPaymentsByPatient,
  type Payment, type CreatePaymentInput
} from '@/actions/payments';
import { getStandardProceduresActive, type StandardProcedure } from '@/actions/standardProcedures';

type Toast = { type: 'success' | 'error'; message: string };

type User = {
  email: string | null;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
};

type Role = 'super_admin' | 'admin' | 'user';

export default function Dashboard({ user }: { user: User }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProcedures, setLoadingProcedures] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [procedureFilter, setProcedureFilter] = useState('');
  const [standardProcedures, setStandardProcedures] = useState<StandardProcedure[]>([]);
  const [loadingStandard, setLoadingStandard] = useState(true);
  const [totalPaidReal, setTotalPaidReal] = useState(0);

  useEffect(() => {
    loadPatients();
    loadAllProcedures();
    loadStandardProcedures();
  }, []);

  async function loadStandardProcedures() {
    try {
      const data = await getStandardProceduresActive();
      setStandardProcedures(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStandard(false);
    }
  }

  useEffect(() => {
    if (selectedPatient) {
      loadProcedures(selectedPatient.id);
    }
  }, [selectedPatient]);

  function showToast(type: 'success' | 'error', message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function loadPatients() {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllProcedures() {
    try {
      const { getAllProcedures } = await import('@/actions/procedures');
      const data = await getAllProcedures();
      setAllProcedures(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadProcedures(patientId: string) {
    setLoadingProcedures(true);
    try {
      const [data, totalPaid] = await Promise.all([
        getProceduresByPatient(patientId),
        getTotalPaymentsByPatient(patientId)
      ]);
      setProcedures(data);
      setTotalPaidReal(totalPaid);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProcedures(false);
    }
  }

  const filteredPatients = useMemo(() => {
    let result = patients;

    if (searchTerm) {
      setLoadingSearch(true);
      const term = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.full_name.toLowerCase().includes(term) ||
        p.id_number.toLowerCase().includes(term) ||
        p.phone.includes(term)
      );
      setTimeout(() => setLoadingSearch(false), 300);
    }

    if (procedureFilter) {
      setLoadingSearch(true);
      const patientsWithProcedure = new Set(
        allProcedures
          .filter(pr => pr.procedure_name.toLowerCase().includes(procedureFilter.toLowerCase()))
          .map(pr => pr.patient_id)
      );
      result = result.filter(p => patientsWithProcedure.has(p.id));
      setTimeout(() => setLoadingSearch(false), 300);
    }

    return result;
  }, [patients, searchTerm, procedureFilter, allProcedures]);

  return (
    <>
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-[#059669]' : 'bg-red-600'
          } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientSection
          patients={filteredPatients}
          selectedPatient={selectedPatient}
          onSelect={setSelectedPatient}
          onCreated={loadPatients}
          onUpdated={loadPatients}
          onDeleted={loadPatients}
          loading={loading}
          loadingSearch={loadingSearch}
          showToast={showToast}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          procedureFilter={procedureFilter}
          setProcedureFilter={setProcedureFilter}
          allProcedures={allProcedures}
          role={user.role}
        />

<ProcedureSection 
          standardProcedures={standardProcedures}
          patients={patients}
          selectedPatient={selectedPatient}
          procedures={procedures}
          totalPaidReal={totalPaidReal}
          loadingProcedures={loadingProcedures}
          onSelectPatient={setSelectedPatient}
          onCreated={() => selectedPatient && loadProcedures(selectedPatient.id)}
          onDeleted={() => selectedPatient && loadProcedures(selectedPatient.id)}
          showToast={showToast}
          role={user.role}
        />
      </div>
    </>
  );
}

function PatientSection({
  patients,
  selectedPatient,
  onSelect,
  onCreated,
  onUpdated,
  onDeleted,
  loading,
  loadingSearch,
  showToast,
  searchTerm,
  setSearchTerm,
  procedureFilter,
  setProcedureFilter,
  allProcedures,
  role
}: {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelect: (p: Patient | null) => void;
  onCreated: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
  loading: boolean;
  loadingSearch: boolean;
  showToast: (type: 'success' | 'error', message: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  procedureFilter: string;
  setProcedureFilter: (s: string) => void;
  role: Role;
  allProcedures: Procedure[];
}) {
  const [form, setForm] = useState<CreatePatientInput>({ full_name: '', id_number: '', phone: '', email: '', address: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdatePatientInput>({});
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const uniqueProcedures = useMemo(() => {
    const names = new Set(allProcedures.map(p => p.procedure_name));
    return Array.from(names).sort();
  }, [allProcedures]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPatient(form);
      setForm({ full_name: '', id_number: '', phone: '', email: '', address: '' });
      onCreated();
      showToast('success', 'Paciente creado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al crear paciente');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id: string) {
    setSubmitting(true);
    try {
      await updatePatient(id, editForm);
      setEditingId(null);
      setEditForm({});
      onUpdated();
      showToast('success', 'Paciente actualizado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al actualizar paciente');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este paciente?')) return;
    try {
      await deletePatient(id);
      if (selectedPatient?.id === id) onSelect(null);
      onDeleted();
      showToast('success', 'Paciente eliminado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al eliminar paciente');
    }
  }

  function startEdit(p: Patient) {
    setEditingId(p.id);
    setEditForm({ full_name: p.full_name, id_number: p.id_number, phone: p.phone, email: p.email || '', address: p.address || '' });
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-[#4d443c]">Pacientes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showForm ? 'Ocultar formulario' : 'Agregar Paciente'}
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <input
          placeholder="Buscar por nombre, cedula o telefono..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686] text-sm"
        />
        <select
          value={procedureFilter}
          onChange={e => setProcedureFilter(e.target.value)}
          className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686] text-sm"
        >
          <option value="">Todos los procedimientos</option>
          {uniqueProcedures.map(pr => (
            <option key={pr} value={pr}>{pr}</option>
          ))}
        </select>
        {(searchTerm || procedureFilter) && (
          <p className="text-xs text-[#8a7d6d]">{patients.length} paciente(s) encontrado(s)</p>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 bg-[#f8f7f5] rounded-lg">
          <input placeholder="Nombre completo" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]" required />
          <input placeholder="Cedula" value={form.id_number} onChange={e => setForm({ ...form, id_number: e.target.value })} className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]" required />
          <input placeholder="Telefono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]" required />
          <input placeholder="Email (opcional)" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]" />
          <input placeholder="Direccion (opcional)" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]" />
          <button type="submit" disabled={submitting} className="w-full bg-[#A69686] text-white py-2 rounded-md hover:bg-[#8a7d6d] disabled:opacity-50">
            {submitting ? 'Agregando...' : 'Agregar Paciente'}
          </button>
        </form>
      )}

      <div className="max-h-80 overflow-y-auto border-t pt-4">
        {(loading || loadingSearch) ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-[#8a7d6d]">Buscando...</span>
          </div>
        ) : patients.length === 0 ? (
          <p className="text-[#8a7d6d] text-sm">No hay pacientes</p>
        ) : (
          <ul className="space-y-2">
            {patients.map(p => (
              <li key={p.id} className={`p-3 rounded-md cursor-pointer border ${selectedPatient?.id === p.id ? 'border-[#A69686] bg-[#f8f7f5]' : 'border-[#d5cec6] hover:bg-[#f8f7f5]'}`}>
                {editingId === p.id ? (
                  <div className="space-y-2">
                    <input value={editForm.full_name || ''} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Nombre" />
                    <input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Telefono" />
                    <input value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Email" />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(p.id)} disabled={submitting} className="flex-1 bg-[#059669] text-white py-1 rounded text-sm hover:bg-[#047857]">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-[#8a7d6d] text-white py-1 rounded text-sm hover:bg-[#f8f7f5]0">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => onSelect(p)}>
                    <div className="font-medium text-[#4d443c]">{p.full_name}</div>
                    <div className="text-xs text-[#8a7d6d]">C.I: {p.id_number} | {p.phone}</div>
                    {selectedPatient?.id === p.id && (
                      <div className="mt-2 flex gap-2 pt-2 border-t">
                        <button onClick={(e) => { e.stopPropagation(); startEdit(p); }} className="text-xs text-blue-600 hover:underline">Editar</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="text-xs text-red-600 hover:underline">Eliminar</button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProcedureSection({
  standardProcedures,
  patients,
  selectedPatient,
  procedures,
  totalPaidReal,
  loadingProcedures,
  onSelectPatient,
  onCreated,
  onDeleted,
  showToast,
  role
}: {
  standardProcedures: StandardProcedure[];
  patients: Patient[];
  selectedPatient: Patient | null;
  procedures: Procedure[];
  totalPaidReal: number;
  loadingProcedures: boolean;
  onSelectPatient: (p: Patient | null) => void;
  onCreated: () => void;
  onDeleted: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
  role: Role;
}) {
  const [form, setForm] = useState<Omit<CreateProcedureInput, 'patient_id'>>({ procedure_name: '', procedure_date: '', total_amount: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [expandedProcedure, setExpandedProcedure] = useState<string | null>(null);
  const [procedurePayments, setProcedurePayments] = useState<Record<string, Payment[]>>({});
  const [paymentForm, setPaymentForm] = useState<Omit<CreatePaymentInput, 'procedure_id'>>({ amount: 0, payment_date: '', notes: '' });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [customProcedureName, setCustomProcedureName] = useState('');
  const [isCustomProcedure, setIsCustomProcedure] = useState(false);

  const standardProcedureNames = standardProcedures.map(p => p.name);

  function handleSelectProcedure(value: string) {
    if (value === 'custom') {
      setIsCustomProcedure(true);
      setForm({ procedure_name: '', procedure_date: '', total_amount: 0 });
    } else {
      setIsCustomProcedure(false);
      const proc = standardProcedures.find(p => p.name === value);
      setForm({
        procedure_name: value,
        procedure_date: form.procedure_date,
        total_amount: proc ? proc.default_price : 0
      });
    }
  }

  function addCustomProcedure() {
    if (customProcedureName.trim()) {
      setForm({ ...form, procedure_name: customProcedureName.trim() });
      setCustomProcedureName('');
      setIsCustomProcedure(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPatient) { showToast('error', 'Selecciona un paciente primero'); return; }
    setSubmitting(true);
    try {
      await createProcedure({ ...form, patient_id: selectedPatient.id });
      setForm({ procedure_name: '', procedure_date: '', total_amount: 0 });
      onCreated();
      showToast('success', 'Procedimiento agregado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al crear procedimiento');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este procedimiento?')) return;
    try {
      await deleteProcedure(id);
      onDeleted();
      showToast('success', 'Procedimiento eliminado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al eliminar procedimiento');
    }
  }

  async function togglePayments(procedureId: string) {
    if (expandedProcedure === procedureId) {
      setExpandedProcedure(null);
    } else {
      setExpandedProcedure(procedureId);
      try {
        const payments = await getPaymentsByProcedure(procedureId);
        setProcedurePayments(prev => ({ ...prev, [procedureId]: payments }));
      } catch (err) {
        console.error(err);
      }
    }
  }

  async function handleAddPayment(procedureId: string) {
    if (!selectedPatient) return;
    setSubmittingPayment(true);
    try {
      const currentProcedure = procedures.find(p => p.id === procedureId);
      if (!currentProcedure) throw new Error('Procedimiento no encontrado');
      
      const currentPaid = currentProcedure.amount_paid || 0;
      const remainingBefore = currentProcedure.total_amount - currentPaid;
      
      await createPayment({ ...paymentForm, procedure_id: procedureId });
      
      const newTotalPaid = currentPaid + paymentForm.amount;
      const excess = newTotalPaid - currentProcedure.total_amount;
      
      if (excess > 0) {
        const otherProcedures = procedures.filter(p => p.id !== procedureId && (p.total_amount - (p.amount_paid || 0)) > 0);
        
        let remainingExcess = excess;
        for (const proc of otherProcedures) {
          if (remainingExcess <= 0) break;
          
          const procRemaining = proc.total_amount - (proc.amount_paid || 0);
          const amountToApply = Math.min(remainingExcess, procRemaining);
          
          if (amountToApply > 0) {
            await createPayment({
              procedure_id: proc.id,
              amount: amountToApply,
              payment_date: paymentForm.payment_date,
              notes: `Abono automático de excedente`,
              is_auto: true
            });
            remainingExcess -= amountToApply;
          }
        }
        
        if (remainingExcess > 0) {
          showToast('success', `Abono aplicado. Excedente de $${remainingExcess.toFixed(2)} registrado como saldo a favor`);
        } else {
          showToast('success', `Abono aplicado. El excedente se distribuyó automáticamente a otros procedimientos`);
        }
      } else {
        showToast('success', 'Abono agregado exitosamente');
      }
      
      setPaymentForm({ amount: 0, payment_date: '', notes: '' });
      const allPayments = await getPaymentsByProcedure(procedureId);
      setProcedurePayments(prev => ({ ...prev, [procedureId]: allPayments }));
      onCreated();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al agregar abono');
    } finally {
      setSubmittingPayment(false);
    }
  }

  async function handleDeletePayment(paymentId: string, procedureId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este abono?')) return;
    try {
      await deletePayment(paymentId);
      const payments = await getPaymentsByProcedure(procedureId);
      setProcedurePayments(prev => ({ ...prev, [procedureId]: payments }));
      onCreated();
      showToast('success', 'Abono eliminado exitosamente');
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Error al eliminar abono');
    }
  }

  const total = procedures.reduce((acc, pr) => acc + pr.total_amount, 0);
  const remaining = total - totalPaidReal;
  const hasDebt = remaining > 0;
  const positiveValue = Math.abs(remaining).toFixed(2);

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-lg font-medium text-[#4d443c] mb-4">Procedimientos</h2>

      {!selectedPatient ? (
        <p className="text-[#8a7d6d] text-sm mb-4">Selecciona un paciente para ver/agregar procedimientos</p>
      ) : (
        <div className="mb-4 p-3 bg-[#f8f7f5] rounded-lg flex justify-between items-center">
          <span className="text-sm text-blue-700 font-medium">Seleccionado: {selectedPatient.full_name}</span>
          {hasDebt ?
            <span className="text-sm text-blue-600">
              Deuda: <span className="text-red-600 font-medium">${positiveValue}</span>
            </span>
            : <span className="text-sm text-blue-600">
              Saldo a favor: <span className="text-green-600 font-medium">${positiveValue}</span>
            </span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 bg-[#f8f7f5] rounded-lg">
        <select value={selectedPatient?.id || ''} onChange={e => { const p = patients.find(pt => pt.id === e.target.value); if (p) onSelectPatient(p); }} className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]">
          <option value="">Seleccionar Paciente</option>
          {patients.map(p => (<option key={p.id} value={p.id}>{p.full_name}</option>))}
        </select>

        {!isCustomProcedure ? (
          <div className="space-y-2">
            <select
              value={form.procedure_name}
              onChange={e => handleSelectProcedure(e.target.value)}
              className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]"
            >
              <option value="">Seleccionar Procedimiento</option>
              {standardProcedureNames.map(pr => (
                <option key={pr} value={pr}>{pr}</option>
              ))}
              <option value="custom">+ Agregar personalizado</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              placeholder="Nombre del procedimiento"
              value={customProcedureName}
              onChange={e => setCustomProcedureName(e.target.value)}
              className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]"
            />
            <button
              type="button"
              onClick={addCustomProcedure}
              disabled={!customProcedureName.trim()}
              className="w-full bg-[#059669] text-white py-2 rounded-md hover:bg-[#047857] disabled:opacity-50 text-sm"
            >
              Usar como personalizado
            </button>
          </div>
        )}

        {form.procedure_name && (
          <>
            <input type="date" value={form.procedure_date} onChange={e => setForm({ ...form, procedure_date: e.target.value })} className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]" required />
            {!isCustomProcedure && standardProcedures.find(p => p.name === form.procedure_name) ? (
              <div className="space-y-1">
                <label className="text-xs text-[#8a7d6d]">Precio base: ${standardProcedures.find(p => p.name === form.procedure_name)?.default_price.toFixed(2)}</label>
                <input
                  placeholder="Monto total (editable)"
                  type="number"
                  step="0.01"
                  value={form.total_amount || ''}
                  onChange={e => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]"
                  required
                />
              </div>
            ) : (
              <input
                placeholder="Monto total"
                type="number"
                step="0.01"
                value={form.total_amount || ''}
                onChange={e => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-[#d5cec6] rounded-md focus:ring-2 focus:ring-[#A69686]"
                required
              />
            )}
          </>
        )}
        <button type="submit" disabled={submitting || !selectedPatient || !form.procedure_name || !form.procedure_date || !form.total_amount} className="w-full bg-[#A69686] text-white py-2 rounded-md hover:bg-[#8a7d6d] disabled:opacity-50">
          {submitting ? 'Agregando...' : 'Agregar Procedimiento'}
        </button>
      </form>

      <div className="max-h-96 overflow-y-auto border-t pt-4">
        {!selectedPatient ? (<p className="text-[#8a7d6d] text-sm">Selecciona un paciente</p>) : loadingProcedures ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-[#8a7d6d]">Cargando...</span>
          </div>
        ) : procedures.length === 0 ? (<p className="text-[#8a7d6d] text-sm">No hay procedimientos</p>) : (
          <ul className="space-y-3">
            {procedures.map(pr => {
              const remainingAmount = pr.total_amount - (pr.amount_paid || 0);
              const isPaid = remainingAmount <= 0;
              const isOverpaid = remainingAmount < 0;
              return (
                <li key={pr.id} className="p-3 border border-[#d5cec6] rounded-md text-sm">
                  <div className="flex justify-between items-start">
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => togglePayments(pr.id)}
                    >
                      <div className="font-medium text-[#4d443c]">{pr.procedure_name}</div>
                      <div className="text-xs text-[#8a7d6d]">{pr.procedure_date}</div>
                      <div className="mt-1 text-xs flex items-center gap-2">
                        <span className="text-[#8a7d6d] font-medium">${pr.total_amount.toFixed(2)}</span>
                        <span className="text-[#b8aca0]">|</span>
                        <span className="text-green-600">Pagado: ${(pr.amount_paid || 0).toFixed(2)}</span>
                        {isOverpaid ? (
                          <span className="text-green-600 font-medium ml-1">(Saldo a favor: ${Math.abs(remainingAmount).toFixed(2)})</span>
                        ) : isPaid ? (
                          <span className="text-green-600 ml-1">(Cancelado)</span>
                        ) : (
                          <span className="text-red-600 ml-1">Pendiente: ${remainingAmount.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDelete(pr.id)} className="text-red-600 hover:underline text-xs ml-2">Eliminar</button>
                  </div>

                  {expandedProcedure === pr.id && (
                    <div className="mt-3 pt-3 border-t border-[#d5cec6]">
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-[#4d443c] mb-2">Agregar Abono</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="number"
                            step="0.01"
                            placeholder="Monto"
                            value={paymentForm.amount || ''}
                            onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                            className="px-2 py-1 border rounded text-sm"
                          />
                          <input
                            type="date"
                            value={paymentForm.payment_date}
                            onChange={e => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                            className="px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Notas (opcional)"
                          value={paymentForm.notes}
                          onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                          className="w-full px-2 py-1 border rounded text-sm mb-2"
                        />
                        <button
                          onClick={() => handleAddPayment(pr.id)}
                          disabled={submittingPayment || !paymentForm.amount || !paymentForm.payment_date}
                          className="w-full bg-[#059669] text-white py-1 rounded text-sm hover:bg-[#047857] disabled:opacity-50"
                        >
                          {submittingPayment ? 'Agregando...' : 'Agregar Abono'}
                        </button>
                      </div>

                      {(procedurePayments[pr.id] || []).length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-[#4d443c] mb-2">Historial de Abonos</h4>
                          <ul className="space-y-1">
                            {(procedurePayments[pr.id] || []).map(pay => (
                              <li key={pay.id} className="flex justify-between items-center text-xs bg-[#f8f7f5] p-2 rounded">
                                <div>
                                  <span className="text-green-600 font-medium">${pay.amount.toFixed(2)}</span>
                                  <span className="text-[#b8aca0] ml-2">{pay.payment_date}</span>
                                  {pay.notes && <span className="text-[#8a7d6d] ml-1">- {pay.notes}</span>}
                                </div>
                                <button
                                  onClick={() => handleDeletePayment(pay.id, pr.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}