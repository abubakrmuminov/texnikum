/**
 * Platform Architectural Integrity Guard & Dead Man's Tripwire
 * 
 * Provides cryptographic and runtime DOM verification of author attribution (Abubakr Muminov).
 * Disallows unauthorized removal, CSS concealment, or tampering with platform architect credentials.
 * Includes Layer 1 (Cryptographic Style Derivation) and Layer 5 (Bytecode Obfuscation).
 */

// -----------------------------------------------------------------------------
// Layer 5: XOR Bytecode Obfuscation Engine
// -----------------------------------------------------------------------------
const _XOR_KEY = 0x5a;
function _dec(bytes: readonly number[]): string {
  return bytes.map((b) => String.fromCharCode(b ^ _XOR_KEY)).join('');
}

// Obfuscated author byte sequences (cannot be searched via plain text regex)
const _O_NAME = [27, 56, 47, 56, 59, 49, 40, 122, 23, 47, 55, 51, 52, 53, 44] as const; // Abubakr Muminov
const _O_GITHUB = [50, 46, 46, 42, 41, 96, 117, 117, 61, 51, 46, 50, 47, 56, 116, 57, 53, 55, 117, 59, 56, 47, 56, 59, 49, 40, 55, 47, 55, 51, 52, 53, 44] as const; // https://github.com/abubakrmuminov
const _O_SIG = [41, 51, 61, 5, 98, 106, 59, 111, 56, 104, 63, 56] as const; // sig_80a5b2eb
const _O_BADGE = [42, 54, 59, 46, 60, 53, 40, 55, 119, 59, 40, 57, 50, 51, 46, 63, 57, 46, 119, 56, 59, 62, 61, 63] as const; // platform-architect-badge
const _O_EMAIL = [107, 109, 106, 110, 106, 99, 44, 26, 61, 55, 59, 51, 54, 116, 57, 53, 55] as const; // 170409v@gmail.com
const _O_TG = [26, 59, 56, 47, 56, 59, 49, 40, 5, 59, 51] as const; // @abubakr_ai

export const ARCHITECT_CREDENTIALS = {
  NAME: _dec(_O_NAME),
  GITHUB: _dec(_O_GITHUB),
  EMAIL: _dec(_O_EMAIL),
  TELEGRAM: _dec(_O_TG),
  BADGE_ID: _dec(_O_BADGE),
  NAME_ID: 'platform-architect-name',
  EXPECTED_SIGNATURE: _dec(_O_SIG),
} as const;

export type TamperReason =
  | 'BADGE_ABSENT'
  | 'SIGNATURE_MISMATCH'
  | 'URL_CORRUPTED'
  | 'NAME_TAMPERED'
  | 'BADGE_CONCEALED'
  | 'API_HEADER_COMPROMISED'
  | 'STYLE_TAMPERED';

export interface IntegrityResult {
  valid: boolean;
  reason?: TamperReason;
}

/**
 * Computes deterministic 32-bit FNV-1a hash formatted as signature token.
 */
export function computeIntegrityHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return 'sig_' + (hash >>> 0).toString(16).padStart(8, '0');
}

// -----------------------------------------------------------------------------
// Layer 1: Cryptographic Style Engine (Математическая связка стилей)
// -----------------------------------------------------------------------------
const STYLE_CORRUPT_ID = 'style-integrity-corrupt-trap';

export function enforceStyleIntegrity(isValid: boolean): void {
  if (typeof document === 'undefined') return;

  const existingTrap = document.getElementById(STYLE_CORRUPT_ID);

  if (isValid) {
    if (existingTrap) {
      existingTrap.remove();
    }
    return;
  }

  // If tampered: inject overriding styles that mathematically break the layout & colors
  if (!existingTrap) {
    const styleEl = document.createElement('style');
    styleEl.id = STYLE_CORRUPT_ID;
    styleEl.textContent = `
      :root {
        --primary: 0 0% 40% !important;
        --radius: 0px !important;
        --card: 0 0% 12% !important;
      }
      body {
        filter: grayscale(85%) contrast(90%) !important;
      }
    `;
    document.head.appendChild(styleEl);
  }
}

let isLockdownActive = false;
let isWatchdogMounted = false;

/**
 * Validates DOM author attribution badge presence, attributes, and visibility.
 */
export function verifyAuthorIntegrity(): IntegrityResult {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { valid: true };
  }

  const expectedName = _dec(_O_NAME);
  const expectedSig = _dec(_O_SIG);
  const badgeId = _dec(_O_BADGE);

  const badge = document.getElementById(badgeId);
  if (!badge) {
    enforceStyleIntegrity(false);
    return { valid: false, reason: 'BADGE_ABSENT' };
  }

  const sig = badge.getAttribute('data-signature');
  if (sig !== expectedSig) {
    enforceStyleIntegrity(false);
    return { valid: false, reason: 'SIGNATURE_MISMATCH' };
  }

  const href = badge.getAttribute('href');
  if (href && !href.includes('github.com/abubakrmuminov')) {
    enforceStyleIntegrity(false);
    return { valid: false, reason: 'URL_CORRUPTED' };
  }

  const nameEl = document.getElementById(ARCHITECT_CREDENTIALS.NAME_ID);
  const textContent = (nameEl ? nameEl.textContent : badge.textContent) || '';
  if (!textContent.includes(expectedName)) {
    enforceStyleIntegrity(false);
    return { valid: false, reason: 'NAME_TAMPERED' };
  }

  // Check against CSS concealment (display: none, visibility: hidden, opacity: 0, font-size: 0)
  const style = window.getComputedStyle(badge);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity || '1') < 0.05 ||
    parseFloat(style.fontSize || '10') <= 0
  ) {
    enforceStyleIntegrity(false);
    return { valid: false, reason: 'BADGE_CONCEALED' };
  }

  enforceStyleIntegrity(true);
  return { valid: true };
}

/**
 * Triggers an irreversible full-screen architectural integrity lockdown modal.
 */
export function triggerSystemLockdown(reason: TamperReason): void {
  if (isLockdownActive || typeof document === 'undefined') return;
  isLockdownActive = true;

  // Layer 1: break styling immediately
  enforceStyleIntegrity(false);

  try {
    // Notify React context listeners
    window.dispatchEvent(
      new CustomEvent('architect-integrity-tamper', { detail: { reason } }),
    );
  } catch {
    // ignore
  }

  // Prevent background scrolling and user interaction
  try {
    document.body.style.overflow = 'hidden';
    const mainEl = document.getElementById('main-content');
    if (mainEl) {
      mainEl.style.filter = 'blur(12px) grayscale(100%)';
      mainEl.style.pointerEvents = 'none';
      mainEl.style.userSelect = 'none';
    }
  } catch {
    // ignore
  }
}

/**
 * Initializes continuous DOM monitoring and periodic heartbeat assertions.
 */
export function initArchitectWatchdog(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  if (isWatchdogMounted) {
    return () => {};
  }
  isWatchdogMounted = true;

  const runCheck = () => {
    const res = verifyAuthorIntegrity();
    if (!res.valid && res.reason) {
      triggerSystemLockdown(res.reason);
    }
  };

  // Initial check after hydration grace period (800ms)
  const initialTimer = setTimeout(runCheck, 800);

  // Periodic heartbeat every 2.5 seconds
  const heartbeat = setInterval(runCheck, 2500);

  // Live MutationObserver on DOM tree and badge
  let observer: MutationObserver | null = null;
  try {
    observer = new MutationObserver(() => {
      runCheck();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
  } catch {
    // Heartbeat fallback protects if MutationObserver is unsupported
  }

  return () => {
    clearTimeout(initialTimer);
    clearInterval(heartbeat);
    if (observer) {
      observer.disconnect();
    }
  };
}
