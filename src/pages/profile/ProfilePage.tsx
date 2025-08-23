'use client';

import React, { useState } from 'react';
import { useProfile } from '@/features/user-profile/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Star, 
  MessageCircle, 
  Edit3, 
  Save, 
  X,
  Upload
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ProfilePage() {
  const {
    profile,
    stats,
    isLoading,
    error,
    updateProfile,
    uploadAvatar,
    clearError,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: profile?.name || '',
    birth_date: profile?.birth_date || '',
    zodiac_sign: profile?.zodiac_sign || '',
  });

  const handleEdit = () => {
    setEditData({
      name: profile?.name || '',
      birth_date: profile?.birth_date || '',
      zodiac_sign: profile?.zodiac_sign || '',
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    clearError();
  };

  const handleSave = async () => {
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      // エラーはuseProfileで処理される
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
      } catch (error) {
        // エラーはuseProfileで処理される
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">プロフィールが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 max-w-4xl">
        {/* エラー表示 */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto p-0 text-destructive hover:text-destructive"
              >
                ✕
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* プロフィールヘッダー */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url} alt={profile.name || 'ユーザー'} />
                  <AvatarFallback className="text-2xl">
                    {profile.name ? profile.name[0].toUpperCase() : profile.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl">
                  {profile.name || '名前未設定'}
                </CardTitle>
                <CardDescription className="text-lg">
                  {profile.email}
                </CardDescription>
                {profile.zodiac_sign && (
                  <Badge variant="secondary" className="mt-2">
                    {profile.zodiac_sign}
                  </Badge>
                )}
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={isEditing ? handleCancel : handleEdit}
                className="ml-auto"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    キャンセル
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    編集
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* プロフィール詳細 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本情報 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">名前</label>
                  {isEditing ? (
                    <Input
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="名前を入力"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg mt-1">{profile.name || '未設定'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">生年月日</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.birth_date}
                      onChange={(e) => setEditData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg mt-1">{profile.birth_date || '未設定'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">星座</label>
                  {isEditing ? (
                    <Input
                      value={editData.zodiac_sign}
                      onChange={(e) => setEditData(prev => ({ ...prev, zodiac_sign: e.target.value }))}
                      placeholder="星座を入力"
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg mt-1">{profile.zodiac_sign || '未設定'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">登録日</label>
                  <p className="text-lg mt-1">
                    {new Date(profile.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    <Save className="w-4 h-4 mr-2" />
                    保存
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 統計情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                統計情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats ? (
                <>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">{stats.totalFortunes}</div>
                    <div className="text-sm text-muted-foreground">占い回数</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-3xl font-bold text-primary">{stats.totalChats}</div>
                    <div className="text-sm text-muted-foreground">チャット回数</div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">メンバー期間</span>
                      <span>{new Date(stats.memberSince).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">最終アクセス</span>
                      <span>{new Date(stats.lastActive).toLocaleDateString('ja-JP')}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  統計情報を読み込み中...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
