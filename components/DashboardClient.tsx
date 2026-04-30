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
  getPaymentsByProcedure, createPayment, deletePayment,
  type Payment, type CreatePaymentInput
} from '@/actions/payments';

type Toast = { type: 'success' | 'error'; message: string };

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [procedureFilter, setProcedureFilter] = useState('');

  useEffect(() => {
    loadPatients();
    loadAllProcedures();
  }, []);

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
    try {
      const data = await getProceduresByPatient(patientId);
      setProcedures(data);
    } catch (e) {
      console.error(e);
    }
  }

  const filteredPatients = useMemo(() => {
    let result = patients;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.full_name.toLowerCase().includes(term) ||
        p.id_number.toLowerCase().includes(term) ||
        p.phone.includes(term)
      );
    }

    if (procedureFilter) {
      const patientsWithProcedure = new Set(
        allProcedures
          .filter(pr => pr.procedure_name.toLowerCase().includes(procedureFilter.toLowerCase()))
          .map(pr => pr.patient_id)
      );
      result = result.filter(p => patientsWithProcedure.has(p.id));
    }

    return result;
  }, [patients, searchTerm, procedureFilter, allProcedures]);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">SkinClinic</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatientSection 
            patients={filteredPatients} 
            selectedPatient={selectedPatient}
            onSelect={setSelectedPatient}
            onCreated={loadPatients}
            onUpdated={loadPatients}
            onDeleted={loadPatients}
            loading={loading}
            showToast={showToast}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            procedureFilter={procedureFilter}
            setProcedureFilter={setProcedureFilter}
            allProcedures={allProcedures}
          />
          
          <ProcedureSection 
            patients={patients}
            selectedPatient={selectedPatient}
            procedures={procedures}
            onSelectPatient={setSelectedPatient}
            onCreated={() => selectedPatient && loadProcedures(selectedPatient.id)}
            onDeleted={() => selectedPatient && loadProcedures(selectedPatient.id)}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
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
  showToast,
  searchTerm,
  setSearchTerm,
  procedureFilter,
  setProcedureFilter,
  allProcedures
}: {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelect: (p: Patient | null) => void;
  onCreated: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
  loading: boolean;
  showToast: (type: 'success' | 'error', message: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  procedureFilter: string;
  setProcedureFilter: (s: string) => void;
  allProcedures: Procedure[];
}) {
  const [form, setForm] = useState<CreatePatientInput>({ full_name: '', id_number: '', phone: '', email: '', address: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdatePatientInput>({});
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(true);

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
        <h2 className="text-lg font-medium text-gray-700">Pacientes</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-600 hover:underline"
        >
          {showForm ? 'Ocultar formulario' : 'Mostrar formulario'}
        </button>
      </div>

      <div className="mb-4 space-y-2">
        <input 
          placeholder="Buscar por nombre, cedula o telefono..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <select 
          value={procedureFilter}
          onChange={e => setProcedureFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">Todos los procedimientos</option>
          {uniqueProcedures.map(pr => (
            <option key={pr} value={pr}>{pr}</option>
          ))}
        </select>
        {(searchTerm || procedureFilter) && (
          <p className="text-xs text-gray-500">{patients.length} paciente(s) encontrado(s)</p>
        )}
      </div>
      
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <input placeholder="Nombre completo" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
          <input placeholder="Cedula" value={form.id_number} onChange={e => setForm({ ...form, id_number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
          <input placeholder="Telefono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
          <input placeholder="Email (opcional)" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          <input placeholder="Direccion (opcional)" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
          <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
            {submitting ? 'Agregando...' : 'Agregar Paciente'}
          </button>
        </form>
      )}

      <div className="max-h-80 overflow-y-auto border-t pt-4">
        {loading ? (
          <p className="text-gray-500 text-sm">Cargando...</p>
        ) : patients.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay pacientes</p>
        ) : (
          <ul className="space-y-2">
            {patients.map(p => (
              <li key={p.id} className={`p-3 rounded-md cursor-pointer border ${selectedPatient?.id === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                {editingId === p.id ? (
                  <div className="space-y-2">
                    <input value={editForm.full_name || ''} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Nombre" />
                    <input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Telefono" />
                    <input value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Email" />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(p.id)} disabled={submitting} className="flex-1 bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-400 text-white py-1 rounded text-sm hover:bg-gray-500">Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => onSelect(p)}>
                    <div className="font-medium text-gray-800">{p.full_name}</div>
                    <div className="text-xs text-gray-500">C.I: {p.id_number} | {p.phone}</div>
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

const DEFAULT_PROCEDURES = ['Botox', 'Limpieza Facial', 'Péptidos'];

function ProcedureSection({
  patients,
  selectedPatient,
  procedures,
  onSelectPatient,
  onCreated,
  onDeleted,
  showToast
}: {
  patients: Patient[];
  selectedPatient: Patient | null;
  procedures: Procedure[];
  onSelectPatient: (p: Patient | null) => void;
  onCreated: () => void;
  onDeleted: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}) {
  const [form, setForm] = useState<Omit<CreateProcedureInput, 'patient_id'>>({ procedure_name: '', procedure_date: '', total_amount: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [expandedProcedure, setExpandedProcedure] = useState<string | null>(null);
  const [procedurePayments, setProcedurePayments] = useState<Record<string, Payment[]>>({});
  const [paymentForm, setPaymentForm] = useState<Omit<CreatePaymentInput, 'procedure_id'>>({ amount: 0, payment_date: '', notes: '' });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [customProcedures, setCustomProcedures] = useState<string[]>([]);
  const [isCustomProcedure, setIsCustomProcedure] = useState(false);
  const [newCustomProcedure, setNewCustomProcedure] = useState('');

  const allProcedures = [...DEFAULT_PROCEDURES, ...customProcedures];

  useEffect(() => {
    const stored = localStorage.getItem('customProcedures');
    if (stored) {
      setCustomProcedures(JSON.parse(stored));
    }
  }, []);

  function handleSelectProcedure(value: string) {
    if (value === 'custom') {
      setIsCustomProcedure(true);
      setForm({ ...form, procedure_name: '' });
    } else {
      setIsCustomProcedure(false);
      setForm({ ...form, procedure_name: value });
    }
  }

  function addCustomProcedure() {
    if (newCustomProcedure.trim() && !allProcedures.includes(newCustomProcedure.trim())) {
      const updated = [...customProcedures, newCustomProcedure.trim()];
      setCustomProcedures(updated);
      localStorage.setItem('customProcedures', JSON.stringify(updated));
      setForm({ ...form, procedure_name: newCustomProcedure.trim() });
      setNewCustomProcedure('');
      setIsCustomProcedure(false);
      showToast('success', 'Procedimiento personalizado agregado');
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
    setSubmittingPayment(true);
    try {
      await createPayment({ ...paymentForm, procedure_id: procedureId });
      setPaymentForm({ amount: 0, payment_date: '', notes: '' });
      const payments = await getPaymentsByProcedure(procedureId);
      setProcedurePayments(prev => ({ ...prev, [procedureId]: payments }));
      onCreated();
      showToast('success', 'Abono agregado exitosamente');
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
  const paid = procedures.reduce((acc, pr) => acc + (pr.amount_paid || 0), 0);
  const remaining = total - paid;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Procedimientos</h2>
      
      {!selectedPatient ? (
        <p className="text-gray-500 text-sm mb-4">Selecciona un paciente para ver/agregar procedimientos</p>
      ) : (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
          <span className="text-sm text-blue-700 font-medium">Seleccionado: {selectedPatient.full_name}</span>
          <span className="text-sm text-blue-600">
            Saldo: <span className="text-red-600 font-medium">${remaining.toFixed(2)}</span>
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
        <select value={selectedPatient?.id || ''} onChange={e => { const p = patients.find(pt => pt.id === e.target.value); if (p) onSelectPatient(p); }} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
          <option value="">Seleccionar Paciente</option>
          {patients.map(p => (<option key={p.id} value={p.id}>{p.full_name}</option>))}
        </select>
        
        {!isCustomProcedure ? (
          <div className="space-y-2">
            <select 
              value={form.procedure_name} 
              onChange={e => handleSelectProcedure(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar Procedimiento</option>
              {allProcedures.map(pr => (
                <option key={pr} value={pr}>{pr}</option>
              ))}
              <option value="custom">+ Agregar personalizado</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <input 
              placeholder="Nombre del procedimiento"
              value={newCustomProcedure}
              onChange={e => setNewCustomProcedure(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={addCustomProcedure}
                disabled={!newCustomProcedure.trim()}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
              >
                Agregar
              </button>
              <button 
                type="button"
                onClick={() => { setIsCustomProcedure(false); setNewCustomProcedure(''); }}
                className="flex-1 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        {form.procedure_name && (
          <>
            <input type="date" value={form.procedure_date} onChange={e => setForm({ ...form, procedure_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
            <input placeholder="Monto total" type="number" step="0.01" value={form.total_amount || ''} onChange={e => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
          </>
        )}
        <button type="submit" disabled={submitting || !selectedPatient || !form.procedure_name || !form.procedure_date || !form.total_amount} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {submitting ? 'Agregando...' : 'Agregar Procedimiento'}
        </button>
      </form>

      <div className="max-h-96 overflow-y-auto border-t pt-4">
        {!selectedPatient ? (<p className="text-gray-500 text-sm">Selecciona un paciente</p>) : procedures.length === 0 ? (<p className="text-gray-500 text-sm">No hay procedimientos</p>) : (
          <ul className="space-y-3">
            {procedures.map(pr => {
              const remainingAmount = pr.total_amount - (pr.amount_paid || 0);
              const isPaid = remainingAmount <= 0;
              return (
                <li key={pr.id} className="p-3 border border-gray-200 rounded-md text-sm">
                  <div className="flex justify-between items-start">
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => togglePayments(pr.id)}
                    >
                      <div className="font-medium text-gray-800">{pr.procedure_name}</div>
                      <div className="text-xs text-gray-500">{pr.procedure_date}</div>
                      <div className="mt-1 text-xs flex items-center gap-2">
                        <span className="text-gray-600 font-medium">${pr.total_amount.toFixed(2)}</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-green-600">Pagado: ${(pr.amount_paid || 0).toFixed(2)}</span>
                        <span className={`ml-1 ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                          {isPaid ? '(Cancelado)' : `Pendiente: $${remainingAmount.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(pr.id)} className="text-red-600 hover:underline text-xs ml-2">Eliminar</button>
                  </div>

                  {expandedProcedure === pr.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Agregar Abono</h4>
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
                          className="w-full bg-green-600 text-white py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          {submittingPayment ? 'Agregando...' : 'Agregar Abono'}
                        </button>
                      </div>

                      {(procedurePayments[pr.id] || []).length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Historial de Abonos</h4>
                          <ul className="space-y-1">
                            {(procedurePayments[pr.id] || []).map(pay => (
                              <li key={pay.id} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                                <div>
                                  <span className="text-green-600 font-medium">${pay.amount.toFixed(2)}</span>
                                  <span className="text-gray-400 ml-2">{pay.payment_date}</span>
                                  {pay.notes && <span className="text-gray-500 ml-1">- {pay.notes}</span>}
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