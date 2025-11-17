export type RelicColor = '赤' | '青' | '黄' | '緑';
export type GrailColor = '赤' | '青' | '黄' | '緑' | '無色';

export interface Category {
  id: string;
  name: string;
}

export interface Effect {
  id: string;
  categoryId: string;
  description: string;
}

export interface Relic {
  id: string;
  color: RelicColor;
  effects: [string, string, string]; // 効果IDの配列（必ず3つ）
}

export interface NightRunner {
  id: string;
  name: string;
}

export interface Grail {
  id: string;
  nightRunnerId: string; // 所属する夜渡りのID
  colors: [GrailColor, GrailColor, GrailColor]; // 3つの色
}

export interface FavoriteCombination {
  id: string;
  grailId: string; // 盃のID
  relicIds: [string, string, string]; // 遺物のIDの配列（必ず3つ）
  description?: string; // 説明（オプション）
  createdAt: number; // タイムスタンプ
}
