import { supabase } from '../client';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    throw new Error('プロフィールの取得に失敗しました。');
  }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error('プロフィールの更新に失敗しました。');
  }
  return data;
}

export async function createProfile(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .insert(profile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw new Error('プロフィールの作成に失敗しました。');
  }
  return data;
}
