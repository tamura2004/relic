import { Effect, Relic, Category, NightRunner, Grail } from '@/types';

const EFFECTS_KEY = 'relic_effects';
const RELICS_KEY = 'relic_relics';
const CATEGORIES_KEY = 'relic_categories';
const NIGHTRUNNERS_KEY = 'relic_nightrunners';
const GRAILS_KEY = 'relic_grails';

// デフォルトカテゴリのID
export const DEFAULT_CATEGORY_ID = 'default_other';

export const categoryStorage = {
  getAll: (): Category[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CATEGORIES_KEY);
    const categories = data ? JSON.parse(data) : [];

    // デフォルトカテゴリが存在しない場合は追加
    if (!categories.find((c: Category) => c.id === DEFAULT_CATEGORY_ID)) {
      const defaultCategory: Category = { id: DEFAULT_CATEGORY_ID, name: 'その他' };
      categories.unshift(defaultCategory);
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    }

    return categories;
  },
  save: (categories: Category[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },
};

export const effectStorage = {
  getAll: (): Effect[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(EFFECTS_KEY);
    const effects = data ? JSON.parse(data) : [];

    // 既存のeffectでcategoryIdがない場合はデフォルトカテゴリを設定
    const migrated = effects.map((effect: Effect) => {
      if (!effect.categoryId) {
        return { ...effect, categoryId: DEFAULT_CATEGORY_ID };
      }
      return effect;
    });

    // マイグレーションがあった場合は保存
    if (migrated.some((e: Effect, i: number) => e !== effects[i])) {
      localStorage.setItem(EFFECTS_KEY, JSON.stringify(migrated));
    }

    return migrated;
  },
  save: (effects: Effect[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EFFECTS_KEY, JSON.stringify(effects));
  },
};

export const relicStorage = {
  getAll: (): Relic[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(RELICS_KEY);
    return data ? JSON.parse(data) : [];
  },
  save: (relics: Relic[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(RELICS_KEY, JSON.stringify(relics));
  },
};

export const nightRunnerStorage = {
  getAll: (): NightRunner[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(NIGHTRUNNERS_KEY);
    return data ? JSON.parse(data) : [];
  },
  save: (nightRunners: NightRunner[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(NIGHTRUNNERS_KEY, JSON.stringify(nightRunners));
  },
};

export const grailStorage = {
  getAll: (): Grail[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(GRAILS_KEY);
    return data ? JSON.parse(data) : [];
  },
  save: (grails: Grail[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GRAILS_KEY, JSON.stringify(grails));
  },
};
