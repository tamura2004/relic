import { Effect, Relic, Category, NightRunner, Grail } from '@/types';
import { db } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';

// デフォルトカテゴリのID
export const DEFAULT_CATEGORY_ID = 'default_other';

// Firestoreのコレクション名
const COLLECTIONS = {
  CATEGORIES: 'categories',
  EFFECTS: 'effects',
  RELICS: 'relics',
  NIGHTRUNNERS: 'nightrunners',
  GRAILS: 'grails',
};

export const categoryStorage = {
  getAll: async (): Promise<Category[]> => {
    const categoriesRef = collection(db, COLLECTIONS.CATEGORIES);
    const q = query(categoriesRef, orderBy('name'));
    const snapshot = await getDocs(q);
    const categories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));

    // デフォルトカテゴリが存在しない場合は追加
    if (!categories.find((c: Category) => c.id === DEFAULT_CATEGORY_ID)) {
      const defaultCategory: Category = { id: DEFAULT_CATEGORY_ID, name: 'その他' };
      await setDoc(doc(db, COLLECTIONS.CATEGORIES, DEFAULT_CATEGORY_ID), {
        name: defaultCategory.name,
      });
      categories.unshift(defaultCategory);
    }

    return categories;
  },
  save: async (categories: Category[]) => {
    const batch = writeBatch(db);

    // 既存のドキュメントをすべて削除してから新しいデータを保存
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    categories.forEach((category) => {
      const categoryRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
      batch.set(categoryRef, { name: category.name });
    });

    await batch.commit();
  },
};

export const effectStorage = {
  getAll: async (): Promise<Effect[]> => {
    const effectsRef = collection(db, COLLECTIONS.EFFECTS);
    const snapshot = await getDocs(effectsRef);
    const effects = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Effect));

    // 既存のeffectでcategoryIdがない場合はデフォルトカテゴリを設定
    const needsMigration = effects.some(e => !e.categoryId);
    if (needsMigration) {
      const batch = writeBatch(db);
      effects.forEach((effect) => {
        if (!effect.categoryId) {
          effect.categoryId = DEFAULT_CATEGORY_ID;
          const effectRef = doc(db, COLLECTIONS.EFFECTS, effect.id);
          batch.update(effectRef, { categoryId: DEFAULT_CATEGORY_ID });
        }
      });
      await batch.commit();
    }

    return effects;
  },
  save: async (effects: Effect[]) => {
    const batch = writeBatch(db);

    // 既存のドキュメントをすべて削除してから新しいデータを保存
    const snapshot = await getDocs(collection(db, COLLECTIONS.EFFECTS));
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    effects.forEach((effect) => {
      const effectRef = doc(db, COLLECTIONS.EFFECTS, effect.id);
      batch.set(effectRef, {
        categoryId: effect.categoryId,
        description: effect.description,
      });
    });

    await batch.commit();
  },
};

export const relicStorage = {
  getAll: async (): Promise<Relic[]> => {
    const relicsRef = collection(db, COLLECTIONS.RELICS);
    const snapshot = await getDocs(relicsRef);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Relic));
  },
  save: async (relics: Relic[]) => {
    const batch = writeBatch(db);

    // 既存のドキュメントをすべて削除してから新しいデータを保存
    const snapshot = await getDocs(collection(db, COLLECTIONS.RELICS));
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    relics.forEach((relic) => {
      const relicRef = doc(db, COLLECTIONS.RELICS, relic.id);
      batch.set(relicRef, {
        color: relic.color,
        effects: relic.effects,
      });
    });

    await batch.commit();
  },
};

export const nightRunnerStorage = {
  getAll: async (): Promise<NightRunner[]> => {
    const nightRunnersRef = collection(db, COLLECTIONS.NIGHTRUNNERS);
    const snapshot = await getDocs(nightRunnersRef);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as NightRunner));
  },
  save: async (nightRunners: NightRunner[]) => {
    const batch = writeBatch(db);

    // 既存のドキュメントをすべて削除してから新しいデータを保存
    const snapshot = await getDocs(collection(db, COLLECTIONS.NIGHTRUNNERS));
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    nightRunners.forEach((nightRunner) => {
      const nightRunnerRef = doc(db, COLLECTIONS.NIGHTRUNNERS, nightRunner.id);
      batch.set(nightRunnerRef, {
        name: nightRunner.name,
      });
    });

    await batch.commit();
  },
};

export const grailStorage = {
  getAll: async (): Promise<Grail[]> => {
    const grailsRef = collection(db, COLLECTIONS.GRAILS);
    const snapshot = await getDocs(grailsRef);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Grail));
  },
  save: async (grails: Grail[]) => {
    const batch = writeBatch(db);

    // 既存のドキュメントをすべて削除してから新しいデータを保存
    const snapshot = await getDocs(collection(db, COLLECTIONS.GRAILS));
    snapshot.docs.forEach((document) => {
      batch.delete(document.ref);
    });

    grails.forEach((grail) => {
      const grailRef = doc(db, COLLECTIONS.GRAILS, grail.id);
      batch.set(grailRef, {
        nightRunnerId: grail.nightRunnerId,
        colors: grail.colors,
      });
    });

    await batch.commit();
  },
};
