import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Coins, Play, Crown, AlertTriangle, CheckCircle } from 'lucide-react';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  onUpgradePremium: () => void;
  currentTickets: number;
  dailyAdCount: number;
  maxDailyAds: number;
}

export function TicketModal({
  isOpen,
  onClose,
  onWatchAd,
  onUpgradePremium,
  currentTickets,
  dailyAdCount,
  maxDailyAds
}: TicketModalProps) {
  const canWatchMoreAds = dailyAdCount < maxDailyAds;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            チケットが不足しています
          </DialogTitle>
          <DialogDescription>
            この機能を利用するにはチケットが必要です
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 現在のチケット残高 */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-600">現在の残高</span>
              </div>
              <div className="text-2xl font-bold text-gray-800">{currentTickets}枚</div>
            </CardContent>
          </Card>

          {/* チケット獲得方法 */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">チケットを獲得する方法</h4>
            
            {/* 広告視聴オプション */}
            <Card className={`border-2 ${canWatchMoreAds ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Play className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">広告を視聴</span>
                      <Badge variant="outline" className="text-xs">
                        +1枚
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      30秒の広告視聴でチケット獲得
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress 
                        value={(dailyAdCount / maxDailyAds) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-xs text-gray-500">
                        {dailyAdCount}/{maxDailyAds}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      onWatchAd();
                      onClose();
                    }}
                    disabled={!canWatchMoreAds}
                    size="sm"
                    className="ml-3 bg-blue-600 hover:bg-blue-700"
                  >
                    {canWatchMoreAds ? '視聴する' : '上限達成'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* プレミアムプランオプション */}
            <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-sm">プレミアムプラン</span>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-xs">
                        おすすめ
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      月額300円で占い放題
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>チケット不要</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>広告非表示</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      onUpgradePremium();
                      onClose();
                    }}
                    size="sm"
                    className="ml-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    詳細を見る
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* フッターボタン */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              キャンセル
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}