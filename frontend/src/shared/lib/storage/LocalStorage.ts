export type Theme = 'light' | 'dark';

interface AppData {
    theme: Theme;
}

const STORAGE_KEY = 'review_platform_settings';

class LocalStorageManager {
    private static instance: LocalStorageManager;

    private constructor() {}

    public static getInstance(): LocalStorageManager {
        if (!LocalStorageManager.instance) {
            LocalStorageManager.instance = new LocalStorageManager();
        }
        return LocalStorageManager.instance;
    }

    private exists(): boolean {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }

    private getDefault(): AppData {
        return {
            theme: 'light',
        };
    }

    public getData(): AppData {
        if (!this.exists()) return this.getDefault();
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        } catch {
            return this.getDefault();
        }
    }

    private saveData(newData: AppData): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    }

    public getItem<K extends keyof AppData>(key: K): AppData[K] {
        const data = this.getData();
        return data[key] ?? this.getDefault()[key];
    }

    public setItem<K extends keyof AppData>(key: K, value: AppData[K]): void {
        const data = this.getData();
        const updatedData = { ...data, [key]: value };
        this.saveData(updatedData);
    }
}

export const storageManager = LocalStorageManager.getInstance();