const STORAGE_KEY = "principito-expansion-progreso-v1";
const CHAPTERS = [1, 2, 3];
const DEFAULT_UNLOCKS = {
  extras: false,
  level4: false,
  eren: false,
  erenTitan: false,
  mikasa: false,
  kanye: false,
};
const DEFAULT_DATA = {
  uniqueStars: [],
  totalStars: 0,
  completed: { normal: [], dificil: [] },
  unlocked: DEFAULT_UNLOCKS,
  collectionCatalog: {},
  collectedItems: {},
  developerUnlockAll: false,
};

export class ProgressionManager {
  constructor(storage) {
    if (storage === undefined) {
      try {
        storage = globalThis.localStorage;
      } catch {
        storage = null;
      }
    }
    this.storage = storage;
    this.data = this.read();
  }

  read() {
    try {
      const saved = JSON.parse(this.storage?.getItem(STORAGE_KEY) ?? "null");
      if (!saved || typeof saved !== "object") return structuredClone(DEFAULT_DATA);
      const unlocked = { ...DEFAULT_UNLOCKS };
      for (const [key, value] of Object.entries(saved.unlocked ?? {})) {
        if (typeof value === "boolean") unlocked[key] = value;
      }
      const collectionCatalog = {};
      const collectedItems = {};
      for (const [name, ids] of Object.entries(saved.collectionCatalog ?? {})) {
        if (!Array.isArray(ids)) continue;
        collectionCatalog[name] = [...new Set(ids.filter((id) => typeof id === "string"))];
      }
      for (const [name, ids] of Object.entries(saved.collectedItems ?? {})) {
        if (Array.isArray(ids)) collectedItems[name] = [...new Set(ids.filter((id) => typeof id === "string"))];
      }
      return {
        uniqueStars: Array.isArray(saved.uniqueStars) ? [...new Set(saved.uniqueStars.filter((id) => typeof id === "string"))] : [],
        totalStars: Number.isFinite(saved.totalStars) ? Math.max(0, saved.totalStars) : 0,
        completed: {
          normal: this.validChapters(saved.completed?.normal),
          dificil: this.validChapters(saved.completed?.dificil),
        },
        unlocked,
        collectionCatalog,
        collectedItems,
        developerUnlockAll: saved.developerUnlockAll === true,
      };
    } catch {
      return structuredClone(DEFAULT_DATA);
    }
  }

  validChapters(value) {
    return Array.isArray(value) ? [...new Set(value.filter((chapter) => CHAPTERS.includes(chapter)))].sort() : [];
  }

  save() {
    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // El progreso continúa disponible durante la sesión si el almacenamiento está bloqueado.
    }
  }

  registerUnlock(key) {
    if (typeof key !== "string" || !key) return false;
    if (!(key in this.data.unlocked)) this.data.unlocked[key] = this.data.developerUnlockAll;
    if (this.data.developerUnlockAll) this.data.unlocked[key] = true;
    this.save();
    return this.isUnlocked(key);
  }

  registerCollection(name, ids) {
    if (typeof name !== "string" || !name || !Array.isArray(ids)) return;
    const catalog = [...new Set(ids.filter((id) => typeof id === "string" && id))];
    this.data.collectionCatalog[name] = catalog;
    if (!Array.isArray(this.data.collectedItems[name])) this.data.collectedItems[name] = [];
    if (this.data.developerUnlockAll) this.data.collectedItems[name] = [...catalog];
    this.save();
  }

  collectItem(collection, id) {
    if (typeof collection !== "string" || typeof id !== "string" || !id) return false;
    if (!(collection in this.data.collectionCatalog)) this.data.collectionCatalog[collection] = [];
    if (!this.data.collectionCatalog[collection].includes(id)) this.data.collectionCatalog[collection].push(id);
    if (this.data.developerUnlockAll) {
      this.data.collectedItems[collection] = [...this.data.collectionCatalog[collection]];
      this.save();
      return false;
    }
    const collected = this.data.collectedItems[collection] ??= [];
    if (collected.includes(id)) return false;
    collected.push(id);
    this.save();
    return true;
  }

  isCollected(collection, id) {
    return this.data.developerUnlockAll || this.data.collectedItems[collection]?.includes(id) === true;
  }

  unlockEverything({ campaignStarIds = [] } = {}) {
    this.data.developerUnlockAll = true;
    for (const key of Object.keys(this.data.unlocked)) this.data.unlocked[key] = true;
    for (const difficulty of Object.keys(this.data.completed)) this.data.completed[difficulty] = [...CHAPTERS];
    for (const [name, ids] of Object.entries(this.data.collectionCatalog)) {
      this.data.collectedItems[name] = [...ids];
    }
    const stars = [...new Set(campaignStarIds.filter((id) => typeof id === "string" && id))];
    if (stars.length) {
      this.data.collectionCatalog.campaignStars = stars;
      this.data.collectedItems.campaignStars = [...stars];
      this.data.uniqueStars = [...stars];
      this.data.totalStars = stars.length;
    }
    this.save();
  }

  setTotalStars(total) {
    if (!Number.isFinite(total) || total < 0 || this.data.totalStars === total) return [];
    this.data.totalStars = total;
    const newlyUnlocked = this.evaluateStarUnlocks();
    this.save();
    return newlyUnlocked;
  }

  evaluateStarUnlocks() {
    if (this.data.developerUnlockAll) {
      for (const key of Object.keys(this.data.unlocked)) this.data.unlocked[key] = true;
      return [];
    }
    if (this.data.totalStars === 0) return [];
    const percentage = this.data.uniqueStars.length / this.data.totalStars;
    const unlocked = [];
    if (percentage >= 0.7 && this.unlock("eren")) unlocked.push("eren");
    if (percentage >= 1 && this.unlock("erenTitan")) unlocked.push("erenTitan");
    return unlocked;
  }

  unlock(key) {
    if (typeof key !== "string" || !key) return false;
    this.registerUnlock(key);
    if (this.data.unlocked[key]) return false;
    this.data.unlocked[key] = true;
    return true;
  }

  collectStar(id) {
    if (typeof id !== "string" || this.data.uniqueStars.includes(id)) return [];
    if (!this.data.collectionCatalog.campaignStars) this.data.collectionCatalog.campaignStars = [];
    if (!this.data.collectionCatalog.campaignStars.includes(id)) this.data.collectionCatalog.campaignStars.push(id);
    if (this.data.developerUnlockAll) {
      this.data.uniqueStars = [...this.data.collectionCatalog.campaignStars];
      this.data.collectedItems.campaignStars = [...this.data.uniqueStars];
      this.save();
      return [];
    }
    this.data.uniqueStars.push(id);
    this.data.collectedItems.campaignStars ??= [];
    this.data.collectedItems.campaignStars.push(id);
    const newlyUnlocked = this.evaluateStarUnlocks();
    this.save();
    return newlyUnlocked;
  }

  recordChapterComplete(chapter, difficulty) {
    if (!CHAPTERS.includes(chapter) || !(difficulty in this.data.completed)) return [];
    const completed = this.data.completed[difficulty];
    if (!completed.includes(chapter)) completed.push(chapter);
    completed.sort();
    const newlyUnlocked = [];
    if (difficulty === "normal" && completed.length === CHAPTERS.length && this.unlock("mikasa")) newlyUnlocked.push("mikasa");
    if (difficulty === "dificil" && completed.length === CHAPTERS.length && this.unlock("kanye")) newlyUnlocked.push("kanye");
    this.save();
    return newlyUnlocked;
  }

  completeCampaign() {
    const newlyUnlocked = [];
    if (this.unlock("extras")) newlyUnlocked.push("extras");
    if (this.unlock("level4")) newlyUnlocked.push("level4");
    this.save();
    return newlyUnlocked;
  }

  isUnlocked(key) {
    return this.data.developerUnlockAll || this.data.unlocked[key] === true;
  }

  getStarProgress() {
    const total = this.data.totalStars;
    const obtained = this.data.uniqueStars.length;
    return { obtained, total, percentage: total ? Math.floor((obtained / total) * 100) : 0 };
  }
}
