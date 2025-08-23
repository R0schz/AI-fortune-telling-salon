import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { Message, ChatMode, ChatState } from '../types';
import * as chatApi from '../api/chatApi';

export function useChat(mode: ChatMode = 'general') {
  const { user } = useSupabase();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    mode,
  });

  // 初期メッセージの設定
  useEffect(() => {
    if (mode === 'fortune') {
      setState(prev => ({
        ...prev,
        messages: [{
          id: 'welcome',
          content: 'こんにちは！あなたの運勢についてお聞かせください。何かお困りのことがありますか？',
          role: 'assistant',
          timestamp: new Date(),
        }],
        mode,
      }));
    } else if (mode === 'tarot') {
      setState(prev => ({
        ...prev,
        messages: [{
          id: 'welcome',
          content: 'タロットカードであなたの未来を占いましょう。何について知りたいですか？',
          role: 'assistant',
          timestamp: new Date(),
        }],
        mode,
      }));
    } else if (mode === 'numerology') {
      setState(prev => ({
        ...prev,
        messages: [{
          id: 'welcome',
          content: '数秘術であなたの運命数を調べてみましょう。生年月日を教えてください。',
          role: 'assistant',
          timestamp: new Date(),
        }],
        mode,
      }));
    }
  }, [mode]);

  // チャット履歴の読み込み
  const loadChatHistory = useCallback(async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const sessions = await chatApi.getChatHistory(user.id);
      
      if (sessions.length > 0) {
        const latestSession = sessions[0];
        setState(prev => ({
          ...prev,
          messages: latestSession.messages,
          isLoading: false,
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'チャット履歴の読み込みに失敗しました。',
      }));
    }
  }, [user]);

  // メッセージの送信
  const sendMessage = useCallback(async (content: string) => {
    if (!user || !content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    // ユーザーメッセージを即座に追加
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // AIからの応答を取得
      const aiResponse = await chatApi.sendMessageToAI(content, state.mode);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      const newMessages = [...state.messages, userMessage, assistantMessage];

      // 状態を更新
      setState(prev => ({
        ...prev,
        messages: newMessages,
        isLoading: false,
      }));

      // チャットセッションを保存
      if (newMessages.length > 2) { // 初期メッセージ + ユーザーメッセージ + AI応答
        await chatApi.saveChatSession({
          userId: user.id,
          messages: newMessages,
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'メッセージの送信に失敗しました。',
      }));
    }
  }, [user, state.mode, state.messages]);

  // チャットのリセット
  const resetChat = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  // エラーのクリア
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sendMessage,
    loadChatHistory,
    resetChat,
    clearError,
  };
}
