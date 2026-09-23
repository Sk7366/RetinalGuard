import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { accessibilityService } from './services/accessibilityService';

// Initialize and apply global accessibility tokens before first mount
accessibilityService.load();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
