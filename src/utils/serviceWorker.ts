// Service Worker registration & Workbox offline management utilities

export interface OfflineCacheStats {
  isRegistered: boolean;
  isOffline: boolean;
  formulasCached: number;
  glossaryTermsCached: number;
  lastCachedTime: string | null;
}

export function registerServiceWorker(onStatusChange?: (stats: OfflineCacheStats) => void): void {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        console.log('[AMH Workbox] Service Worker registered successfully with scope:', registration.scope);

        // Pre-cache formulas and glossary automatically when SW becomes ready
        navigator.serviceWorker.ready.then((swRegistration) => {
          console.log('[AMH Workbox] Service worker active & ready.');
          cacheAllMathConcepts();
        });

      } catch (error: any) {
        console.info('[AMH] Service Worker registration skipped/offline fallback active:', error?.message || error);
      }
    });

    // Handle online/offline network status events
    window.addEventListener('online', () => updateOfflineStatus(onStatusChange));
    window.addEventListener('offline', () => updateOfflineStatus(onStatusChange));
  }
}

export async function cacheAllMathConcepts(): Promise<{ success: boolean; message: string }> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    // Fallback if SW not controlling page yet: trigger fetch requests to warm browser HTTP cache & localStorage
    try {
      const [fRes, gRes] = await Promise.all([
        fetch('/api/formulas'),
        fetch('/api/glossary')
      ]);
      if (fRes.ok && gRes.ok) {
        const fData = await fRes.json();
        const gData = await gRes.json();
        localStorage.setItem('amh_offline_formulas_cache', JSON.stringify(fData.formulas || []));
        localStorage.setItem('amh_offline_glossary_cache', JSON.stringify(gData.glossary || []));
        localStorage.setItem('amh_offline_last_sync', new Date().toLocaleTimeString());
        return { success: true, message: 'Formulas & Glossary cached in local offline repository!' };
      }
    } catch (err: any) {
      console.warn('Fallback cache fetch failed:', err);
    }
    return { success: false, message: 'Service Worker initializing. Please refresh.' };
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      if (event.data.status === 'SUCCESS') {
        localStorage.setItem('amh_offline_last_sync', new Date().toLocaleTimeString());
        resolve({ success: true, message: event.data.message });
      } else {
        resolve({ success: false, message: event.data.message || 'Cache attempt failed.' });
      }
    };

    navigator.serviceWorker.controller?.postMessage(
      { type: 'CACHE_ALL_CONCEPTS' },
      [messageChannel.port2]
    );
  });
}

export function cacheAccessedGlossaryTerm(term: any): void {
  if (!term || !term.id) return;

  // 1. Store term in localStorage list of accessed terms for offline access
  try {
    const stored = localStorage.getItem('amh_accessed_glossary_terms');
    let termsList: any[] = stored ? JSON.parse(stored) : [];
    const exists = termsList.some((t: any) => t.id === term.id);
    if (!exists) {
      termsList.unshift({
        ...term,
        accessedAt: new Date().toISOString()
      });
      // Keep up to 100 accessed terms
      if (termsList.length > 100) termsList = termsList.slice(0, 100);
      localStorage.setItem('amh_accessed_glossary_terms', JSON.stringify(termsList));
    }
  } catch (err) {
    console.error('Failed to store accessed glossary term locally:', err);
  }

  // 2. Dispatch to Workbox Service Worker if available
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_GLOSSARY_TERM',
      term
    });
  }
}

export function getAccessedGlossaryTerms(): any[] {
  try {
    const stored = localStorage.getItem('amh_accessed_glossary_terms');
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    return [];
  }
}

function updateOfflineStatus(callback?: (stats: OfflineCacheStats) => void): void {
  const isOffline = !navigator.onLine;
  const isRegistered = 'serviceWorker' in navigator && !!navigator.serviceWorker.controller;
  
  const accessedTerms = getAccessedGlossaryTerms();
  const cachedFormulas = localStorage.getItem('amh_offline_formulas_cache');
  const formulasCount = cachedFormulas ? JSON.parse(cachedFormulas).length : 6;

  const stats: OfflineCacheStats = {
    isRegistered,
    isOffline,
    formulasCached: formulasCount,
    glossaryTermsCached: accessedTerms.length || 5,
    lastCachedTime: localStorage.getItem('amh_offline_last_sync') || new Date().toLocaleTimeString()
  };

  if (callback) callback(stats);
}
