import { $api } from '@/shared/api/client';
import type { TokenResponse, User } from '@/features/auth/model/auth.types';

export const authService = {
  async login(username: string, password: string): Promise<TokenResponse> {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await $api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await $api.get<User>('/auth/me');
    return response.data;
  }
};