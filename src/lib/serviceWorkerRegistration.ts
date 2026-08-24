export interface SWRegistrationStatus {
  registered: boolean;
  active: boolean;
  offlineReady: boolean;
}

let swRegistration: ServiceWorkerRegistration | null = null;

export function registerServiceWorker(onSuccess?: () => void) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Register on window load
  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          swRegistration = reg;
          if (reg.active && onSuccess) {
            onSuccess();
          }

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.info('[AMH] New offline cache content available.');
                }
              };
            }
          };
        })
        .catch((err) => {
          // Graceful fallback if ServiceWorker cannot be registered in certain sandbox iframe environments
          console.info('[AMH] ServiceWorker offline mode using in-memory / local storage fallbacks.');
        });
    } catch (e) {
      // Ignore registration exceptions in restricted sandboxes
    }
  });
}

/**
 * Send formulas to ServiceWorker Cache for offline availability
 */
export async function cacheFormulasOffline(formulas: any[]): Promise<boolean> {
  // Always update local cache as immediate reliable fallback
  try {
    localStorage.setItem('amh_offline_formulas_cache', JSON.stringify(formulas));
  } catch (e) {}

  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return true;
  }

  return new Promise((resolve) => {
    try {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data?.success ?? true);
      };

      navigator.serviceWorker.controller?.postMessage(
        {
          type: 'CACHE_FORMULAS',
          payload: formulas,
        },
        [messageChannel.port2]
      );

      setTimeout(() => resolve(true), 800);
    } catch (e) {
      resolve(true);
    }
  });
}

/**
 * Send glossary terms to ServiceWorker Cache for offline availability
 */
export async function cacheGlossaryOffline(terms: any[]): Promise<boolean> {
  try {
    localStorage.setItem('amh_offline_glossary_cache', JSON.stringify(terms));
  } catch (e) {}

  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return true;
  }

  return new Promise((resolve) => {
    try {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data?.success ?? true);
      };

      navigator.serviceWorker.controller?.postMessage(
        {
          type: 'CACHE_GLOSSARY',
          payload: terms,
        },
        [messageChannel.port2]
      );

      setTimeout(() => resolve(true), 800);
    } catch (e) {
      resolve(true);
    }
  });
}

/**
 * Custom Hook to detect Online/Offline network state in React components
 */
export { useOfflineStatus } from '../hooks/useOfflineStatus';
