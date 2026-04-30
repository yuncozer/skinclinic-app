'use server';

import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type StandardProcedure = {
  id: string;
  name: string;
  default_price: number;
  active: boolean;
  created_at: string;
};

export type CreateStandardProcedureInput = {
  name: string;
  default_price: number;
};

export type UpdateStandardProcedureInput = Partial<CreateStandardProcedureInput> & { active?: boolean };

export async function getStandardProcedures(): Promise<StandardProcedure[]> {
  const { data: procedures, error } = await supabaseAdmin
    .from('standard_procedures')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch standard procedures: ${error.message}`);
  }

  return procedures as StandardProcedure[];
}

export async function getStandardProceduresActive(): Promise<StandardProcedure[]> {
  const { data: procedures, error } = await supabaseAdmin
    .from('standard_procedures')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch active standard procedures: ${error.message}`);
  }

  return procedures as StandardProcedure[];
}

export async function createStandardProcedure(data: CreateStandardProcedureInput): Promise<StandardProcedure> {
  const { data: procedure, error } = await supabaseAdmin
    .from('standard_procedures')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create standard procedure: ${error.message}`);
  }

  revalidatePath('/');
  return procedure as StandardProcedure;
}

export async function updateStandardProcedure(id: string, data: UpdateStandardProcedureInput): Promise<StandardProcedure> {
  const { data: procedure, error } = await supabaseAdmin
    .from('standard_procedures')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update standard procedure: ${error.message}`);
  }

  revalidatePath('/');
  return procedure as StandardProcedure;
}

export async function deleteStandardProcedure(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('standard_procedures')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete standard procedure: ${error.message}`);
  }

  revalidatePath('/');
}

export async function toggleStandardProcedure(id: string, active: boolean): Promise<StandardProcedure> {
  return updateStandardProcedure(id, { active });
}