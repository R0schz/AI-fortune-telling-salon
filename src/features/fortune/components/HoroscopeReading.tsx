'use client';

import React, { useState } from 'react';
import { useFortune } from '../hooks/useFortune';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star, RefreshCw, MapPin, Clock, Calendar } from 'lucide-react';
import type { HoroscopeInput, HoroscopeOutput } from '../types';
import { PLANET_NAMES, ANGLE_NAMES, SIGN_NAMES, HOUSE_MEANINGS, ASPECT_DETAILS } from '../data/horoscopeData';

export function HoroscopeReading() {
  const [birthData, setBirthData] = useState<HoroscopeInput>({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 9
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const { performHoroscopeFortune, currentHoroscopeResult, isLoading, error, clearError } = useFortune();

  const handleInputChange = (field: keyof HoroscopeInput, value: number) => {
    setBirthData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      setIsCalculating(true);
      await performHoroscopeFortune(birthData);
    } catch (error) {
      console.error('ホロスコープ計算エラー:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleNewCalculation = () => {
    setBirthData({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 9
    });
    clearError();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('ja-JP');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
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

      {/* 生年月日・場所入力フォーム */}
      {!currentHoroscopeResult && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              ホロスコープ（西洋占星術）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 生年月日 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">生年</Label>
                  <Input
                    id="year"
                    type="number"
                    value={birthData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    min="1900"
                    max="2100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="month">生月</Label>
                  <Input
                    id="month"
                    type="number"
                    value={birthData.month}
                    onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
                    min="1"
                    max="12"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="day">生日</Label>
                  <Input
                    id="day"
                    type="number"
                    value={birthData.day}
                    onChange={(e) => handleInputChange('day', parseInt(e.target.value))}
                    min="1"
                    max="31"
                    required
                  />
                </div>
              </div>

              {/* 生時刻 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hour">生時（24時間）</Label>
                  <Input
                    id="hour"
                    type="number"
                    value={birthData.hour}
                    onChange={(e) => handleInputChange('hour', parseInt(e.target.value))}
                    min="0"
                    max="23"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minute">生分</Label>
                  <Input
                    id="minute"
                    type="number"
                    value={birthData.minute}
                    onChange={(e) => handleInputChange('minute', parseInt(e.target.value))}
                    min="0"
                    max="59"
                    required
                  />
                </div>
              </div>

              {/* 出生地 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="latitude">緯度</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="0.0001"
                    value={birthData.latitude}
                    onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                    placeholder="例: 35.6762"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">経度</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="0.0001"
                    value={birthData.longitude}
                    onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                    placeholder="例: 139.6503"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">タイムゾーン</Label>
                  <Input
                    id="timezone"
                    type="number"
                    step="0.5"
                    value={birthData.timezone}
                    onChange={(e) => handleInputChange('timezone', parseFloat(e.target.value))}
                    placeholder="例: 9 (日本)"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    計算中...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    ホロスコープを計算
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ホロスコープ結果表示 */}
      {currentHoroscopeResult && (
        <div className="space-y-6">
          {/* 結果ヘッダー */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">ホロスコープ結果</h2>
            <Button onClick={handleNewCalculation} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              新しい計算
            </Button>
          </div>

          {/* 入力データ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                出生データ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>生年月日:</strong> {currentHoroscopeResult.input.year}年{currentHoroscopeResult.input.month}月{currentHoroscopeResult.input.day}日</p>
              <p><strong>生時刻:</strong> {currentHoroscopeResult.input.hour}時{currentHoroscopeResult.input.minute}分</p>
              <p><strong>出生地:</strong> 緯度{currentHoroscopeResult.input.latitude}°、経度{currentHoroscopeResult.input.longitude}°</p>
              <p><strong>タイムゾーン:</strong> UTC+{currentHoroscopeResult.input.timezone}</p>
              <p><strong>計算日時:</strong> {formatTime(currentHoroscopeResult.timestamp)}</p>
            </CardContent>
          </Card>

          {/* ホロスコープ画像 */}
          <Card>
            <CardHeader>
              <CardTitle>ホロスコープチャート</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border rounded-lg p-4 bg-gray-50 flex justify-center"
                dangerouslySetInnerHTML={{ __html: currentHoroscopeResult.horoscopeImageSvg }}
              />
            </CardContent>
          </Card>

          {/* 天体の位置 */}
          <Card>
            <CardHeader>
              <CardTitle>天体の位置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(currentHoroscopeResult.planets).map(([planet, data]) => (
                  <div key={planet} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg">{PLANET_NAMES[planet as keyof typeof PLANET_NAMES] || planet}</h4>
                    <p className="text-sm text-muted-foreground">
                      星座: {data.sign} ({data.degree.toFixed(1)}°)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ハウス: {data.house}番目
                    </p>
                    {data.isRetrograde && (
                      <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-1">
                        逆行
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 感受点 */}
          <Card>
            <CardHeader>
              <CardTitle>感受点</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentHoroscopeResult.angles).map(([angle, data]) => (
                  <div key={angle} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg">{ANGLE_NAMES[angle as keyof typeof ANGLE_NAMES] || angle}</h4>
                    <p className="text-sm text-muted-foreground">
                      星座: {data.sign} ({data.degree.toFixed(1)}°)
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ハウス */}
          <Card>
            <CardHeader>
              <CardTitle>ハウス</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {currentHoroscopeResult.houses.map((house) => (
                  <div key={house.number} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-lg">{house.number}ハウス</h4>
                    <p className="text-sm text-muted-foreground">
                      星座: {house.sign} ({house.degree.toFixed(1)}°)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {HOUSE_MEANINGS[house.number as keyof typeof HOUSE_MEANINGS]}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* アスペクト */}
          <Card>
            <CardHeader>
              <CardTitle>アスペクト</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentHoroscopeResult.aspects.map((aspect, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {aspect.planet1} - {aspect.planet2}
                      </h4>
                      <span className="text-sm text-muted-foreground">
                        {aspect.orbString}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      アスペクト: {aspect.aspect}
                    </p>
                    {ASPECT_DETAILS[aspect.aspect.toLowerCase() as keyof typeof ASPECT_DETAILS] && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {ASPECT_DETAILS[aspect.aspect.toLowerCase() as keyof typeof ASPECT_DETAILS].description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 計算中の表示 */}
      {isCalculating && (
        <div className="text-center py-12">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">ホロスコープを計算中</h3>
          <p className="text-muted-foreground">
            天体の位置とアスペクトを計算し、チャートを生成しています...
          </p>
        </div>
      )}
    </div>
  );
}
