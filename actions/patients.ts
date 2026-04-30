'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type Patient = {
  id: string;
  full_name: string;
  id_number: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
};

export type CreatePatientInput = {
  full_name: string;
  id_number: string;
  phone: string;
  email?: string;
  address?: string;
};

export async function createPatient(data: CreatePatientInput): Promise<Patient> {
  const { data: patient, error } = await supabase
    .from('patients')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create patient: ${error.message}`);
  }

  revalidatePath('/patients');
  return patient as Patient;
}

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch patients: ${error.message}`);
  }

  return data as Patient[];
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGR116') return null;
    throw new Error(`Failed to fetch patient: ${error.message}`);
  }

  return data as Patient;
}

export type UpdatePatientInput = Partial<CreatePatientInput>;

export async function updatePatient(id: string, data: UpdatePatientInput): Promise<Patient> {
  const { data: patient, error } = await supabase
    .from('patients')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update patient: ${error.message}`);
  }

  revalidatePath('/');
  return patient as Patient;
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete patient: ${error.message}`);
  }

  revalidatePath('/');
}