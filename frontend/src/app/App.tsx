import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppRouter } from '@/app/router/app-router';
import { Loader } from '@/shared/ui/loader/Loader';

export const App = () => {
    return (
        <Suspense fallback={<Loader />}>
            <RouterProvider router={AppRouter} />
        </Suspense>
    );
};