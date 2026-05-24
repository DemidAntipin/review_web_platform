import { Suspense, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppRouter } from '@/app/router/app-router';
import { Loader } from '@/shared/ui/loader/Loader';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { Toaster } from 'sonner';

export const App = () => {
    const checkAuth = useAuthStore(state => state.checkAuth);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <Suspense fallback={<Loader />}>
            <Toaster richColors />
            <RouterProvider router={AppRouter} />
        </Suspense>
    );
};