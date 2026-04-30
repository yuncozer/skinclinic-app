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
  password?: string;
};

export type CreateUserOutput = {
  user: AppUser;
  password: string;
};

function generateTemporaryPassword(length: number = 10): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  for (let i = 0; i < length - 3; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

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

export async function createUser(data: CreateUserInput): Promise<CreateUserOutput> {
  const password = data.password || generateTemporaryPassword();
  
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      name: data.name
    }
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  if (!authUser.user) {
    throw new Error('Failed to create auth user: No user returned');
  }

  const { data: appUser, error: appError } = await supabase
    .from('app_users')
    .insert({
      email: data.email,
      name: data.name,
      role: data.role,
      active: true
    })
    .select()
    .single();

  if (appError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create app user: ${appError.message}`);
  }

  revalidatePath('/');
  return { user: appUser as AppUser, password };
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
  const { data: user, error: fetchError } = await supabase
    .from('app_users')
    .select('email')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch user: ${fetchError.message}`);
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(user.email);

  if (authError) {
    console.error('Warning: Failed to delete auth user:', authError.message);
  }

  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }

  revalidatePath('/');
}