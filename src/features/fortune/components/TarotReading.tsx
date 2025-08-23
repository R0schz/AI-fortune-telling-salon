'use client';

import React, { useState } from 'react';
import { useFortune } from '../hooks/useFortune';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { TarotReadingResult } from '../types';

export function TarotReading() {
  const [question, setQuestion] = useState('');
  const [isReading, setIsReading] = useState(false);
  const { performTarotFortune, currentTarotResult, isLoading, error, clearError } = useFortune();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    try {
      setIsReading(true);
      await performTarotFortune(question.trim());
    } catch (error) {
      console.error('タロット占いエラー:', error);
    } finally {
      setIsReading(false);
    }
  };

  const handleNewReading = () => {
    setQuestion('');
    setIsReading(false);
    clearError();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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

      {/* 質問入力フォーム */}
      {!isReading && !currentTarotResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              タロット占い
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium mb-2">
                  あなたの質問
                </label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="例: 恋愛運はどうですか？仕事の将来性は？"
                  rows={4}
                  className="w-full"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={!question.trim() || isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    占い中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    タロットカードを引く
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 占い結果表示 */}
      {currentTarotResult && (
        <div className="space-y-6">
          {/* 結果ヘッダー */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">タロット占い結果</h2>
            <Button onClick={handleNewReading} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              新しい占い
            </Button>
          </div>

          {/* 質問とスプレッド情報 */}
          <Card>
            <CardHeader>
              <CardTitle>質問とスプレッド</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>質問:</strong> {currentTarotResult.question}</p>
              <p><strong>スプレッド:</strong> {currentTarotResult.spreadName}</p>
              <p><strong>占った日時:</strong> {formatTime(currentTarotResult.timestamp)}</p>
            </CardContent>
          </Card>

          {/* 引かれたカード */}
          <Card>
            <CardHeader>
              <CardTitle>引かれたカード</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentTarotResult.drawnCards.map((drawnCard, index) => (
                  <div key={index} className="border rounded-lg p-4 text-center">
                    <div className="mb-2">
                      <h4 className="font-semibold text-lg">{drawnCard.card.name}</h4>
                      {drawnCard.isReversed && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
                          逆位置
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>{drawnCard.position.name}</strong>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {drawnCard.position.meaning}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* スプレッド画像 */}
          <Card>
            <CardHeader>
              <CardTitle>カード配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-4 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: currentTarotResult.spreadImageSvg }}
              />
            </CardContent>
          </Card>

          {/* 解釈 */}
          <Card>
            <CardHeader>
              <CardTitle>解釈</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-foreground">
                {currentTarotResult.interpretation}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 占い中の表示 */}
      {isReading && (
        <div className="text-center py-12">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">タロットカードを引いています</h3>
          <p className="text-muted-foreground">
            あなたの質問に最適なカードを選択し、解釈を生成しています...
          </p>
        </div>
      )}
    </div>
  );
}
