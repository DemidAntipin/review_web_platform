export type Theme = 'light' | 'dark';

interface AppData {
  theme: Theme;
}

const STORAGE_KEY = 'review_platform_settings';

const getDefault = (): AppData => ({
  theme: 'light',
});

export const storage = {
  getData: (): AppData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : getDefault();
    } catch {
      return getDefault();
    }
  },
  getItem: <K extends keyof AppData>(key: K): AppData[K] => {
    return storage.getData()[key] ?? getDefault()[key];
  },
  setItem: <K extends keyof AppData>(key: K, value: AppData[K]): void => {
    const data = storage.getData();
    const updated = { ...data, [key]: value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
};