import { useState, useCallback } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { FortuneType, FortuneQuestion, FortuneResult, FortuneSession } from '../types';
import type { TarotReadingResult, HoroscopeInput, HoroscopeOutput } from '../types';
import * as fortuneApi from '../api/fortuneApi';

export function useFortune() {
  const { user } = useSupabase();
  const [currentSession, setCurrentSession] = useState<FortuneSession | null>(null);
  const [currentTarotResult, setCurrentTarotResult] = useState<TarotReadingResult | null>(null);
  const [currentHoroscopeResult, setCurrentHoroscopeResult] = useState<HoroscopeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startFortune = useCallback(async (
    type: FortuneType,
    question: string,
    details?: string
  ): Promise<FortuneSession> => {
    if (!user) {
      throw new Error('ログインが必要です。');
    }

    try {
      setIsLoading(true);
      setError(null);

      const session = await fortuneApi.createFortuneSession(
        user.id,
        type,
        question,
        details
      );

      setCurrentSession(session);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '占いの開始に失敗しました。';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const performFortune = useCallback(async (): Promise<FortuneResult> => {
    if (!currentSession) {
      throw new Error('占いセッションが開始されていません。');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await fortuneApi.performFortune(currentSession.id);
      
      // セッションを更新
      await fortuneApi.updateFortuneSession(currentSession.id, result);
      
      setCurrentSession((prev: FortuneSession | null) => prev ? {
        ...prev,
        result,
        status: 'completed',
        updatedAt: new Date(),
      } : null);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '占いの実行に失敗しました。';
      setError(errorMessage);
      
      // セッションを失敗状態に更新
      if (currentSession) {
        await fortuneApi.updateFortuneSession(currentSession.id, {} as FortuneResult, 'failed');
        setCurrentSession((prev: FortuneSession | null) => prev ? { ...prev, status: 'failed' } : null);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  // タロット占いの実行
  const performTarotFortune = useCallback(async (question: string): Promise<TarotReadingResult> => {
    if (!user) {
      throw new Error('ログインが必要です。');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await fortuneApi.performTarotFortune(question);
      setCurrentTarotResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'タロット占いの実行に失敗しました。';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ホロスコープ（西洋占星術）の実行
  const performHoroscopeFortune = useCallback(async (input: HoroscopeInput): Promise<HoroscopeOutput> => {
    if (!user) {
      throw new Error('ログインが必要です。');
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await fortuneApi.performHoroscopeFortune(input);
      setCurrentHoroscopeResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ホロスコープの計算に失敗しました。';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getFortuneHistory = useCallback(async (): Promise<FortuneSession[]> => {
    if (!user) {
      throw new Error('ログインが必要です。');
    }

    try {
      setIsLoading(true);
      setError(null);

      const history = await fortuneApi.getFortuneHistory(user.id);
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '占い履歴の取得に失敗しました。';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setCurrentTarotResult(null);
    setCurrentHoroscopeResult(null);
    setError(null);
  }, []);

  return {
    currentSession,
    currentTarotResult,
    currentHoroscopeResult,
    isLoading,
    error,
    startFortune,
    performFortune,
    performTarotFortune,
    performHoroscopeFortune,
    getFortuneHistory,
    clearError,
    resetSession,
  };
}
