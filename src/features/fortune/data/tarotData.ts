import type { TarotCard, Spread } from '../types';

// タロットカードのデータベース
export const TAROT_DECK: TarotCard[] = [
  // 大アルカナ
  { 
    id: 'fool', 
    name: '愚者', 
    description: '新しい始まり、純真さ、冒険心',
    keywords: ['新しい始まり', '純真さ', '冒険心', '自由', '可能性']
  },
  { 
    id: 'magician', 
    name: '魔術師', 
    description: '創造力、意志の力、実現力',
    keywords: ['創造力', '意志の力', '実現力', 'スキル', '自信']
  },
  { 
    id: 'high-priestess', 
    name: '女教皇', 
    description: '直感、神秘、内なる知恵',
    keywords: ['直感', '神秘', '内なる知恵', '静寂', '神秘']
  },
  { 
    id: 'empress', 
    name: '女帝', 
    description: '豊穣、母性、創造性',
    keywords: ['豊穣', '母性', '創造性', '自然', '愛']
  },
  { 
    id: 'emperor', 
    name: '皇帝', 
    description: '権威、リーダーシップ、安定',
    keywords: ['権威', 'リーダーシップ', '安定', '構造', '力']
  },
  { 
    id: 'hierophant', 
    name: '教皇', 
    description: '伝統、教育、精神的な導き',
    keywords: ['伝統', '教育', '精神的な導き', '信仰', '学習']
  },
  { 
    id: 'lovers', 
    name: '恋人', 
    description: '愛、選択、調和',
    keywords: ['愛', '選択', '調和', '関係', '決断']
  },
  { 
    id: 'chariot', 
    name: '戦車', 
    description: '勝利、意志、前進',
    keywords: ['勝利', '意志', '前進', '制御', '成功']
  },
  { 
    id: 'strength', 
    name: '力', 
    description: '内なる強さ、勇気、忍耐',
    keywords: ['内なる強さ', '勇気', '忍耐', '優しさ', '自信']
  },
  { 
    id: 'hermit', 
    name: '隠者', 
    description: '内省、孤独、導き',
    keywords: ['内省', '孤独', '導き', '知恵', '探求']
  },
  { 
    id: 'wheel-of-fortune', 
    name: '運命の輪', 
    description: '変化、運命、循環',
    keywords: ['変化', '運命', '循環', '転機', '機会']
  },
  { 
    id: 'justice', 
    name: '正義', 
    description: 'バランス、真実、公正',
    keywords: ['バランス', '真実', '公正', '責任', '真理']
  },
  { 
    id: 'hanged-man', 
    name: '吊るされた男', 
    description: '犠牲、新しい視点、待機',
    keywords: ['犠牲', '新しい視点', '待機', '解放', '悟り']
  },
  { 
    id: 'death', 
    name: '死神', 
    description: '終わりと始まり、変容、再生',
    keywords: ['終わりと始まり', '変容', '再生', '変化', '解放']
  },
  { 
    id: 'temperance', 
    name: '節制', 
    description: 'バランス、調和、節制',
    keywords: ['バランス', '調和', '節制', '忍耐', '調和']
  },
  { 
    id: 'devil', 
    name: '悪魔', 
    description: '束縛、物質主義、欲望',
    keywords: ['束縛', '物質主義', '欲望', '執着', '解放']
  },
  { 
    id: 'tower', 
    name: '塔', 
    description: '突然の変化、破壊、啓示',
    keywords: ['突然の変化', '破壊', '啓示', '混乱', '解放']
  },
  { 
    id: 'star', 
    name: '星', 
    description: '希望、インスピレーション、癒し',
    keywords: ['希望', 'インスピレーション', '癒し', '導き', '信仰']
  },
  { 
    id: 'moon', 
    name: '月', 
    description: '直感、幻想、無意識',
    keywords: ['直感', '幻想', '無意識', '神秘', '感情']
  },
  { 
    id: 'sun', 
    name: '太陽', 
    description: '成功、喜び、活力',
    keywords: ['成功', '喜び', '活力', '明るさ', '繁栄']
  },
  { 
    id: 'judgement', 
    name: '審判', 
    description: '復活、覚醒、救済',
    keywords: ['復活', '覚醒', '救済', '召命', '変容']
  },
  { 
    id: 'world', 
    name: '世界', 
    description: '完成、達成、統合',
    keywords: ['完成', '達成', '統合', '旅の終わり', '成功']
  }
];

// タロットスプレッドの定義
export const TAROT_SPREADS: Record<string, Spread> = {
  threeCards: {
    id: 'threeCards',
    name: '3枚スプレッド',
    description: '過去・現在・未来を表す基本的なスプレッド',
    cardCount: 3,
    positions: [
      { name: '過去', meaning: '過去の状況や影響' },
      { name: '現在', meaning: '現在の状況や課題' },
      { name: '未来', meaning: '未来の可能性や方向性' }
    ]
  },
  celticCross: {
    id: 'celticCross',
    name: 'ケルト十字',
    description: '詳細な状況分析に適した伝統的なスプレッド',
    cardCount: 10,
    positions: [
      { name: '現在', meaning: '現在の状況' },
      { name: '課題', meaning: '直面している課題' },
      { name: '過去', meaning: '過去の影響' },
      { name: '未来', meaning: '近い未来' },
      { name: '意識', meaning: '意識していること' },
      { name: '無意識', meaning: '無意識の影響' },
      { name: '希望と恐れ', meaning: '希望と恐れ' },
      { name: '環境', meaning: '周囲の環境' },
      { name: '導き', meaning: '内なる導き' },
      { name: '結果', meaning: '最終的な結果' }
    ]
  },
  horseshoe: {
    id: 'horseshoe',
    name: '馬蹄形',
    description: '7枚のカードによる未来予測スプレッド',
    cardCount: 7,
    positions: [
      { name: '過去', meaning: '過去の影響' },
      { name: '現在', meaning: '現在の状況' },
      { name: '隠れた影響', meaning: '隠れた影響要因' },
      { name: '障害', meaning: '直面する障害' },
      { name: '環境', meaning: '周囲の環境' },
      { name: '希望と恐れ', meaning: '希望と恐れ' },
      { name: '結果', meaning: '最終的な結果' }
    ]
  }
};
