import { useState, useCallback, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import type { UserProfile, ProfileUpdateData, UserStats } from '../types';
import * as profileApi from '../api/profileApi';

export function useProfile() {
  const { user } = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // プロフィールの読み込み
  const loadProfile = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const profileData = await profileApi.getProfile(user.id);
      setProfile(profileData);

      // プロフィールが存在しない場合は作成
      if (!profileData) {
        const newProfile = await profileApi.createProfile({
          id: user.id,
          email: user.email || '',
        });
        setProfile(newProfile);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロフィールの読み込みに失敗しました。';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 統計情報の読み込み
  const loadStats = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const statsData = await profileApi.getUserStats(user.id);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '統計情報の読み込みに失敗しました。';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 初期化
  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user, loadProfile, loadStats]);

  // プロフィールの更新
  const updateProfile = useCallback(async (updates: ProfileUpdateData): Promise<UserProfile> => {
    if (!user || !profile) {
      throw new Error('プロフィールが読み込まれていません。');
    }

    try {
      setIsLoading(true);
      setError(null);

      const updatedProfile = await profileApi.updateProfile(user.id, updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'プロフィールの更新に失敗しました。';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, profile]);

  // アバターのアップロード
  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    if (!user) {
      throw new Error('ログインが必要です。');
    }

    try {
      setIsLoading(true);
      setError(null);

      const avatarUrl = await profileApi.uploadAvatar(user.id, file);
      
      // プロフィールを更新
      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      
      return avatarUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'アバターのアップロードに失敗しました。';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // エラーのクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // プロフィールの再読み込み
  const refreshProfile = useCallback(async () => {
    await Promise.all([loadProfile(), loadStats()]);
  }, [loadProfile, loadStats]);

  return {
    profile,
    stats,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    clearError,
    refreshProfile,
  };
}
