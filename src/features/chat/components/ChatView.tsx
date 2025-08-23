'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, RotateCcw } from 'lucide-react';
import type { ChatMode } from '../types';

interface ChatViewProps {
  initialMode?: ChatMode;
}

export function ChatView({ initialMode = 'general' }: ChatViewProps) {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<ChatMode>(initialMode);
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    loadChatHistory,
    resetChat,
    clearError,
  } = useChat(mode);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    await sendMessage(inputValue);
    setInputValue('');
  };

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    resetChat();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* モード選択 */}
      <div className="flex gap-2 mb-4 p-4 bg-background border-b">
        <Button
          variant={mode === 'fortune' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('fortune')}
        >
          運勢相談
        </Button>
        <Button
          variant={mode === 'tarot' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('tarot')}
        >
          タロット
        </Button>
        <Button
          variant={mode === 'numerology' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('numerology')}
        >
          数秘術
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetChat}
          className="ml-auto"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          リセット
        </Button>
      </div>

      {/* エラー表示 */}
      {error && (
        <Alert variant="destructive" className="mb-4 mx-4">
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

      {/* メッセージ表示エリア */}
      <ScrollArea className="flex-1 px-4 mb-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card className={`max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <CardContent className="p-3">
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AIが考え中...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-background">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="メッセージを入力してください..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
