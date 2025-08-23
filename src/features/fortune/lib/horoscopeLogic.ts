import { Origin, Horoscope } from "circular-natal-horoscope-js";
import type { HoroscopeInput, HoroscopeOutput, PlanetData, HouseData, AngleData, AspectData } from '../types';
import { PLANET_SYMBOLS, ANGLE_SYMBOLS, SIGN_SYMBOLS, ASPECT_DETAILS } from '../data/horoscopeData';

// 度数を星座内での位置に変換
function formatPositionInSign(degree: number): { sign: string; degreeInSign: number } {
  const signIndex = Math.floor(degree / 30);
  const degreeInSign = degree % 30;
  const signs = ["牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座", "水瓶座", "魚座"];
  return {
    sign: signs[signIndex],
    degreeInSign: degreeInSign
  };
}

// ホロスコープ画像生成関数
function generateHoroscopeImage(horoscopeData: Omit<HoroscopeOutput, 'horoscopeImageSvg' | 'input' | 'timestamp'>): string {
  const SIZE = 500;
  const CENTER = SIZE / 2;
  const ZODIAC_RING_RADIUS = CENTER - 30;
  const HOUSE_RING_RADIUS = ZODIAC_RING_RADIUS - 40;
  const PLANET_RING_RADIUS = HOUSE_RING_RADIUS - 25;

  const degreeToRadians = (deg: number) => (deg - 90) * (Math.PI / 180);

  const getCoordinates = (radius: number, degree: number) => {
    const rad = degreeToRadians(degree);
    return {
      x: CENTER + radius * Math.cos(rad),
      y: CENTER + radius * Math.sin(rad),
    };
  };

  let svgElements = '';

  // 1. ベースとなる円を描画
  svgElements += `<circle cx="${CENTER}" cy="${CENTER}" r="${ZODIAC_RING_RADIUS}" fill="none" stroke="#e9d5ff" stroke-width="1"/>`;
  svgElements += `<circle cx="${CENTER}" cy="${CENTER}" r="${HOUSE_RING_RADIUS}" fill="none" stroke="#e9d5ff" stroke-width="1"/>`;
  svgElements += `<circle cx="${CENTER}" cy="${CENTER}" r="${PLANET_RING_RADIUS}" fill="none" stroke="#f3e8ff" stroke-width="0.5" stroke-dasharray="4 4"/>`;

  // 2. 12星座のサインと区切り線を描画
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const start = getCoordinates(HOUSE_RING_RADIUS, angle);
    const end = getCoordinates(ZODIAC_RING_RADIUS, angle);
    svgElements += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="#d8b4fe" stroke-width="1"/>`;
    
    const signPos = getCoordinates(ZODIAC_RING_RADIUS + 15, angle + 15);
    svgElements += `<text x="${signPos.x}" y="${signPos.y}" font-size="20" fill="#a855f7" text-anchor="middle" dominant-baseline="middle">${SIGN_SYMBOLS[i]}</text>`;
  }

  // 3. ハウスのカスプ（境界線）と番号を描画
  horoscopeData.houses.forEach((cusp, i) => {
    const start = getCoordinates(0, cusp.degree);
    const end = getCoordinates(HOUSE_RING_RADIUS, cusp.degree);
    svgElements += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="#c084fc" stroke-width="0.7"/>`;
    
    const houseNumPos = getCoordinates(HOUSE_RING_RADIUS - 15, cusp.degree + 15);
    svgElements += `<text x="${houseNumPos.x}" y="${houseNumPos.y}" font-size="12" fill="#7e22ce" text-anchor="middle" dominant-baseline="middle">${i + 1}</text>`;
  });

  // 4. 天体と感受点を描画
  const allPoints = { ...horoscopeData.planets, ...horoscopeData.angles };
  for (const key in allPoints) {
    const point = allPoints[key];
    const symbol = PLANET_SYMBOLS[key] || ANGLE_SYMBOLS[key];
    if (symbol) {
      const pos = getCoordinates(PLANET_RING_RADIUS, point.degree);
      svgElements += `<text x="${pos.x}" y="${pos.y}" font-size="18" fill="#581c87" text-anchor="middle" dominant-baseline="middle">${symbol}</text>`;
      if (point.isRetrograde) {
        svgElements += `<text x="${pos.x}" y="${pos.y + 12}" font-size="10" fill="#c026d3" text-anchor="middle">R</text>`;
      }
    }
  }

  // 5. アスペクト線を描画
  const aspectColors = { 
    conjunction: '#6b7280', 
    opposition: '#ef4444', 
    trine: '#22c55e', 
    square: '#3b82f6', 
    sextile: '#f97316' 
  };
  
  horoscopeData.aspects.forEach(aspect => {
    const color = aspectColors[aspect.aspect.toLowerCase()];
    if (color) {
      const p1 = allPoints[aspect.planet1.toLowerCase()];
      const p2 = allPoints[aspect.planet2.toLowerCase()];
      if (p1 && p2) {
        const start = getCoordinates(PLANET_RING_RADIUS - 12, p1.degree);
        const end = getCoordinates(PLANET_RING_RADIUS - 12, p2.degree);
        svgElements += `<line x1="${start.x}" y1="${start.y}" x2="${end.x}" y2="${end.y}" stroke="${color}" stroke-width="1" opacity="0.7"/>`;
      }
    }
  });

  return `<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg" style="background-color: #faf5ff; border-radius: 50%;">
    ${svgElements}
  </svg>`;
}

// メインのホロスコープ計算関数
export function calculateHoroscope(input: HoroscopeInput): HoroscopeOutput {
  try {
    // Originオブジェクトの作成
    const origin = new Origin({
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: input.timezone
    });

    // Horoscopeオブジェクトの作成
    const horoscope = new Horoscope({
      origin: origin,
      houseSystem: 'placidus'
    });

    // 天体データの取得と整形
    const planets: Record<string, PlanetData> = {};
    const planetNames = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
    
    planetNames.forEach(planetName => {
      const planet = horoscope.Planets[planetName];
      if (planet) {
        const position = formatPositionInSign(planet.Degree);
        planets[planetName] = {
          degree: planet.Degree,
          sign: position.sign,
          house: planet.House,
          isRetrograde: planet.IsRetrograde,
          name: planetName
        };
      }
    });

    // ハウスデータの取得と整形
    const houses: HouseData[] = [];
    for (let i = 1; i <= 12; i++) {
      const house = horoscope.Houses[i];
      if (house) {
        const position = formatPositionInSign(house.Degree);
        houses.push({
          degree: house.Degree,
          sign: position.sign,
          number: i
        });
      }
    }

    // 感受点データの取得と整形
    const angles: Record<string, AngleData> = {};
    const ascendant = horoscope.Ascendant;
    const midheaven = horoscope.Midheaven;
    
    if (ascendant) {
      const position = formatPositionInSign(ascendant.Degree);
      angles.ascendant = {
        degree: ascendant.Degree,
        sign: position.sign,
        name: 'ascendant'
      };
    }
    
    if (midheaven) {
      const position = formatPositionInSign(midheaven.Degree);
      angles.midheaven = {
        degree: midheaven.Degree,
        sign: position.sign,
        name: 'midheaven'
      };
    }

    // アスペクトデータの取得と整形
    const aspects: AspectData[] = [];
    const aspectList = horoscope.Aspects;
    
    aspectList.forEach(aspect => {
      aspects.push({
        planet1: aspect.Planet1.Name,
        planet2: aspect.Planet2.Name,
        aspect: aspect.Aspect.Name,
        orb: aspect.Orb,
        orbString: aspect.OrbString
      });
    });

    // 計算結果を一時オブジェクトに格納
    const calculatedData = {
      planets,
      houses,
      angles,
      aspects,
    };

    // 計算結果を基にSVG画像を生成
    const horoscopeImageSvg = generateHoroscopeImage(calculatedData);

    // 最終的な返り値にSVG画像を追加して返す
    return {
      ...calculatedData,
      horoscopeImageSvg,
      input,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('ホロスコープ計算エラー:', error);
    throw new Error('ホロスコープの計算に失敗しました。入力データを確認してください。');
  }
}
