import { supabase } from '@/lib/supabase/client';
import type { Message, ChatSession, ChatMode } from '../types';

export async function getChatHistory(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat history:', error);
    throw new Error('チャット履歴の取得に失敗しました。');
  }

  return (data || []).map(session => ({
    ...session,
    messages: session.messages || [],
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at),
  }));
}

export async function saveChatSession(session: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: session.userId,
      messages: session.messages,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving chat session:', error);
    throw new Error('チャットセッションの保存に失敗しました。');
  }

  return {
    ...data,
    messages: data.messages || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export async function updateChatSession(sessionId: string, messages: Message[]): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ 
      messages,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating chat session:', error);
    throw new Error('チャットセッションの更新に失敗しました。');
  }
}

export async function sendMessageToAI(message: string, mode: ChatMode): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        mode,
      }),
    });

    if (!response.ok) {
      throw new Error('AIからの応答の取得に失敗しました。');
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error sending message to AI:', error);
    throw new Error('AIとの通信に失敗しました。');
  }
}
