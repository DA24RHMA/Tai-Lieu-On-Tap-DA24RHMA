/* --- DATABASE MODULE ---
 * Quản lý: Coin, Streak, Quest, Pomodoro, Forest, Card Overrides (Sửa/Ẩn), Settings
 */

const DB_KEY = "DA24RHMA_USER_DATA";

const DEFAULT_USER_DATA = {
  coins: 0,
  streak: 0,
  lastLoginDate: null,
  quests: {
    lastReset: null,
    q30: false,
    q50: false,
    q100: false,
    pomo: false,
    cardsLearnedToday: 0,
  },
  pomodoro: {
    workTime: 25 * 60,
    breakTime: 5 * 60,
  },
  forest: {
    seeds: 0,
    trees: 0,
  },
  // NEW: Lưu trạng thái riêng của từng thẻ (Edit, Hidden, FSRS data)
  // Cấu trúc: { "card_id": { hidden: boolean, question: "...", answer: "...", fsrs: {} } }
  cardOverrides: {},
  settings: {
    theme: "galaxy", // Lưu theme vào DB luôn
  },
};

class Database {
  constructor() {
    this.data = this.load();
    this.checkDailyReset();
  }

  load() {
    const json = localStorage.getItem(DB_KEY);
    if (!json) return JSON.parse(JSON.stringify(DEFAULT_USER_DATA));
    // Deep merge đơn giản để đảm bảo các field mới không bị null
    const loaded = JSON.parse(json);
    return {
      ...DEFAULT_USER_DATA,
      ...loaded,
      quests: { ...DEFAULT_USER_DATA.quests, ...loaded.quests },
      cardOverrides: loaded.cardOverrides || {},
    };
  }

  save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.data));
  }

  // --- DATA MANAGEMENT ---
  getCardOverride(cardId) {
    return this.data.cardOverrides[cardId] || null;
  }

  saveCardOverride(cardId, overrideData) {
    if (!this.data.cardOverrides[cardId]) this.data.cardOverrides[cardId] = {};
    this.data.cardOverrides[cardId] = {
      ...this.data.cardOverrides[cardId],
      ...overrideData,
    };
    this.save();
  }

  // Khôi phục thẻ về gốc (Xóa override)
  restoreCard(cardId) {
    if (this.data.cardOverrides[cardId]) {
      delete this.data.cardOverrides[cardId];
      this.save();
    }
  }

  // --- EXISTING LOGIC ---
  checkDailyReset() {
    const now = new Date();
    const effectiveDate = new Date(now);
    if (now.getHours() < 3) effectiveDate.setDate(effectiveDate.getDate() - 1);
    const todayStr = effectiveDate.toISOString().split("T")[0];

    if (this.data.quests.lastReset !== todayStr) {
      this.data.quests = {
        ...DEFAULT_USER_DATA.quests,
        lastReset: todayStr,
      };
      if (this.data.lastLoginDate !== todayStr) {
        const lastDate = this.data.lastLoginDate
          ? new Date(this.data.lastLoginDate)
          : null;
        const diffDays = lastDate
          ? (effectiveDate - lastDate) / (1000 * 3600 * 24)
          : 999;
        if (diffDays >= 1 && diffDays < 2) {
          this.data.streak++;
          this.addCoins(this.data.streak > 5 ? 5 : this.data.streak);
        } else if (diffDays >= 2) {
          this.data.streak = 1;
          this.addCoins(1);
        } else if (this.data.streak === 0) {
          this.data.streak = 1;
          this.addCoins(1);
        }
        this.data.lastLoginDate = todayStr;
      }
      this.save();
    }
  }

  addCoins(amount) {
    this.data.coins += amount;
    this.save();
  }

  addSeeds(amount) {
    if (!this.data.forest) this.data.forest = { seeds: 0, trees: 0 };
    this.data.forest.seeds += amount;
    this.save();
  }

  completePomodoroQuest() {
    if (!this.data.quests.pomo) {
      this.data.quests.pomo = true;
      this.addCoins(1);
    }
    this.save();
  }

  incrementCardCount() {
    this.data.quests.cardsLearnedToday++;
    this.checkQuests();
    this.save();
  }

  checkQuests() {
    const count = this.data.quests.cardsLearnedToday;
    const q = this.data.quests;
    if (count >= 30 && !q.q30) {
      q.q30 = true;
      this.addCoins(1);
    }
    if (count >= 50 && !q.q50) {
      q.q50 = true;
      this.addCoins(1);
    }
    if (count >= 100 && !q.q100) {
      q.q100 = true;
      this.addCoins(1);
    }
  }

  getStreakLevel() {
    const s = this.data.streak;
    if (s <= 1) return 1;
    if (s <= 3) return 2;
    if (s <= 7) return 3;
    if (s <= 14) return 4;
    return 5;
  }

  // --- SYSTEM ---
  resetAllData() {
    localStorage.removeItem(DB_KEY);
    window.location.reload();
  }

  setTheme(theme) {
    this.data.settings = { theme: theme };
    this.save();
  }
}

window.UserDB = new Database();
