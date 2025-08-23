'use client';

import React, { useState } from 'react';
import { TarotReading } from '@/features/fortune/components/TarotReading';
import { HoroscopeReading } from '@/features/fortune/components/HoroscopeReading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Star, TarotCard } from 'lucide-react';

export default function FortunePage() {
  const [selectedFortune, setSelectedFortune] = useState<'tarot' | 'horoscope' | null>(null);

  const fortuneTypes = [
    {
      id: 'tarot',
      name: 'タロット占い',
      description: 'タロットカードであなたの運命を占います',
      icon: <TarotCard className="w-8 h-8 text-purple-600" />,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'horoscope',
      name: 'ホロスコープ',
      description: '西洋占星術であなたの星の配置を分析します',
      icon: <Star className="w-8 h-8 text-blue-600" />,
      color: 'bg-blue-600 hover:bg-blue-700'
    }
  ];

  if (selectedFortune === 'tarot') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedFortune(null)}
              className="mb-4"
            >
              ← 占いの種類を選択
            </Button>
            <h1 className="text-3xl font-bold text-foreground">タロット占い</h1>
            <p className="text-muted-foreground">
              タロットカードであなたの運命を占いましょう
            </p>
          </div>
          <TarotReading />
        </div>
      </div>
    );
  }

  if (selectedFortune === 'horoscope') {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedFortune(null)}
              className="mb-4"
            >
              ← 占いの種類を選択
            </Button>
            <h1 className="text-3xl font-bold text-foreground">ホロスコープ（西洋占星術）</h1>
            <p className="text-muted-foreground">
              あなたの星の配置を分析し、運命を解き明かしましょう
            </p>
          </div>
          <HoroscopeReading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">占いサービス</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            あなたの運命を解き明かす、様々な占いサービスをご用意しています。
            お好みの占いを選んで、新しい発見を見つけましょう。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {fortuneTypes.map((fortune) => (
            <Card 
              key={fortune.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedFortune(fortune.id as 'tarot' | 'horoscope')}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {fortune.icon}
                </div>
                <CardTitle className="text-2xl">{fortune.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground mb-6">
                  {fortune.description}
                </p>
                <Button 
                  className={`w-full ${fortune.color}`}
                  onClick={() => setSelectedFortune(fortune.id as 'tarot' | 'horoscope')}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  始める
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">占いについて</h3>
            <p className="text-sm text-muted-foreground">
              占いは自己理解と未来への指針を提供するツールです。
              結果は参考程度に受け取り、最終的な判断はあなた自身で行ってください。
              占いを通じて、新しい視点や可能性を見つけることができます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
