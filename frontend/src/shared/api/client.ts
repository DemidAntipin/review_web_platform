import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { toast } from 'sonner';

declare module 'axios' {
    export interface AxiosRequestConfig {
        allowedErrors?: number[];
        disableToast?: boolean;
    }
    export interface InternalAxiosRequestConfig {
        allowedErrors?: number[];
        disableToast?: boolean;
        _isRetry?: boolean;
    }
}

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
    (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
        const status = error.response?.status;

        if (status === 401 && originalRequest && !originalRequest._isRetry && !originalRequest.url?.includes('/auth/login')) {
            originalRequest._isRetry = true;
            useAuthStore.getState().logout();
            
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
        
        if (originalRequest?.disableToast || (status && originalRequest?.allowedErrors?.includes(status))) {
            return Promise.reject(error);
        }

        let errorMessage = 'Произошла непредвиденная ошибка';
        let errorDescription: string | undefined = undefined;

        if (error.response) {
            const data = error.response.data as any;
            
            if (data && typeof data.detail === 'string') {
                errorMessage = data.detail;
            } else if (data && Array.isArray(data.detail)) {
                errorMessage = 'Ошибка валидации данных';
                errorDescription = data.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join('\n');
            } else {
                errorMessage = `Ошибка сервера (${status})`;
            }
        } else {
            errorMessage = error.message;
        }

        toast.error(errorMessage, {
            description: errorDescription,
            duration: 3000,
        });

        return Promise.reject(error);
    }
);