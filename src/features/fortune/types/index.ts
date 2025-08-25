export type FortuneType = 'tarot' | 'numerology' | 'astrology' | 'fengshui';

export interface FortuneQuestion {
  id: string;
  type: FortuneType;
  question: string;
  details?: string;
}

export interface FortuneResult {
  id: string;
  questionId: string;
  result: string;
  interpretation: string;
  advice: string;
  confidence: number;
  createdAt: Date;
}

export interface FortuneSession {
  id: string;
  userId: string;
  type: FortuneType;
  question: FortuneQuestion;
  result?: FortuneResult;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// タロット占いの型定義
export interface TarotCard {
  id: string;
  name: string;
  description: string;
  upright_keywords: string[];
  reversed_keywords: string[];
}

export interface SpreadPosition {
  name: string;
  meaning: string;
}

export interface Spread {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  positions: SpreadPosition[];
}

export interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position: SpreadPosition;
}

export interface TarotReadingResult {
  interpretation: string;
  spreadName: string;
  drawnCards: DrawnCard[];
  spreadImageSvg: string;
  question: string;
  timestamp: Date;
}

// ホロスコープ（西洋占星術）の型定義
export interface HoroscopeInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone: number;
}

export interface PlanetData {
  degree: number;
  sign: string;
  house: number;
  isRetrograde: boolean;
  name: string;
  signName: string;
  signSymbol: string;
  symbol: string;
  degreeInSign: number;
}

export interface HouseData {
  degree: number;
  sign: string;
  signName: string;
  signSymbol: string;
  number: number;
  degreeInSign: number;
}

export interface AngleData {
  degree: number;
  sign: string;
  signName: string;
  signSymbol: string;
  name: string;
  symbol: string;
  degreeInSign: number;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  aspect: string;
  aspectName: string;
  nature: string;
  orb: number;
  orbString: string;
}

export interface HoroscopeOutput {
  planets: Record<string, PlanetData>;
  houses: HouseData[];
  angles: Record<string, AngleData>;
  aspects: AspectData[];
  horoscopeImageSvg: string;
  input: HoroscopeInput;
  timestamp: Date;
}
