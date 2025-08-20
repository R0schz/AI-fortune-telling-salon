import { useState, useRef, useEffect } from 'react';

export type ChatMode = 'free' | 'tarot' | 'numerology' | 'astrology';

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mode?: ChatMode;
}

export const CHAT_MODES = {
  free: { name: '自由会話', icon: '💬', description: 'AIと自由に会話' },
  tarot: { name: 'タロットモード', icon: '🃏', description: 'タロット占いに特化' },
  numerology: { name: '数秘術モード', icon: '🔢', description: '数秘術による占い' },
  astrology: { name: '占星術モード', icon: '⭐', description: '星座・惑星による占い' }
};

export function useChat(initialMode: ChatMode = 'free') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedMode, setSelectedMode] = useState<ChatMode>(initialMode);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const [isNewChat, setIsNewChat] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIModeIntro = (mode: ChatMode): string => {
    const intros = {
      free: 'こんにちは！私はAI占い師です。何でもお気軽にご相談ください。あなたのお悩みや気になることをお聞かせくださいね。',
      tarot: 'タロットモードへようこそ。カードが示すメッセージをお伝えします。どのようなことについて占いましょうか？恋愛、仕事、人間関係など、お聞かせください。',
      numerology: '数秘術モードです。あなたの生年月日から数秘を算出し、運命や性格について詳しくお話しできます。まずは生年月日を教えてくださいね。',
      astrology: '占星術モードです。星座や惑星の配置から、あなたの運勢を読み解きます。生年月日と生まれた時間、場所を教えていただけますか？'
    };
    return intros[mode];
  };

  const generateAIResponse = (userInput: string, mode: ChatMode): string => {
    const responses = {
      free: [
        'なるほど、そのお気持ちよく分かります。もう少し詳しく教えていただけますか？',
        'そんな時期もありますよね。私はいつでもあなたの味方です。一緒に考えましょう。',
        'とても興味深いですね。そのことについて、別の視点から見てみましょうか。',
        'お話を聞いていて感じるのは、あなたがとても真剣に向き合っていることです。',
        'その状況は確かに複雑ですね。一つずつ整理してみましょう。'
      ],
      tarot: [
        '「愚者」のカードが出ています。新しいスタートの予感です。恐れずに一歩踏み出してみてください。',
        '「女教皇」のカードが示すのは直感の大切さです。あなたの内なる声に耳を傾けてみてください。',
        '「恋人」のカードが出ました。重要な選択の時が来ているようですね。心の声に従ってください。',
        '「星」のカードが輝いています。希望を持ち続けることで道は開けるでしょう。',
        '「太陽」のカードが示すのは成功と喜びです。明るい未来が待っています。'
      ],
      numerology: [
        'あなたの運命数から見ると、創造性豊かな時期にいらっしゃいますね。新しいことにチャレンジしてみてはいかがでしょう。',
        '数秘から読み取れるのは、協調性を大切にする時期だということです。周りとの調和を意識してみてください。',
        '今の数の流れは変化の時を示しています。変化を恐れず、前向きに受け入れてみてくださいね。',
        'あなたの数秘は「7」の影響が強く出ています。直感力を信じることが重要です。',
        '「3」のエネルギーが感じられます。コミュニケーションが鍵となりそうです。'
      ],
      astrology: [
        '現在の星の配置では、コミュニケーション運が上昇しています。積極的に人との交流を楽しんでください。',
        '金星の影響で、恋愛運が好調な時期です。素敵な出会いや関係の進展が期待できそうですね。',
        '水星逆行の影響で少し混乱があるかもしれませんが、落ち着いて対処すれば大丈夫です。',
        '木星の恵みを受けて、拡大の時期に入っています。チャンスを逃さないようにしてください。',
        '土星の試練を乗り越えた先に、大きな成長が待っています。諦めずに頑張りましょう。'
      ]
    };

    const modeResponses = responses[mode];
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  };

  const startNewChat = (onTicketCheck: () => boolean) => {
    if (isNewChat && messages.length === 0) {
      if (!onTicketCheck()) {
        return false;
      }
      setIsNewChat(false);
    }

    const aiIntro = getAIModeIntro(selectedMode);
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content: aiIntro,
      timestamp: new Date(),
      mode: selectedMode
    };
    setMessages([newMessage]);
    return true;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // AI応答のシミュレーション（より自然なタイミング）
    const responseDelay = Math.random() * 1000 + 1500; // 1.5-2.5秒のランダム遅延
    
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content, selectedMode);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        mode: selectedMode
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, responseDelay);
  };

  const saveCurrentChat = () => {
    if (messages.length > 0) {
      setChatHistory(prev => [...prev, messages]);
      setMessages([]);
      setIsNewChat(true);
    }
  };

  const clearHistory = () => {
    setChatHistory([]);
  };

  const loadChatFromHistory = (index: number) => {
    if (index >= 0 && index < chatHistory.length) {
      // 現在のチャットを保存
      if (messages.length > 0) {
        saveCurrentChat();
      }
      // 履歴からロード
      setMessages(chatHistory[index]);
      setIsNewChat(false);
    }
  };

  const changeMode = (mode: ChatMode) => {
    setSelectedMode(mode);
  };

  return {
    // State
    messages,
    inputMessage,
    selectedMode,
    chatHistory,
    isNewChat,
    isTyping,
    messagesEndRef,

    // Actions
    setInputMessage,
    startNewChat,
    sendMessage,
    saveCurrentChat,
    clearHistory,
    loadChatFromHistory,
    changeMode,

    // Utilities
    scrollToBottom,
    CHAT_MODES
  };
}