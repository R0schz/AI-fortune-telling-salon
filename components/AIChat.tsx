import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { TicketModal } from './TicketModal';
import { AdModal } from './AdModal';
import { useApp } from './AppContext';
import { useChat } from './hooks/useChat';
import { Send, Bot, User, Clock, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';

export function AIChat() {
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState('chat');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [chatHistoryFromDb, setChatHistoryFromDb] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const {
    messages,
    inputMessage,
    selectedMode,
    chatHistory,
    isNewChat,
    isTyping,
    messagesEndRef,
    setInputMessage,
    startNewChat,
    sendMessage,
    saveCurrentChat,
    changeMode,
    CHAT_MODES
  } = useChat();

  // Load chat history from database when switching to history tab
  useEffect(() => {
    if (activeTab === 'history' && state.isLoggedIn) {
      loadChatHistory();
    }
  }, [activeTab, state.isLoggedIn]);

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const history = await actions.getChatHistory();
      setChatHistoryFromDb(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleStartNewChat = async () => {
    const success = startNewChat(async () => {
      if (state.user?.is_premium) {
        return true; // プレミアムユーザーはチケット不要
      }
      
      if ((state.user?.tickets || 0) === 0) {
        setShowTicketModal(true);
        return false;
      }
      
      try {
        return await actions.useTicket();
      } catch (error) {
        setShowTicketModal(true);
        return false;
      }
    });

    if (!success && (state.user?.tickets || 0) === 0 && !state.user?.is_premium) {
      setShowTicketModal(true);
    }
  };

  const handleSaveCurrentChat = async () => {
    if (messages.length > 0 && state.isLoggedIn) {
      try {
        await actions.saveChatSession(selectedMode, messages);
        saveCurrentChat();
      } catch (error) {
        console.error('Failed to save chat session:', error);
        // Still save locally even if database save fails
        saveCurrentChat();
      }
    } else {
      saveCurrentChat();
    }
  };

  const handleWatchAd = () => {
    setShowTicketModal(false);
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    try {
      await actions.watchAd();
      // 広告視聴後、自動的にチャットを開始
      setTimeout(() => {
        handleStartNewChat();
      }, 500);
    } catch (error: any) {
      alert(error.message || '広告視聴に失敗しました');
    }
  };

  const handleUpgradePremium = async () => {
    setShowTicketModal(false);
    if (confirm('プレミアムプラン（300円/月）にアップグレードしますか？\n\n特典：\n・占い放題\n・広告非表示\n・チャット履歴全閲覧')) {
      try {
        await actions.upgradeToPremium();
      } catch (error: any) {
        alert(error.message || 'アップグレードに失敗しました');
      }
    }
  };

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="chat">チャット</TabsTrigger>
          <TabsTrigger value="history">履歴</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 m-0 flex flex-col">
          {/* 免責事項 */}
          {showDisclaimer && (
            <Alert className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                占いの結果は娯楽目的であり、絶対的なものではありません。重要な決定は慎重にご判断ください。
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowDisclaimer(false)}
                  className="ml-2 h-auto p-1"
                >
                  閉じる
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* モード選択 */}
          <div className="p-4 border-b">
            <div className="space-y-2">
              <label className="text-sm font-medium">占いモード</label>
              <Select value={selectedMode} onValueChange={changeMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHAT_MODES).map(([key, mode]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{mode.icon}</span>
                        <div>
                          <div className="font-medium">{mode.name}</div>
                          <div className="text-xs text-gray-500">{mode.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* チャット画面 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Bot className="w-16 h-16 text-purple-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-purple-800">AIチャット占い</h3>
                  <p className="text-gray-600 text-sm mt-1">選択したモードでAIと会話を始めましょう</p>
                </div>
                <Button onClick={handleStartNewChat} className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  新しい会話を始める
                  {isNewChat && !state.user?.is_premium && (
                    <Badge variant="outline" className="ml-2 text-xs">チケット1枚</Badge>
                  )}
                  {state.user?.is_premium && (
                    <Badge className="ml-2 text-xs bg-gradient-to-r from-yellow-400 to-yellow-600">無制限</Badge>
                  )}
                </Button>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] space-y-1`}>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {message.type === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                        <span>{message.type === 'user' ? 'あなた' : 'AI占い師'}</span>
                        {message.mode && (
                          <Badge variant="outline" className="text-xs">
                            {CHAT_MODES[message.mode].name}
                          </Badge>
                        )}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* AI入力中インジケーター */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Bot className="w-3 h-3" />
                        <span>AI占い師</span>
                      </div>
                      <div className="rounded-lg p-3 bg-gray-100 text-gray-800">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">入力中...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* 入力エリア */}
          {messages.length > 0 && (
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  onKeyPress={(e) => e.key === 'Enter' && !isTyping && sendMessage()}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  size="icon"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveCurrentChat}
                  className="mt-2 text-xs"
                >
                  この会話を保存して新しく始める
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 p-4">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">チャット履歴</h3>
          {!state.isLoggedIn ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                チャット履歴を表示するにはログインが必要です。マイページからログインしてください。
              </AlertDescription>
            </Alert>
          ) : isLoadingHistory ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-600" />
              <p className="text-gray-600 text-sm">チャット履歴を読み込み中...</p>
            </div>
          ) : chatHistoryFromDb.length === 0 && chatHistory.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">保存されたチャット履歴はありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Database chat history */}
              {chatHistoryFromDb.map((chat) => (
                <Card key={chat.id} className="p-4">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm">
                      {CHAT_MODES[chat.chat_mode]?.name || chat.chat_mode}モード
                      <Badge variant="outline" className="ml-2 text-xs">
                        {chat.messages.length}件のメッセージ
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      {new Date(chat.updated_at).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {chat.messages.slice(0, 3).map((message: any, msgIndex: number) => (
                        <div key={msgIndex} className="text-sm">
                          <span className={`font-medium ${message.type === 'user' ? 'text-purple-600' : 'text-gray-600'}`}>
                            {message.type === 'user' ? 'あなた' : 'AI'}:
                          </span>
                          <span className="ml-2 text-gray-800">
                            {message.content.substring(0, 50)}
                            {message.content.length > 50 && '...'}
                          </span>
                        </div>
                      ))}
                      {chat.messages.length > 3 && (
                        <p className="text-xs text-gray-500">他{chat.messages.length - 3}件のメッセージ</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Local chat history */}
              {chatHistory.map((chat, index) => (
                <Card key={`local-${index}`} className="p-4 border-dashed">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm">
                      ローカルチャット #{index + 1}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {chat.length}件のメッセージ
                      </Badge>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        未保存
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {chat.slice(0, 3).map((message, msgIndex) => (
                        <div key={msgIndex} className="text-sm">
                          <span className={`font-medium ${message.type === 'user' ? 'text-purple-600' : 'text-gray-600'}`}>
                            {message.type === 'user' ? 'あなた' : 'AI'}:
                          </span>
                          <span className="ml-2 text-gray-800">
                            {message.content.substring(0, 50)}
                            {message.content.length > 50 && '...'}
                          </span>
                        </div>
                      ))}
                      {chat.length > 3 && (
                        <p className="text-xs text-gray-500">他{chat.length - 3}件のメッセージ</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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