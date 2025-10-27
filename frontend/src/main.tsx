import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/components/theme-provider';
import App from './App';
import { ToastContainer, Slide } from 'react-toastify';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { store } from '@/store';

import './globals.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <App />
        <ToastContainer
          position="top-right"
          autoClose={1500}
          hideProgressBar
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="light"
          transition={Slide}
        />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
