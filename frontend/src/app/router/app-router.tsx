import { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/pages/layout/MainLayout';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/login/LoginPage';
import { useAuthStore } from '@/features/auth/model/auth.store';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const token = useAuthStore((state) => state.token);
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export const AppRouter = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <MainLayout />
            </ProtectedRoute>
        ),
        errorElement: <div>Что-то пошло не так...</div>, 
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'projects',
                element: <div>Страница со списком научных работ (В разработке)</div>,
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);