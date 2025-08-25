// 天体のシンボル
export const PLANET_SYMBOLS = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
};

// 感受点のシンボル
export const ANGLE_SYMBOLS = {
  ascendant: "AC",
  midheaven: "MC",
};

// 12星座のシンボル
export const SIGN_SYMBOLS = [
  "♈", "♉", "♊", "♋", "♌", "♍",
  "♎", "♏", "♐", "♑", "♒", "♓"
];

// 天体の日本語名
export const PLANET_NAMES = {
  sun: "太陽",
  moon: "月",
  mercury: "水星",
  venus: "金星",
  mars: "火星",
  jupiter: "木星",
  saturn: "土星",
  uranus: "天王星",
  neptune: "海王星",
  pluto: "冥王星",
};

// 感受点の日本語名
export const ANGLE_NAMES = {
  ascendant: "アセンダント",
  midheaven: "MC",
};

// 12星座の日本語名
export const SIGN_NAMES = [
  "牡羊座", "牡牛座", "双子座", "蟹座",
  "獅子座", "乙女座", "天秤座", "蠍座",
  "射手座", "山羊座", "水瓶座", "魚座"
];

// アスペクトの詳細情報
export const ASPECT_DETAILS = {
  conjunction: {
    name: "コンジャンクション",
    description: "0度 - 強力な結合、融合",
    orb: 8,
    color: "#6b7280"
  },
  opposition: {
    name: "オポジション",
    description: "180度 - 対立、緊張、バランス",
    orb: 8,
    color: "#ef4444"
  },
  trine: {
    name: "トライン",
    description: "120度 - 調和、流れ、才能",
    orb: 8,
    color: "#22c55e"
  },
  square: {
    name: "スクエア",
    description: "90度 - 困難、課題、成長",
    orb: 8,
    color: "#3b82f6"
  },
  sextile: {
    name: "セクスタイル",
    description: "60度 - 機会、協力、発展",
    orb: 6,
    color: "#f97316"
  }
};

// ハウスの意味
export const HOUSE_MEANINGS = {
  1: "自己、外見、第一印象",
  2: "価値観、所有物、金銭",
  3: "コミュニケーション、学習、兄弟",
  4: "家庭、家族、不動産",
  5: "創造性、恋愛、子供",
  6: "仕事、健康、奉仕",
  7: "パートナーシップ、結婚、対人関係",
  8: "変容、共有財産、性的エネルギー",
  9: "哲学、旅行、高等教育",
  10: "キャリア、社会的地位、目標",
  11: "友人、グループ、希望",
  12: "無意識、隠れたもの、精神性"
};

// 星座の要素
export const SIGN_ELEMENTS = {
  fire: ["牡羊座", "獅子座", "射手座"],
  earth: ["牡牛座", "乙女座", "山羊座"],
  air: ["双子座", "天秤座", "水瓶座"],
  water: ["蟹座", "蠍座", "魚座"]
};

// 星座の性質
export const SIGN_QUALITIES = {
  cardinal: ["牡羊座", "蟹座", "天秤座", "山羊座"],
  fixed: ["牡牛座", "獅子座", "蠍座", "水瓶座"],
  mutable: ["双子座", "乙女座", "射手座", "魚座"]
};
