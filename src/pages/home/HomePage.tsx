'use client';

import React from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Heart, 
  Sparkles, 
  Calendar, 
  MessageCircle, 
  User,
  LogIn,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';

export function HomePage() {
  const { user, isLoggedIn } = useSupabase();

  const features = [
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: 'AI占い',
      description: '最新のAI技術を活用した高精度な占いサービス',
      href: '/fortune',
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-500" />,
      title: 'AIチャット',
      description: '運勢や悩みについてAIと相談できます',
      href: '/chat',
    },
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: '恋愛占い',
      description: '恋愛運や相性を詳しく占います',
      href: '/fortune?type=love',
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: 'タロット',
      description: '伝統的なタロットカードによる占い',
      href: '/fortune?type=tarot',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* ヒーローセクション */}
      <section className="text-center py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI占いサロン
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            最新のAI技術と伝統的な占術を組み合わせた、新しい占い体験をお届けします。
            あなたの運命を解き明かしましょう。
          </p>
          
          {isLoggedIn ? (
            <div className="flex gap-4 justify-center">
              <Link href="/fortune">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="w-5 h-5 mr-2" />
                  占いを始める
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="outline">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  AIと相談
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <LogIn className="w-5 h-5 mr-2" />
                  ログイン
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline">
                  <UserPlus className="w-5 h-5 mr-2" />
                  新規登録
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            豊富な占いサービス
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            なぜAI占いサロンなのか
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI技術</h3>
              <p className="text-gray-600">
                最新のAI技術により、高精度でパーソナライズされた占い結果を提供
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24時間対応</h3>
              <p className="text-gray-600">
                いつでもどこでも、あなたのペースで占いを楽しめます
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">プライバシー重視</h3>
              <p className="text-gray-600">
                あなたの個人情報は厳重に管理され、安全に占いサービスをご利用いただけます
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            今すぐ始めましょう
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            あなたの運命を解き明かす旅が始まります
          </p>
          {!isLoggedIn && (
            <Link href="/auth/signup">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <UserPlus className="w-5 h-5 mr-2" />
                無料で始める
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
