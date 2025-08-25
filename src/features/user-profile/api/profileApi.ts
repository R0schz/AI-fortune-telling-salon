import { supabase } from '@/lib/supabase/client';
import type { UserProfile, ProfileUpdateData, UserStats } from '../types';

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

export async function updateProfile(userId: string, updates: ProfileUpdateData): Promise<UserProfile> {
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

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // 占い回数の取得
    const { count: fortuneCount } = await supabase
      .from('fortune_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // チャット回数の取得
    const { count: chatCount } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // プロフィール情報の取得
    const profile = await getProfile(userId);
    
    return {
      totalFortunes: fortuneCount || 0,
      totalChats: chatCount || 0,
      memberSince: profile?.created_at || new Date().toISOString(),
      lastActive: profile?.updated_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw new Error('ユーザー統計の取得に失敗しました。');
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath);

    // プロフィールを更新
    await updateProfile(userId, { avatar_url: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('アバターのアップロードに失敗しました。');
  }
}
