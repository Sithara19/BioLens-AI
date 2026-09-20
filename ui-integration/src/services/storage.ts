import { UserProfile, ScreeningHistoryItem, ScreeningResult } from '../types';

const STORAGE_KEYS = {
  USER: 'biolens_user',
  TOKEN: 'biolens_token',
  HISTORY: 'biolens_history',
  CURRENT_RESULT: 'biolens_latest_result',
};

const DEFAULT_USER: UserProfile = {
  name: 'Alex Chen',
  email: 'alex.chen@healthlab.org',
  age: 28,
  gender: 'Non-binary / Prefer not to specify',
};

export const storage = {
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return DEFAULT_USER;
  },

  setUser(user: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {
      // ignore
    }
  },

  getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch {
      return null;
    }
  },

  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      } else {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    } catch {
      // ignore
    }
  },

  getHistory(): ScreeningHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return [];
  },

  addHistory(result: ScreeningResult): void {
    try {
      const history = storage.getHistory();
      const newItem: ScreeningHistoryItem = {
        sessionId: result.sessionId,
        date: new Date(result.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: 'Completed',
        imageCount: 3,
        result,
      };
      // Keep most recent first, max 20
      const updated = [newItem, ...history.filter(h => h.sessionId !== result.sessionId)].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.CURRENT_RESULT, JSON.stringify(result));
    } catch {
      // ignore
    }
  },

  getLatestResult(): ScreeningResult | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_RESULT);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return null;
  },

  setLatestResult(result: ScreeningResult): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_RESULT, JSON.stringify(result));
    } catch {
      // ignore
    }
  },
};
