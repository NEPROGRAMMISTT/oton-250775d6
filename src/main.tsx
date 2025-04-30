
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Регистрация ServiceWorker для обеспечения офлайн-функциональности
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
