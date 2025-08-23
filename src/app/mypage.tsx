import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { AdModal } from './AdModal';
import { useSupabaseApp } from './SupabaseAppContext';
import { 
  User, 
  Settings, 
  LogIn, 
  LogOut, 
  Crown, 
  Coins, 
  Play, 
  Star,
  Shield,
  Mail,
  Calendar,
  Sparkles,
  History,
  Loader2
} from 'lucide-react';

type DivinationMethod = 'tarot' | 'numerology' | 'astrology' | 'crystalball';

const DIVINATION_METHODS = {
  tarot: 'タロット占い',
  numerology: '数秘術',
  astrology: '西洋占星術',
  crystalball: '水晶占い'
};

export function MyPage() {
  const { state, actions } = useSupabaseApp();
  const [activeTab, setActiveTab] = useState(state.isLoggedIn ? 'profile' : 'auth');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    birthDate: ''
  });
  const [showAdModal, setShowAdModal] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (state.isLoggedIn) {
      setActiveTab('profile');
      actions.loadFortuneHistory().catch(console.error);
    }
  }, [state.isLoggedIn]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');
    
    try {
      if (authMode === 'register') {
        await actions.signUp(formData.email, formData.password, formData.name, formData.birthDate);
      } else {
        await actions.signIn(formData.email, formData.password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setAuthError(error.message || '認証に失敗しました');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    // 実際のソーシャルログインは後で実装
    alert('ソーシャルログイン機能は開発中です。メールアドレスでの登録をお試しください。');
  };

  const handleWatchAd = () => {
    const maxAds = 3;
    if ((state.tickets?.daily_ad_count || 0) >= maxAds) {
      alert('本日の広告視聴上限に達しています。明日またお試しください。');
      return;
    }
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    try {
      await actions.earnTickets(1, 'ad');
    } catch (error) {
      console.error('Ad completion error:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    }
  };

  const handleUpgradeToPremium = async () => {
    if (confirm('プレミアムプラン（300円/月）にアップグレードしますか？\n\n特典：\n・占い放題\n・広告非表示\n・チャット履歴全閲覧')) {
      try {
        await actions.upgradeToPremium();
        alert('プレミアムプランへのアップグレードが完了しました！');
      } catch (error) {
        console.error('Premium upgrade error:', error);
        alert('アップグレードに失敗しました。もう一度お試しください。');
      }
    }
  };

  const handleSettingsUpdate = async (updates: any) => {
    try {
      await actions.updateSettings(updates);
    } catch (error) {
      console.error('Settings update error:', error);
      alert('設定の更新に失敗しました。');
    }
  };

  const handleSignOut = async () => {
    try {
      await actions.signOut();
      setActiveTab('auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!state.isLoggedIn) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-8">
          <User className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-purple-800">マイページ</h2>
          <p className="text-gray-600 mt-2">ログインして全機能をお楽しみください</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              {authMode === 'login' ? 'ログイン' : '新規登録'}
            </CardTitle>
            {authError && (
              <Alert className="mt-2">
                <AlertDescription className="text-red-600">
                  {authError}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <Label htmlFor="name">お名前</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={isAuthLoading}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isAuthLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isAuthLoading}
                  minLength={6}
                />
                {authMode === 'register' && (
                  <p className="text-xs text-gray-500 mt-1">6文字以上で入力してください</p>
                )}
              </div>

              {authMode === 'register' && (
                <div>
                  <Label htmlFor="birthDate">生年月日（任意）</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    disabled={isAuthLoading}
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={isAuthLoading}
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  authMode === 'login' ? 'ログイン' : '新規登録'
                )}
              </Button>
            </form>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-center text-gray-600">ソーシャルログイン（開発中）</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled>
                  <Mail className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button variant="outline" onClick={() => handleSocialLogin('twitter')} disabled>
                  <span className="w-4 h-4 mr-2">𝕏</span>
                  Twitter
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setAuthError('');
                }}
                className="text-purple-600"
                disabled={isAuthLoading}
              >
                {authMode === 'login' ? '新規登録はこちら' : 'ログインはこちら'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="profile" className="text-xs">プロフィール</TabsTrigger>
          <TabsTrigger value="tickets" className="text-xs">チケット</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">設定</TabsTrigger>
          <TabsTrigger value="premium" className="text-xs">プレミアム</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>{state.user?.name || 'ユーザー'}</CardTitle>
                    <CardDescription>{state.user?.email}</CardDescription>
                  </div>
                </div>
                {state.user?.is_premium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {state.user?.birth_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">生年月日: {state.user.birth_date}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  登録日: {new Date(state.user?.created_at || '').toLocaleDateString('ja-JP')}
                </span>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                保存した占い結果
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.fortunes.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">保存された占い結果はありません</p>
                  <p className="text-gray-500 text-xs mt-1">占い結果画面で「結果を保存」をタップしてください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {state.fortunes.slice(0, 5).map((fortune, index) => (
                    <div key={fortune.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {DIVINATION_METHODS[fortune.divination_method]}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(fortune.created_at).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {fortune.result_text.substring(0, 100)}
                        {fortune.result_text.length > 100 && '...'}
                      </p>
                    </div>
                  ))}
                  {state.fortunes.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      他{state.fortunes.length - 5}件の結果
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                チケット管理
              </CardTitle>
              <CardDescription>
                チケットで占いをお楽しみください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-purple-600">
                  {state.user?.is_premium ? '∞' : state.tickets?.tickets || 0}
                  {!state.user?.is_premium && '枚'}
                </div>
                <p className="text-sm text-gray-600">
                  {state.user?.is_premium ? 'プレミアム会員' : '現在の残高'}
                </p>
              </div>

              {!state.user?.is_premium && (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium">チケット獲得方法</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">ログインボーナス</p>
                          <p className="text-xs text-gray-600">1日1回・1枚獲得</p>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          受け取り済み
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">広告視聴</p>
                          <p className="text-xs text-gray-600">
                            1日3回まで・1回につき1枚 ({state.tickets?.daily_ad_count || 0}/3)
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleWatchAd}
                          disabled={(state.tickets?.daily_ad_count || 0) >= 3}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          視聴
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <strong>チケット使用ルール</strong>
                      <br />
                      • わたしの運勢: 1日1回無料、2回目以降チケット1枚
                      <br />
                      • 相性占い・AIチャット: チケット1枚
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>デフォルト占術</Label>
                <Select 
                  value={state.settings?.default_divination || 'tarot'} 
                  onValueChange={(value: DivinationMethod) => 
                    handleSettingsUpdate({ default_divination: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tarot">タロット占い</SelectItem>
                    <SelectItem value="numerology">数秘術</SelectItem>
                    <SelectItem value="astrology">西洋占星術</SelectItem>
                    <SelectItem value="crystalball">水晶占い</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>通知設定</Label>
                  <p className="text-xs text-gray-600">新機能やお得な情報をお知らせ</p>
                </div>
                <Switch
                  checked={state.settings?.notifications || false}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({ notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>ダークモード</Label>
                  <p className="text-xs text-gray-600">画面を暗いテーマに切り替え</p>
                </div>
                <Switch
                  checked={state.settings?.dark_mode || false}
                  onCheckedChange={(checked) => 
                    handleSettingsUpdate({ dark_mode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                プライバシー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                プライバシーポリシーを見る
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium" className="space-y-4">
          {state.user?.is_premium ? (
            <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-600" />
                  <CardTitle className="text-yellow-800">プレミアムプラン利用中</CardTitle>
                </div>
                <CardDescription>
                  すべての機能をお楽しみいただけます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>占い放題</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>広告非表示</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>チャット履歴全閲覧</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-600" />
                  <CardTitle>プレミアムプラン</CardTitle>
                </div>
                <CardDescription>
                  月額300円で全機能を無制限に
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">占い放題（チケット不要）</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">完全広告非表示</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">AIチャット履歴の全閲覧</span>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">¥300</div>
                    <div className="text-sm text-gray-600">月額</div>
                  </div>
                </div>

                <Button 
                  onClick={handleUpgradeToPremium}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  プレミアムにアップグレード
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  いつでもキャンセル可能です
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* 広告視聴モーダル */}
      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
      />
    </div>
  );
}