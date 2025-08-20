import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { TicketModal } from './TicketModal';
import { AdModal } from './AdModal';
import { useApp } from './AppContext';
import { ArrowLeft, Heart, Star, Sparkles, Info, Save } from 'lucide-react';

type FortuneType = 'personal' | 'compatibility';
type DivinationMethod = 'tarot' | 'numerology' | 'astrology' | 'crystalball';
type AITone = 'gentle' | 'direct';

const DIVINATION_METHODS = {
  tarot: {
    name: 'タロット占い',
    description: 'カードが示すメッセージを読み解きます',
    image: 'https://images.unsplash.com/photo-1615829332206-22479388eecc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGFyc3xlbnwxfHx8fDE3NTU2NzY0NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  numerology: {
    name: '数秘術',
    description: '生年月日から運命数を算出します',
    image: 'https://images.unsplash.com/photo-1599576109026-80939d1e6bee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxudW1lcm9sb2d5JTIwbnVtYmVycyUyMG15c3RpY2FsfGVufDF8fHx8MTc1NTY3NjQ1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  astrology: {
    name: '西洋占星術',
    description: '星の配置があなたの運勢を教えます',
    image: 'https://images.unsplash.com/photo-1614089254151-676cc373b01e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc3Ryb2xvZ3klMjB6b2RpYWMlMjBzdGFyc3xlbnwxfHx8fDE3NTU2NzY0NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  crystalball: {
    name: '水晶占い',
    description: '水晶が映し出すビジョンを解読します',
    image: 'https://images.unsplash.com/photo-1648829485880-90949475b8ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcnlzdGFsJTIwYmFsbCUyMGZvcnR1bmUlMjB0ZWxsaW5nfGVufDF8fHx8MTc1NTY0ODc5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
};

export function Home() {
  const { state, actions } = useApp();
  const [currentStep, setCurrentStep] = useState<'purpose' | 'method' | 'input' | 'result'>('purpose');
  const [selectedPurpose, setSelectedPurpose] = useState<FortuneType | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<DivinationMethod | null>(null);
  const [inputData, setInputData] = useState({
    birthDate: '',
    partnerBirthDate: '',
    question: ''
  });
  const [selectedTone, setSelectedTone] = useState<AITone>('gentle');
  const [result, setResult] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePurposeSelect = (purpose: FortuneType) => {
    setSelectedPurpose(purpose);
    setCurrentStep('method');
  };

  const handleMethodSelect = (method: DivinationMethod) => {
    setSelectedMethod(method);
    setCurrentStep('input');
  };

  const handleDivination = async () => {
    // プレミアムユーザーはチケット不要
    if (state.user?.is_premium) {
      generateResult();
      setCurrentStep('result');
      return;
    }

    // チケット使用の判定
    const isPersonalFortune = selectedPurpose === 'personal';
    const needsTicket = !isPersonalFortune || state.user?.daily_free_used;
    
    if (needsTicket) {
      if ((state.user?.tickets || 0) === 0) {
        // チケット不足時はモーダルを表示
        setShowTicketModal(true);
        return;
      }
      
      try {
        const success = await actions.useTicket();
        if (!success) {
          setShowTicketModal(true);
          return;
        }
      } catch (error) {
        setShowTicketModal(true);
        return;
      }
    }

    if (isPersonalFortune && !state.user?.daily_free_used) {
      try {
        await actions.useDailyFree();
      } catch (error) {
        console.error('Failed to use daily free:', error);
      }
    }

    // AI占い結果の生成（モック）
    generateResult();
    setCurrentStep('result');
  };

  const generateResult = () => {
    const tonePrefix = selectedTone === 'gentle' 
      ? 'あなたの運勢を優しくお伝えしますね。' 
      : 'はっきりと申し上げます。';
    
    const mockResults = {
      tarot: `${tonePrefix}「恋人」のカードが出ました。今日は新しい出会いや関係性の深まりが期待できる日です。心を開いて、素敵な縁を大切にしてくださいね。`,
      numerology: `${tonePrefix}あなたの運命数は「7」です。直感力が冴えている時期なので、ひらめきを大切にしてください。内なる声に耳を傾けることで、正しい道が見えてきます。`,
      astrology: `${tonePrefix}金星が良い位置にあります。愛情運が上昇中で、素敵な一日になりそうです。積極的にコミュニケーションを取ることで、良い流れを引き寄せられるでしょう。`,
      crystalball: `${tonePrefix}水晶に美しい光が見えます。近いうちに嬉しいニュースが舞い込むでしょう。その知らせは、あなたの努力が実を結んだ証です。`
    };

    setResult(mockResults[selectedMethod!] || '占い結果を生成中...');
  };

  const handleSaveResult = async () => {
    if (!state.isLoggedIn) {
      alert('占い結果を保存するにはログインが必要です');
      return;
    }

    try {
      setIsSaving(true);
      await actions.saveFortuneResult({
        fortune_type: selectedPurpose,
        divination_method: selectedMethod,
        input_data: inputData,
        result,
        ai_tone: selectedTone
      });
      alert('占い結果を保存しました');
    } catch (error: any) {
      alert(error.message || '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWatchAd = () => {
    setShowTicketModal(false);
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    try {
      await actions.watchAd();
      // 広告視聴後、自動的に占いを実行
      setTimeout(() => {
        handleDivination();
      }, 500);
    } catch (error: any) {
      alert(error.message || '広告視聴に失敗しました');
    }
  };

  const handleUpgradePremium = () => {
    setShowTicketModal(false);
    // マイページのプレミアムタブに遷移する処理
    // ここではアラートで代用
    if (confirm('プレミアムプラン（300円/月）にアップグレードしますか？\n\n特典：\n・占い放題\n・広告非表示\n・チャット履歴全閲覧')) {
      actions.upgradeToPremium();
    }
  };

  const resetToHome = () => {
    setCurrentStep('purpose');
    setSelectedPurpose(null);
    setSelectedMethod(null);
    setInputData({ birthDate: '', partnerBirthDate: '', question: '' });
    setResult('');
  };

  return (
    <div className="p-4 space-y-4 min-h-screen">
      {/* Step 1: 目的選択 */}
      {currentStep === 'purpose' && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-purple-800 mb-2">今日は何を占いますか？</h2>
            <p className="text-gray-600">目的を選んでください</p>
          </div>

          <div className="space-y-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-purple-200 hover:border-purple-400"
              onClick={() => handlePurposeSelect('personal')}
            >
              <CardHeader className="text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-2" />
                <CardTitle className="text-lg">わたしの運勢</CardTitle>
                <CardDescription>今日のあなたの運勢を占います</CardDescription>
                {!state.user?.daily_free_used && !state.user?.is_premium && (
                  <Badge variant="secondary" className="w-fit mx-auto mt-2 bg-green-100 text-green-800">
                    1日1回無料
                  </Badge>
                )}
                {state.user?.is_premium && (
                  <Badge className="w-fit mx-auto mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600">
                    無制限
                  </Badge>
                )}
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-purple-200 hover:border-purple-400"
              onClick={() => handlePurposeSelect('compatibility')}
            >
              <CardHeader className="text-center">
                <Heart className="w-12 h-12 text-pink-500 mx-auto mb-2" />
                <CardTitle className="text-lg">相性占い</CardTitle>
                <CardDescription>気になる相手との相性を占います</CardDescription>
                {state.user?.is_premium ? (
                  <Badge className="w-fit mx-auto mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600">
                    無制限
                  </Badge>
                ) : (
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    チケット1枚
                  </Badge>
                )}
              </CardHeader>
            </Card>
          </div>
        </div>
      )}

      {/* Step 2: 占術選択 */}
      {currentStep === 'method' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep('purpose')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold text-purple-800">占術を選択</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(DIVINATION_METHODS).map(([key, method]) => (
              <Card 
                key={key}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMethodSelect(key as DivinationMethod)}
              >
                <CardContent className="p-4 text-center">
                  <ImageWithFallback
                    src={method.image}
                    alt={method.name}
                    className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover"
                  />
                  <h3 className="font-semibold text-sm">{method.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{method.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: 入力画面 */}
      {currentStep === 'input' && selectedMethod && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep('method')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold text-purple-800">
              {DIVINATION_METHODS[selectedMethod].name}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="birthDate">生年月日</Label>
              <Input
                id="birthDate"
                type="date"
                value={inputData.birthDate}
                onChange={(e) => setInputData({ ...inputData, birthDate: e.target.value })}
                className="mt-1"
              />
            </div>

            {selectedPurpose === 'compatibility' && (
              <div>
                <Label htmlFor="partnerBirthDate">相手の生年月日</Label>
                <Input
                  id="partnerBirthDate"
                  type="date"
                  value={inputData.partnerBirthDate}
                  onChange={(e) => setInputData({ ...inputData, partnerBirthDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="question">質問・悩み（任意）</Label>
              <Input
                id="question"
                placeholder="今日気になることがあれば教えてください"
                value={inputData.question}
                onChange={(e) => setInputData({ ...inputData, question: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>AIの口調を選択</Label>
              <RadioGroup 
                value={selectedTone} 
                onValueChange={(value: AITone) => setSelectedTone(value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gentle" id="gentle" />
                  <Label htmlFor="gentle">優しい口調</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="direct" id="direct" />
                  <Label htmlFor="direct">はっきりした口調</Label>
                </div>
              </RadioGroup>
            </div>

            {/* チケット消費の案内 */}
            {!state.user?.is_premium && (
              <>
                {selectedPurpose === 'personal' && state.user?.daily_free_used && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      本日の無料占いは既に使用済みです。チケット1枚を消費します。
                    </AlertDescription>
                  </Alert>
                )}

                {selectedPurpose === 'compatibility' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      相性占いにはチケット1枚が必要です。
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <Button 
              onClick={handleDivination}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!inputData.birthDate || (selectedPurpose === 'compatibility' && !inputData.partnerBirthDate)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              占いを始める
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: 結果表示 */}
      {currentStep === 'result' && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">占い結果</h2>
            <Badge variant="secondary">{DIVINATION_METHODS[selectedMethod!].name}</Badge>
          </div>

          <Card className="p-6">
            <CardContent className="p-0">
              <p className="text-gray-800 leading-relaxed">{result}</p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {state.isLoggedIn && (
              <Button 
                onClick={handleSaveResult}
                disabled={isSaving}
                variant="outline" 
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? '保存中...' : '結果を保存'}
              </Button>
            )}
            <Button onClick={resetToHome} className="w-full">
              もう一度占う
            </Button>
          </div>
        </div>
      )}

      {/* モーダル */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onWatchAd={handleWatchAd}
        onUpgradePremium={handleUpgradePremium}
        currentTickets={state.user?.tickets || 0}
        dailyAdCount={state.user?.daily_ad_count || 0}
        maxDailyAds={3}
      />

      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
      />
    </div>
  );
}