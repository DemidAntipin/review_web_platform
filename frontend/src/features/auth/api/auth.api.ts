import { $api } from '@/shared/api/client';
import type { TokenResponse, User, RegisterData } from '@/features/auth/model/auth.types';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const authService = {
  async login(username: string, password: string): Promise<TokenResponse> {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await $api.post(ENDPOINTS.AUTH.LOGIN, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await $api.get<User>(ENDPOINTS.AUTH.ME);
    return response.data;
  },

  async register(data: RegisterData): Promise<User> {
    const response = await $api.post<User>(ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  }
};