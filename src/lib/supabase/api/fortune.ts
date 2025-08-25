import { supabase } from '../client';

export interface FortuneResult {
  id: string;
  user_id: string;
  fortune_type: string;
  question: string;
  result: string;
  created_at: string;
}

export async function saveFortuneResult(fortune: Omit<FortuneResult, 'id' | 'created_at'>): Promise<FortuneResult> {
  const { data, error } = await supabase
    .from('fortune_results')
    .insert(fortune)
    .select()
    .single();

  if (error) {
    console.error('Error saving fortune result:', error);
    throw new Error('占い結果の保存に失敗しました。');
  }
  return data;
}

export async function getFortuneHistory(userId: string): Promise<FortuneResult[]> {
  const { data, error } = await supabase
    .from('fortune_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fortune history:', error);
    throw new Error('占い履歴の取得に失敗しました。');
  }
  return data || [];
}

export async function getFortuneResult(id: string): Promise<FortuneResult | null> {
  const { data, error } = await supabase
    .from('fortune_results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching fortune result:', error);
    throw new Error('占い結果の取得に失敗しました。');
  }
  return data;
}
