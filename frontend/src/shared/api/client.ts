import axios from 'axios';
import { useAuthStore } from '@/features/auth/model/auth.store';

export const $api = axios.create({
    baseURL: '/api', 
    headers: {
        'Content-Type': 'application/json',
    }
});

$api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

$api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._isRetry && !originalRequest.url?.includes('/auth/login')) {
            originalRequest._isRetry = true;
            
            useAuthStore.getState().logout();
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);