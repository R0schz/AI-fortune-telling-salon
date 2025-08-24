import { NextRequest, NextResponse } from 'next/server';
import { calculateHoroscope } from '@/features/fortune/lib/horoscopeLogic';
import type { HoroscopeInput } from '@/features/fortune/types';

// API設定
const API_CONFIG = {
  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
};

// エラーレスポンス生成
function createErrorResponse(message: string, status: number = 500) {
  return NextResponse.json(
    { error: message },
    { status }
  );
}

// 住所から座標を取得
async function getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!API_CONFIG.GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_CONFIG.GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Google Maps API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting coordinates from address:', error);
    return null;
  }
}

// 数秘術プロンプト生成
function generateNumerologyPrompt(birthDate: string, question: string): string {
  return `あなたは数秘術を極めたプロの占術家です。依頼者の心に深く寄り添い、以下のルールと依頼内容に従って、詳細で温かい鑑定文を作成してください。

## 鑑定の心構え（最重要ルール）
* 寄り添う姿勢: 常に相談者の気持ちに深く寄り添い、優しく、丁寧で、共感的な言葉を選んでください。
* 多角的な視点: 鑑定結果の「良い/悪い」という二元論で判断せず、相談者の状況にとって「どのような意味を持つか」「どう活かせるか」という多角的な視点で解釈してください。
* 具体性と分かりやすさ: 抽象的な言葉で終わらせず、相談者が「なるほど、だからこうなのか」「これを試してみよう」と思えるような、具体的で分かりやすい言葉で伝えてください。
* 希望を与える: 相談者の不安を煽るのではなく、鑑定結果から希望の光を見いだし、その人の持つ可能性や強みを引き出すことを目的とします。最終的に、相談者の背中をそっと押すような、温かく前向きなメッセージで締めくくってください。
* 物語性: 鑑定結果の各要素をバラバラに伝えるのではなく、相談者の人生という一つの「物語」として捉え、一貫性のあるストーリーを組み立ててください。

## 鑑定の依頼
以下の情報に基づいて、鑑定文を作成してください。
* 占術の種類: 数秘術
* 鑑定の焦点（相談内容）: ${question}
* 占術データ: 生年月日: ${birthDate}
* 鑑定文の構成: 
  1. 数秘術による基本的な性格分析
  2. 生年月日から導かれる運命数とその意味
  3. 現在の状況と数秘術の関係性
  4. 今後の運勢とアドバイス
  5. 相談者の背中を押す温かいメッセージ
* その他特記事項: 親しみやすい友人への手紙のような文体で、具体的で実用的なアドバイスを含めてください。

**重要**: あなたは自己紹介をしてはいけません。占術家としての立場を明示せず、直接的に鑑定内容に入ってください。`;
}

// タロット占いプロンプト生成
function generateTarotPrompt(cards: string[], question: string): string {
  return `あなたはタロット占いを極めたプロの占術家です。依頼者の心に深く寄り添い、以下のルールと依頼内容に従って、詳細で温かい鑑定文を作成してください。

## 鑑定の心構え（最重要ルール）
* 寄り添う姿勢: 常に相談者の気持ちに深く寄り添い、優しく、丁寧で、共感的な言葉を選んでください。
* 多角的な視点: 鑑定結果の「良い/悪い」という二元論で判断せず、相談者の状況にとって「どのような意味を持つか」「どう活かせるか」という多角的な視点で解釈してください。
* 具体性と分かりやすさ: 抽象的な言葉で終わらせず、相談者が「なるほど、だからこうなのか」「これを試してみよう」と思えるような、具体的で分かりやすい言葉で伝えてください。
* 希望を与える: 相談者の不安を煽るのではなく、鑑定結果から希望の光を見いだし、その人の持つ可能性や強みを引き出すことを目的とします。最終的に、相談者の背中をそっと押すような、温かく前向きなメッセージで締めくくってください。
* 物語性: 鑑定結果の各要素をバラバラに伝えるのではなく、相談者の人生という一つの「物語」として捉え、一貫性のあるストーリーを組み立ててください。

## 鑑定の依頼
以下の情報に基づいて、鑑定文を作成してください。
* 占術の種類: タロット占い
* 鑑定の焦点（相談内容）: ${question}
* 占術データ: 引かれたカード: ${cards.join(', ')}
* 鑑定文の構成: 
  1. 各カードの基本的な意味と現在の状況への適用
  2. カードの組み合わせが示すメッセージ
  3. 現在の状況の深層的な分析
  4. 今後の方向性と具体的なアドバイス
  5. 相談者の背中を押す温かいメッセージ
* その他特記事項: 親しみやすい友人への手紙のような文体で、具体的で実用的なアドバイスを含めてください。

**重要**: あなたは自己紹介をしてはいけません。占術家としての立場を明示せず、直接的に鑑定内容に入ってください。`;
}

// ホロスコープ占いプロンプト生成
function generateHoroscopePrompt(horoscopeData: any, question: string): string {
  return `あなたは西洋占星術を極めたプロの占術家です。依頼者の心に深く寄り添い、以下のルールと依頼内容に従って、詳細で温かい鑑定文を作成してください。

## 鑑定の心構え（最重要ルール）
* 寄り添う姿勢: 常に相談者の気持ちに深く寄り添い、優しく、丁寧で、共感的な言葉を選んでください。
* 多角的な視点: 鑑定結果の「良い/悪い」という二元論で判断せず、相談者の状況にとって「どのような意味を持つか」「どう活かせるか」という多角的な視点で解釈してください。
* 具体性と分かりやすさ: 抽象的な言葉で終わらせず、相談者が「なるほど、だからこうなのか」「これを試してみよう」と思えるような、具体的で分かりやすい言葉で伝えてください。
* 希望を与える: 相談者の不安を煽るのではなく、鑑定結果から希望の光を見いだし、その人の持つ可能性や強みを引き出すことを目的とします。最終的に、相談者の背中をそっと押すような、温かく前向きなメッセージで締めくくってください。
* 物語性: 鑑定結果の各要素をバラバラに伝えるのではなく、相談者の人生という一つの「物語」として捉え、一貫性のあるストーリーを組み立ててください。

## 鑑定の依頼
以下の情報に基づいて、鑑定文を作成してください。
* 占術の種類: 西洋占星術（ホロスコープ）
* 鑑定の焦点（相談内容）: ${question}
* 占術データ: ${horoscopeData}
* 鑑定文の構成: 
  1. ホロスコープの基本的な解釈と性格分析
  2. 主要な天体の配置とその意味
  3. ハウスの配置と人生の各領域への影響
  4. アスペクトの解釈と現在の状況への適用
  5. 今後の運勢と具体的なアドバイス
  6. 相談者の背中を押す温かいメッセージ
* その他特記事項: 親しみやすい友人への手紙のような文体で、具体的で実用的なアドバイスを含めてください。

**重要**: あなたは自己紹介をしてはいけません。占術家としての立場を明示せず、直接的に鑑定内容に入ってください。`;
}

// ホロスコープデータをプロンプト用にフォーマット
function formatHoroscopeDataForPrompt(horoscopeOutput: any): string {
  const { planets, houses, angles, aspects } = horoscopeOutput;
  
  let result = '**天体の配置:**\n';
  
  // 天体の情報を追加
  if (planets && Object.keys(planets).length > 0) {
    Object.entries(planets).forEach(([key, planet]: [string, any]) => {
      result += `- ${planet.name}: ${planet.sign} ${planet.degreeInSign.toFixed(2)}度、${planet.house}ハウス\n`;
    });
  }
  
  result += '**感受点:**\n';
  
  // 感受点の情報を追加
  if (angles && Object.keys(angles).length > 0) {
    Object.entries(angles).forEach(([key, angle]: [string, any]) => {
      result += `- ${angle.name}: ${angle.sign} ${angle.degreeInSign.toFixed(2)}度\n`;
    });
  }
  
  result += '**ハウス:**\n';
  
  // ハウスの情報を追加
  if (houses && houses.length > 0) {
    houses.forEach((house: any) => {
      result += `- ${house.number}ハウス: ${house.sign} ${house.degreeInSign.toFixed(2)}度\n`;
    });
  } else {
    result += 'データが利用できません\n';
  }
  
  return result;
}

// ホロスコープ計算（API用）
function calculateHoroscopeForAPI(input: any): any {
  const horoscopeInput: HoroscopeInput = {
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone || 9,
  };

  return calculateHoroscope(horoscopeInput);
}

// Claude API呼び出し
async function callClaudeAPI(prompt: string): Promise<string> {
  if (!API_CONFIG.CLAUDE_API_KEY) {
    throw new Error('Claude API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_CONFIG.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: API_CONFIG.CLAUDE_MODEL,
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Claude API request failed: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// メインのAPI処理
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { method, birthDate, birthTime, birthAddress, birthLatitude, birthLongitude, question } = requestData;

    // 入力検証
    if (!method || !birthDate || !birthTime) {
      return createErrorResponse('必須パラメータが不足しています', 400);
    }

    let prompt = '';
    let horoscopeData = null;

    // 占術の種類に応じて処理
    switch (method) {
      case 'numerology':
        prompt = generateNumerologyPrompt(birthDate, question || '全般的な運勢');
        break;

      case 'tarot':
        // タロットカードの配列を生成（簡略化）
        const cards = ['愚者', '魔術師', '女教皇', '女帝', '皇帝'];
        prompt = generateTarotPrompt(cards, question || '全般的な運勢');
        break;

      case 'horoscope':
        // 日時と座標を解析
        const [year, month, day] = birthDate.split('-').map(Number);
        const [hour, minute] = birthTime.split(':').map(Number);
        
        let latitude = birthLatitude;
        let longitude = birthLongitude;

        // 座標が提供されていない場合は住所から取得
        if (!latitude || !longitude) {
          if (!birthAddress) {
            return createErrorResponse('住所または座標が必要です', 400);
          }
          
          const coords = await getCoordinatesFromAddress(birthAddress);
          if (!coords) {
            return createErrorResponse('住所から座標を取得できませんでした', 400);
          }
          
          latitude = coords.lat;
          longitude = coords.lng;
        }

        // ホロスコープ計算
        horoscopeData = calculateHoroscopeForAPI({
          year,
          month,
          day,
          hour,
          minute,
          latitude,
          longitude,
          timezone: 9,
        });

        // ホロスコープデータをプロンプト用にフォーマット
        const formattedHoroscopeData = formatHoroscopeDataForPrompt(horoscopeData);
        prompt = generateHoroscopePrompt(formattedHoroscopeData, question || '全般的な運勢');
        break;

      default:
        return createErrorResponse('サポートされていない占術です', 400);
    }

    // Claude API呼び出し
    console.log('API Route: Claude API呼び出し開始');
    const aiResponse = await callClaudeAPI(prompt);
    console.log('API Route: Claude API応答受信 { status: 200 }');

    // レスポンスデータを構築
    const responseData: any = {
      method,
      interpretation: aiResponse,
      timestamp: new Date(),
    };

    // ホロスコープの場合は追加データを含める
    if (method === 'horoscope' && horoscopeData) {
      responseData.horoscope = horoscopeData;
    }

    console.log('API Route: 成功 - 結果を返却');
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return createErrorResponse(`API Error: ${error.message}`, 500);
    }
    
    return createErrorResponse('占い生成中にエラーが発生しました', 500);
  }
}
