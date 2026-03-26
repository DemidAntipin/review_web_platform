import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User as UserDTO, RegisterData } from './auth.types';
import { authService } from '../api/auth.api';
import { ROLE_MAP } from '@/shared/config/roles';
import type { User } from '@/entities/user/model/types';
import { WebsocketService } from '@/shared/api/websocket';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
          const token = data.access_token;
          set({ token });
          
          await get().checkAuth();
        } catch (e) {
          get().logout();
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      checkAuth: async () => {
        const currentToken = get().token;
        if (!currentToken) return;
        
        try {
          const serverUser: UserDTO = await authService.getProfile();
          const { role: serverRole, ...rest } = serverUser;
          
          const transformedUser: User = {
            ...rest,
            role: ROLE_MAP[serverRole as keyof typeof ROLE_MAP] || 'Гость'
          };
          set({ user: transformedUser });
          WebsocketService.connect(transformedUser.id, currentToken);

        } catch (e) {
          get().logout();
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          await authService.register(data);
          await get().login(data.username, data.password);
        } catch (e) {
          throw e;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null });
        WebsocketService.disconnect(); 
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user 
      }),
    }
  )
);