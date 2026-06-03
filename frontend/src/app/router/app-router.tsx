import { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/pages/layout/MainLayout';
import { HomePage } from '@/pages/home/HomePage';
import { LoginPage } from '@/pages/login/LoginPage';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { KanbanPage } from '@/pages/kanban/KanbanPage';
import { ReviewersPage } from '@/pages/reviewers/ReviewerPage';
import { LogsPage } from '@/pages/logs/LogsPage';
import { ResponsePage } from '@/pages/responses/ResponsePage';

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
        path: '/register',
        element: <LoginPage />,
    },
    {
        path: '/',
        element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
        children: [
            {
                index: true, 
                element: <Navigate to="projects" replace />,
            },
            {
                path: 'projects',
                children: [
                    { index: true, element: <HomePage /> },
                    {
                        path: ':projectId',
                        children: [
                            { index: true, element: <Navigate to="reviewers" replace /> },
                            { path: 'kanban', element: <KanbanPage /> },
                            { path: 'reviewers', element: <ReviewersPage />},
                            { path: 'responses', element: <ResponsePage />},
                        ]
                    }
                ]
            },
            {
                path: 'logs',
                element: <LogsPage />
            }
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);