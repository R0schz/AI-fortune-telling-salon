import { supabase } from '@/lib/supabase/client';
import type { FortuneType, FortuneQuestion, FortuneResult, FortuneSession } from '../types';
import type { TarotReadingResult, HoroscopeInput, HoroscopeOutput } from '../types';
import { performTarotReading } from '../lib/tarotLogic';
import { calculateHoroscope } from '../lib/horoscopeLogic';

export async function createFortuneSession(
  userId: string,
  type: FortuneType,
  question: string,
  details?: string
): Promise<FortuneSession> {
  const questionData: Omit<FortuneQuestion, 'id'> = {
    type,
    question,
    details,
  };

  const { data, error } = await supabase
    .from('fortune_sessions')
    .insert({
      user_id: userId,
      fortune_type: type,
      question: questionData,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating fortune session:', error);
    throw new Error('占いセッションの作成に失敗しました。');
  }

  return {
    ...data,
    question: data.question as FortuneQuestion,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function performFortune(sessionId: string): Promise<FortuneResult> {
  try {
    const response = await fetch('/api/fortune', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      throw new Error('占いの実行に失敗しました。');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error performing fortune:', error);
    throw new Error('占いの実行中にエラーが発生しました。');
  }
}

// タロット占いの実行
export async function performTarotFortune(question: string): Promise<TarotReadingResult> {
  try {
    const result = await performTarotReading(question);
    return result;
  } catch (error) {
    console.error('Error performing tarot fortune:', error);
    throw new Error('タロット占いの実行に失敗しました。');
  }
}

// ホロスコープ（西洋占星術）の実行
export async function performHoroscopeFortune(input: HoroscopeInput): Promise<HoroscopeOutput> {
  try {
    const result = calculateHoroscope(input);
    return result;
  } catch (error) {
    console.error('Error performing horoscope fortune:', error);
    throw new Error('ホロスコープの計算に失敗しました。');
  }
}

export async function updateFortuneSession(
  sessionId: string,
  result: FortuneResult,
  status: 'completed' | 'failed' = 'completed'
): Promise<void> {
  const { error } = await supabase
    .from('fortune_sessions')
    .update({
      result,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating fortune session:', error);
    throw new Error('占いセッションの更新に失敗しました。');
  }
}

export async function getFortuneHistory(userId: string): Promise<FortuneSession[]> {
  const { data, error } = await supabase
    .from('fortune_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fortune history:', error);
    throw new Error('占い履歴の取得に失敗しました。');
  }

  return (data || []).map((session: any) => ({
    ...session,
    question: session.question as FortuneQuestion,
    result: session.result as FortuneResult | undefined,
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at),
  }));
}

export async function getFortuneSession(sessionId: string): Promise<FortuneSession | null> {
  const { data, error } = await supabase
    .from('fortune_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) {
    console.error('Error fetching fortune session:', error);
    throw new Error('占いセッションの取得に失敗しました。');
  }

  if (!data) return null;

  return {
    ...data,
    question: data.question as FortuneQuestion,
    result: data.result as FortuneResult | undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
