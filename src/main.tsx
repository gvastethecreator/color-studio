import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import { ToastProvider } from '@/components/ui/toast';
import '@/styles/globals.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

document.documentElement.classList.add('dark');
document.documentElement.style.colorScheme = 'dark';

createRoot(rootElement).render(
  <StrictMode>
    <ToastProvider position="bottom-right">
      <App />
    </ToastProvider>
  </StrictMode>,
);
