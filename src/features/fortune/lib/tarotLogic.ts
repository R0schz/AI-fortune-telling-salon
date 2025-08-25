import { TAROT_DECK, TAROT_SPREADS } from '../data/tarotData';
import type { TarotCard, Spread, DrawnCard, TarotReadingResult } from '../types';

// カードをシャッフルして指定された枚数を引く
export function shuffleAndDraw(count: number): { card: TarotCard; isReversed: boolean }[] {
  const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(card => ({ 
    card, 
    isReversed: Math.random() < 0.5 
  }));
}

// 質問に基づいて最適なスプレッドを選択
export async function selectOptimalSpread(question: string): Promise<string> {
  // 質問の内容を分析して適切なスプレッドを選択
  const questionLower = question.toLowerCase();
  
  if (questionLower.includes('未来') || questionLower.includes('将来') || questionLower.includes('これから')) {
    return 'horseshoe';
  } else if (questionLower.includes('詳細') || questionLower.includes('詳しく') || questionLower.includes('分析')) {
    return 'celticCross';
  } else {
    return 'threeCards'; // デフォルト
  }
}

// 引かれたカードの解釈を生成
export async function interpretReading(
  question: string, 
  spread: Spread, 
  drawnCards: DrawnCard[]
): Promise<string> {
  try {
    // AI APIを使用して解釈を生成
    const response = await fetch('/api/tarot-interpretation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        spread: spread.name,
        drawnCards: drawnCards.map(dc => ({
          cardName: dc.card.name,
          isReversed: dc.isReversed,
          position: dc.position.name,
          positionMeaning: dc.position.meaning
        }))
      }),
    });

    if (!response.ok) {
      throw new Error('AI解釈の取得に失敗しました');
    }

    const data = await response.json();
    return data.interpretation;
  } catch (error) {
    // AI APIが利用できない場合のフォールバック解釈
    return generateFallbackInterpretation(question, spread, drawnCards);
  }
}

// フォールバック解釈の生成
function generateFallbackInterpretation(
  question: string, 
  spread: Spread, 
  drawnCards: DrawnCard[]
): string {
  let interpretation = `あなたの質問「${question}」について、${spread.name}で占いました。\n\n`;
  
  drawnCards.forEach((drawnCard, index) => {
    const card = drawnCard.card;
    const position = drawnCard.position;
    const reversedText = drawnCard.isReversed ? '（逆位置）' : '';
    
    interpretation += `${position.name}: ${card.name}${reversedText}\n`;
    interpretation += `${card.description}\n\n`;
  });
  
  interpretation += `この結果は、あなたの直感と照らし合わせて解釈してください。`;
  
  return interpretation;
}

// スプレッドのSVG画像を生成
export function generateSpreadImage(spread: Spread, drawnCards: DrawnCard[]): string {
  const cardWidth = 120;
  const cardHeight = 180;
  const margin = 20;
  
  let svg = `<svg width="${spread.cardCount * (cardWidth + margin) + margin}" height="${cardHeight + 40}" xmlns="http://www.w3.org/2000/svg">`;
  
  drawnCards.forEach((drawnCard, index) => {
    const x = index * (cardWidth + margin) + margin;
    const y = 20;
    
    // カードの背景
    svg += `<rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" fill="white" stroke="#333" stroke-width="2" rx="8"/>`;
    
    // カード名
    svg += `<text x="${x + cardWidth/2}" y="${y + 25}" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">${drawnCard.card.name}</text>`;
    
    // 逆位置マーカー
    if (drawnCard.isReversed) {
      svg += `<text x="${x + cardWidth/2}" y="${y + 45}" text-anchor="middle" font-family="Arial" font-size="10" fill="#ff6b6b">逆位置</text>`;
    }
    
    // 位置名
    svg += `<text x="${x + cardWidth/2}" y="${y + cardHeight - 15}" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${drawnCard.position.name}</text>`;
  });
  
  svg += '</svg>';
  return svg;
}

// メインのタロット占い実行関数
export async function performTarotReading(question: string): Promise<TarotReadingResult> {
  // 最適なスプレッドを選択
  const spreadId = await selectOptimalSpread(question);
  const spread = TAROT_SPREADS[spreadId] || TAROT_SPREADS.threeCards;
  
  // カードを引く
  const drawnRawCards = shuffleAndDraw(spread.cardCount);
  
  // 位置情報を付与
  const drawnCards: DrawnCard[] = drawnRawCards.map((card, index) => ({
    ...card,
    position: spread.positions[index]
  }));
  
  // 解釈を生成
  const interpretation = await interpretReading(question, spread, drawnCards);
  
  // スプレッド画像を生成
  const spreadImageSvg = generateSpreadImage(spread, drawnCards);
  
  return {
    interpretation,
    spreadName: spread.name,
    drawnCards,
    spreadImageSvg,
    question,
    timestamp: new Date()
  };
}
