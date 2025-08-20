import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Home } from './components/SupabaseHome';
import { AIChat } from './components/SupabaseAIChat';
import { MyPage } from './components/SupabaseMyPage';
import { SupabaseAppProvider, useSupabaseApp } from './components/SupabaseAppContext';
import { Home as HomeIcon, MessageCircle, User, Coins, Loader2 } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { state } = useSupabaseApp();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-purple-800 mb-2">AI占い</h2>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* ヘッダー：チケット残高表示 */}
      <AppHeader />

      {/* メインコンテンツ */}
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="flex flex-col h-screen">
            {/* タブコンテンツ */}
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="home" className="m-0 h-full">
                <Home />
              </TabsContent>
              <TabsContent value="chat" className="m-0 h-full">
                <AIChat />
              </TabsContent>
              <TabsContent value="profile" className="m-0 h-full">
                <MyPage />
              </TabsContent>
            </div>

            {/* ボトムナビゲーション */}
            <TabsList className="grid w-full grid-cols-3 rounded-none border-t bg-white h-16">
              <TabsTrigger 
                value="home" 
                className="flex flex-col gap-1 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
              >
                <HomeIcon className="w-5 h-5" />
                <span className="text-xs">占う</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex flex-col gap-1 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs">チャット</span>
              </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex flex-col gap-1 py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
              >
                <User className="w-5 h-5" />
                <span className="text-xs">マイページ</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function AppHeader() {
  const { state } = useSupabaseApp();

  const getTicketDisplay = () => {
    if (!state.isLoggedIn) {
      return { display: '3枚', isPremium: false }; // Default for non-logged-in users
    }
    
    if (state.user?.is_premium) {
      return { display: '∞', isPremium: true };
    }
    
    return { 
      display: `${state.tickets?.tickets || 0}枚`, 
      isPremium: false 
    };
  };

  const ticketInfo = getTicketDisplay();

  return (
    <div className="bg-white shadow-sm border-b px-4 py-3">
      <div className="max-w-md mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-purple-800">AI占い</h1>
          {!state.isLoggedIn && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              体験版
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          <Badge 
            variant="secondary" 
            className={`${
              ticketInfo.isPremium
                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {ticketInfo.display}
          </Badge>
          {ticketInfo.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-xs">
              Premium
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SupabaseAppProvider>
      <AppContent />
    </SupabaseAppProvider>
  );
}