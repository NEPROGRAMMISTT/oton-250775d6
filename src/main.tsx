
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { dictionaryService } from './services/dictionaryService.ts'

// Регистрация ServiceWorker для обеспечения офлайн-функциональности
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registered successfully:', registration.scope);
        
        // Initialize dictionaries on app start
        dictionaryService.initializeDefaultDictionaries()
          .then(() => {
            console.info('Dictionaries initialized successfully');
          })
          .catch(error => {
            console.error('Error initializing dictionaries:', error);
          });
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error);
      });
      
    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_LIMIT_EXCEEDED') {
        console.warn('Cache limit exceeded:', event.data.payload);
        // Could show a notification here
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
