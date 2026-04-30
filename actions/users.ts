'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
  active: boolean;
  created_at: string;
};

export type CreateUserInput = {
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'user';
};

export async function getUsers(): Promise<AppUser[]> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return data as AppUser[];
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGR116') return null;
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data as AppUser;
}

export async function createUser(data: CreateUserInput): Promise<AppUser> {
  const { data: user, error } = await supabase
    .from('app_users')
    .insert({ ...data, active: true })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  revalidatePath('/');
  return user as AppUser;
}

export async function updateUser(id: string, data: Partial<CreateUserInput & { active: boolean }>): Promise<AppUser> {
  const { data: user, error } = await supabase
    .from('app_users')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user: ${error.message}`);
  }

  revalidatePath('/');
  return user as AppUser;
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  revalidatePath('/');
}