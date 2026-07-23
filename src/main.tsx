import { StrictMode, useState } from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import './index.css';

function Root() {
  const [appKey, setAppKey] = useState(0);

  return (
    <AppErrorBoundary onRetry={() => setAppKey((currentKey) => currentKey + 1)}>
      <App key={appKey} />
    </AppErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
