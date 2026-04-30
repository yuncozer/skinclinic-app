'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type Payment = {
  id: string;
  procedure_id: string;
  amount: number;
  payment_date: string;
  notes: string | null;
  created_at: string;
};

export type CreatePaymentInput = {
  procedure_id: string;
  amount: number;
  payment_date: string;
  notes?: string;
};

export async function createPayment(data: CreatePaymentInput): Promise<Payment> {
  const { data: payment, error } = await supabase
    .from('payments')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment: ${error.message}`);
  }

  revalidatePath('/');
  return payment as Payment;
}

export async function getPaymentsByProcedure(procedureId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('procedure_id', procedureId)
    .order('payment_date', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  return data as Payment[];
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete payment: ${error.message}`);
  }

  revalidatePath('/');
}

export async function getTotalPaidByProcedure(procedureId: string): Promise<number> {
  const { data, error } = await supabase
    .from('payments')
    .select('amount')
    .eq('procedure_id', procedureId);

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  return data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
}