import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { Play, Pause, Volume2, VolumeX, CheckCircle, X } from 'lucide-react';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  adDuration?: number; // 秒数
}

export function AdModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  adDuration = 30 
}: AdModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // モーダルが閉じられたときにリセット
      setIsPlaying(false);
      setCurrentTime(0);
      setIsCompleted(false);
      return;
    }

    if (isPlaying && !isCompleted) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= adDuration) {
            setIsCompleted(true);
            setIsPlaying(false);
            return adDuration;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, isCompleted, isOpen, adDuration]);

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const progressPercentage = (currentTime / adDuration) * 100;
  const remainingTime = adDuration - currentTime;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-blue-600" />
            広告視聴でチケット獲得
          </DialogTitle>
          <DialogDescription>
            30秒の広告をご視聴いただくとチケットを1枚獲得できます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 広告プレイヤー風のエリア */}
          <Card className="bg-black text-white min-h-48 flex items-center justify-center relative overflow-hidden">
            <CardContent className="p-0 w-full h-full relative">
              {/* 疑似広告コンテンツ */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">🌟 AI占い 🌟</div>
                  <div className="text-sm opacity-80">あなたの未来を占います</div>
                  {!isCompleted && (
                    <div className="mt-4">
                      <div className="text-3xl font-mono">
                        {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:
                        {String(remainingTime % 60).padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 再生完了オーバーレイ */}
              {isCompleted && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <div className="text-xl font-bold">視聴完了！</div>
                    <div className="text-sm opacity-80">チケットを獲得しました</div>
                  </div>
                </div>
              )}

              {/* コントロールバー */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-3">
                <div className="flex items-center gap-3">
                  {!isCompleted ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={isPlaying ? handlePause : handleStart}
                      className="text-white hover:bg-white hover:bg-opacity-20"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <Progress value={progressPercentage} className="h-1" />
                    <div className="flex justify-between text-xs opacity-80">
                      <span>
                        {String(Math.floor(currentTime / 60)).padStart(2, '0')}:
                        {String(currentTime % 60).padStart(2, '0')}
                      </span>
                      <span>
                        {String(Math.floor(adDuration / 60)).padStart(2, '0')}:
                        {String(adDuration % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white hover:bg-opacity-20"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* スキップボタン（右上） */}
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSkip}
                className="absolute top-2 right-2 text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <div className="flex gap-2">
            {!isCompleted ? (
              <>
                <Button variant="outline" onClick={handleSkip} className="flex-1">
                  スキップ
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={isPlaying}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isPlaying ? '視聴中...' : '視聴開始'}
                </Button>
              </>
            ) : (
              <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                チケットを受け取る
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            広告は最後まで視聴していただく必要があります
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}