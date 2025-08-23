'use client';

import React from 'react';
import { ChatView } from '@/features/chat/components/ChatView';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">AIチャット</h1>
          <p className="text-muted-foreground">
            AIと一緒に運勢や悩みについて相談しましょう
          </p>
        </div>
        <ChatView />
      </div>
    </div>
  );
}
