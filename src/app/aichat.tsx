import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { TicketModal } from './TicketModal';
import { AdModal } from './AdModal';
import { useSupabaseApp } from './SupabaseAppContext';
import { 
  Send, 
  Sparkles, 
  Users, 
  MessageCircle, 
  Bot,
  Info,
  Loader2
} from 'lucide-react';

type ChatMode = 'free' | 'tarot' | 'numerology' | 'astrology';
type Message = {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
};

const CHAT_MODES = {
  free: {
    name: 'フリーチャット',
    description: 'AIと自由に会話',
    icon: MessageCircle,
    color: 'bg-blue-100 text-blue-800',
    needsTicket: false
  },
  tarot: {
    name: 'タロット相談',
    description: 'タロットの専門知識で相談',
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-800',
    needsTicket: true
  },
  numerology: {
    name: '数秘術相談',
    description: '数秘術の観点からアドバイス',
    icon: Users,
    color: 'bg-green-100 text-green-800',
    needsTicket: true
  },
  astrology: {
    name: '占星術相談',
    description: '星の配置から運勢を読み解く',
    icon: Sparkles,
    color: 'bg-indigo-100 text-indigo-800',
    needsTicket: true
  }
};

export function AIChat() {
  const { state, actions } = useSupabaseApp();
  const [selectedMode, setSelectedMode] = useState<ChatMode>('free');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with greeting message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: 'こんにちは！AI占い師です。どのようなことでお悩みですか？お気軽にお話しください。',
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const handleModeChange = (mode: ChatMode) => {
    setSelectedMode(mode);
    
    // Add mode change message
    const modeMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: `${CHAT_MODES[mode].name}モードに切り替えました。${CHAT_MODES[mode].description}いたします。`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, modeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if tickets are needed for specialized modes
    const modeConfig = CHAT_MODES[selectedMode];
    
    if (modeConfig.needsTicket && !state.user?.is_premium && state.isLoggedIn) {
      if ((state.tickets?.tickets || 0) === 0) {
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

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, selectedMode);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateAIResponse = (input: string, mode: ChatMode): string => {
    const responses = {
      free: [
        'なるほど、そのお気持ちよく分かります。もう少し詳しく教えていただけますか？',
        'それは大切なことですね。あなたの直感を信じることも時には必要です。',
        'お話を聞いていると、あなたの中にもう答えがあるような気がします。'
      ],
      tarot: [
        'タロットカードから見ると、「剣の王」が現れています。冷静な判断力が鍵となりそうです。',
        '「女教皇」のカードが示すように、内なる知恵に耳を傾ける時期かもしれません。',
        '「太陽」のカードが出ました。明るい未来への道が開けているようです。'
      ],
      numerology: [
        'あなたの誕生数から読み取ると、創造性を活かす時期に入っているようです。',
        '数秘術的に見ると、今は基盤を固める大切な時期です。焦らず着実に進んでください。',
        'あなたの運命数は変化を好む数字です。新しいチャレンジを恐れる必要はありません。'
      ],
      astrology: [
        '現在の星の配置を見ると、コミュニケーション運が高まっています。',
        '金星の影響で、人間関係に良い変化が訪れそうです。',
        '水星逆行の影響で、過去を振り返る良い機会かもしれません。'
      ]
    };

    const modeResponses = responses[mode];
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  };

  const handleWatchAd = () => {
    setShowTicketModal(false);
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    try {
      await actions.earnTickets(1, 'ad');
      setTimeout(() => {
        handleSendMessage();
      }, 500);
    } catch (error) {
      console.error('Ad completion error:', error);
    }
  };

  const handleUpgradePremium = () => {
    setShowTicketModal(false);
    if (confirm('プレミアムプラン（300円/月）にアップグレードしますか？\n\n特典：\n・占い放題\n・広告非表示\n・チャット履歴全閲覧')) {
      actions.upgradeToPremium().catch(console.error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-semibold text-purple-800 mb-3">AIチャット占い</h2>
        
        {/* モード選択 */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(CHAT_MODES).map(([key, mode]) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === key;
            const needsAuth = mode.needsTicket && !state.isLoggedIn;
            
            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleModeChange(key as ChatMode)}
                className={`flex items-center gap-2 ${isSelected ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                disabled={needsAuth}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs truncate">{mode.name}</span>
                {mode.needsTicket && !state.user?.is_premium && (
                  <Badge variant="secondary" className="text-xs">
                    {!state.isLoggedIn ? 'ログイン' : 'チケット'}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>

        {/* 注意事項 */}
        {!state.isLoggedIn && (
          <Alert className="mt-3">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              フリーチャットのみご利用いただけます。専門的な占い相談はログイン後にご利用ください。
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* チャットエリア */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.type === 'ai' && (
                    <Bot className="w-4 h-4 mt-0.5 text-purple-600" />
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('ja-JP', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">考え中...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* 入力エリア */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size="icon"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>現在のモード: {CHAT_MODES[selectedMode].name}</span>
          {CHAT_MODES[selectedMode].needsTicket && !state.user?.is_premium && state.isLoggedIn && (
            <span>チケット消費: 1枚</span>
          )}
        </div>
      </div>

      {/* モーダル */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onWatchAd={handleWatchAd}
        onUpgradePremium={handleUpgradePremium}
        currentTickets={state.tickets?.tickets || 0}
        dailyAdCount={state.tickets?.daily_ad_count || 0}
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