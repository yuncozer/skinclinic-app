'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type Procedure = {
  id: string;
  patient_id: string;
  procedure_name: string;
  procedure_date: string;
  total_amount: number;
  created_at: string;
  amount_paid?: number;
};

export type CreateProcedureInput = {
  patient_id: string;
  procedure_name: string;
  procedure_date: string;
  total_amount: number;
};

export async function createProcedure(data: CreateProcedureInput): Promise<Procedure> {
  const { data: procedure, error } = await supabase
    .from('procedures')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create procedure: ${error.message}`);
  }

  revalidatePath('/');
  return procedure as Procedure;
}

export async function getProceduresByPatient(patientId: string): Promise<Procedure[]> {
  const { data: procedures, error } = await supabase
    .from('procedures')
    .select('*')
    .eq('patient_id', patientId)
    .order('procedure_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch procedures: ${error.message}`);
  }

  const proceduresWithPaid = await Promise.all(
    (procedures || []).map(async (proc) => {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('procedure_id', proc.id);
      
      const amount_paid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return { ...proc, amount_paid };
    })
  );

  return proceduresWithPaid as Procedure[];
}

export async function getAllProcedures(): Promise<Procedure[]> {
  const { data: procedures, error } = await supabase
    .from('procedures')
    .select('*')
    .order('procedure_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch procedures: ${error.message}`);
  }

  const proceduresWithPaid = await Promise.all(
    (procedures || []).map(async (proc) => {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('procedure_id', proc.id);
      
      const amount_paid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      return { ...proc, amount_paid };
    })
  );

  return proceduresWithPaid as Procedure[];
}

export type UpdateProcedureInput = Partial<Omit<CreateProcedureInput, 'patient_id'>>;

export async function updateProcedure(id: string, data: UpdateProcedureInput): Promise<Procedure> {
  const { data: procedure, error } = await supabase
    .from('procedures')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update procedure: ${error.message}`);
  }

  revalidatePath('/');
  return procedure as Procedure;
}

export async function deleteProcedure(id: string): Promise<void> {
  const { error } = await supabase
    .from('procedures')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete procedure: ${error.message}`);
  }

  revalidatePath('/');
}