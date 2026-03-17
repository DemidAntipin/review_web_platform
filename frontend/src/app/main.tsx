import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { ProviderComposer } from '@/app/providers/ProviderComposer';
import { ThemeProvider } from '@/app/providers/ThemeProvider';
import '@/app/styles/globals.css';
import '@/app/styles/consts.css';
import '@/app/styles/colors.css';

const providers = [
    ThemeProvider,
];

createRoot(document.getElementById('root')!).render(
    <ProviderComposer providers={providers}>
        <App />
    </ProviderComposer>,
);