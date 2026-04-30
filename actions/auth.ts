'use server';

import { createClient } from '@/lib/superbase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(email: string, password: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
}

export async function signOutClient() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
}