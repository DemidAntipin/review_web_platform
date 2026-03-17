import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from './auth.types';
import { authService } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void; 
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const data = await authService.login(username, password);
          
          set({ token: data.access_token });

          const userProfile = await authService.getProfile();
          set({ user: userProfile });
          
        } catch (e) {
          get().logout();
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);