'use client';

import { useEffect, useRef } from 'react';
import { initArchitectWatchdog } from '@/lib/integrity-guard';

const BANNER = String.raw`
    _     _            ____         _          
   / \   | |__   _   _ | __ )   __ _ | | __ _ __ 
  / _ \  | '_ \ | | | ||  _ \  / _' || |/ /| '__|
 / ___ \ | |_) || |_| || |_) || (_| ||   < | |   
/_/   \_\|_.__/  \__,_||____/  \__,_||_|\_\|_|   

╔══════════════════════════════════════════════════════════════════╗
║  ✦  System Architect & Full-Stack Platform Engineer              ║
╠══════════════════════════════════════════════════════════════════╣
║  ✉  Email:     170409v@gmail.com                                 ║
║  ✈  Telegram:  @abubakr_ai                                       ║
║  ⌥  GitHub:    github.com/abubakrmuminov                         ║
║  ☎  Phone:     +998 93 843 81 61                                ║
║  🏛  Project:   Fargʻona 2-son texnikumi Taʼlim Portali           ║
║  🛡  Security:  Supabase RLS • JWT • WCAG 2.1 AA • OʻRQ-637       ║
╚══════════════════════════════════════════════════════════════════╝

        Salom! Konsolni ochdingizmi? Demak, bir toʻlqindamiz 😉
        Привет! Заглянул в консоль? Значит, мы поладим 🚀
`;

const BANNER_STYLE = [
  'color: #00f0ff;',
  'font-family: ui-monospace, Menlo, Monaco, "Cascadia Mono", monospace;',
  'font-size: 11px;',
  'font-weight: 700;',
  'line-height: 1.25;',
  'text-shadow: 0 0 8px rgba(0, 240, 255, 0.45);',
].join(' ');

const BADGE_ARCHITECT_STYLE = [
  'background: #0d1117;',
  'color: #58a6ff;',
  'padding: 3px 8px;',
  'border-radius: 4px 0 0 4px;',
  'font-weight: bold;',
  'font-size: 11px;',
  'border: 1px solid #30363d;',
].join(' ');

const BADGE_NAME_STYLE = [
  'background: #1f6feb;',
  'color: #ffffff;',
  'padding: 3px 8px;',
  'border-radius: 0 4px 4px 0;',
  'font-weight: bold;',
  'font-size: 11px;',
  'border: 1px solid #1f6feb;',
].join(' ');

/**
 * Isolated client component mounting the cyber neon DevTools ASCII banner.
 * Uses an idempotency ref guard to guarantee single invocation without hydration mismatches.
 */
export function ArchitectSignature(): null {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    try {
      console.log(
        '%c ARCHITECT %c Abubakr Muminov ',
        BADGE_ARCHITECT_STYLE,
        BADGE_NAME_STYLE,
      );
      console.log(`%c${BANNER}`, BANNER_STYLE);
    } catch {
      // Safe noop in non-standard runtimes
    }

    return initArchitectWatchdog();
  }, []);

  return null;
}
