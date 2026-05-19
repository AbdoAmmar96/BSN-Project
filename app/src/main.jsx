import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { initSentry } from './lib/sentry';
import './lib/i18n';
import './styles/index.css';

// Fire-and-forget Sentry init — no-op if package missing or DSN not set.
initSentry();

// Register the service worker only in production builds — dev needs HMR to work uninterrupted.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 600,
                borderRadius: '12px',
                border: '2px solid #0F0830',
                boxShadow: '4px 4px 0 #0F0830',
              },
              success: { iconTheme: { primary: '#65C8D0', secondary: '#0F0830' } },
              error: { iconTheme: { primary: '#F15A24', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
