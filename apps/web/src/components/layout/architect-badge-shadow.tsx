'use client';

import React, { useEffect, useRef } from 'react';
import { ARCHITECT_CREDENTIALS } from '@/lib/integrity-guard';

/**
 * Layer 4: Closed Shadow DOM Shield for Platform Architect Badge
 * Mounts the author attribution within a closed ShadowRoot (mode: 'closed').
 * Protects the element from external CSS querySelectors and global stylesheet overrides.
 */
export function ArchitectBadgeShadow(): JSX.Element {
  const hostRef = useRef<HTMLSpanElement>(null);
  const isAttachedRef = useRef(false);

  useEffect(() => {
    if (!hostRef.current || isAttachedRef.current) return;
    isAttachedRef.current = true;

    try {
      // 1. Create closed shadow root (external scripts cannot access .shadowRoot)
      const shadow = hostRef.current.attachShadow({ mode: 'closed' });

      // 2. Scoped stylesheet isolated from global stylesheet manipulation
      const style = document.createElement('style');
      style.textContent = `
        :host {
          display: inline-flex !important;
          visibility: visible !important;
          opacity: 1 !important;
          font-family: inherit;
        }
        .shadow-badge-link {
          color: inherit;
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          transition: color 0.15s ease;
          outline: none;
        }
        .shadow-badge-link:hover {
          color: hsl(221.2, 83.2%, 53.3%);
        }
        .shadow-architect-name {
          color: inherit;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-color: rgba(37, 99, 235, 0.45);
          text-underline-offset: 2px;
        }
        .shadow-architect-name:hover {
          color: hsl(221.2, 83.2%, 53.3%);
        }
      `;
      shadow.appendChild(style);

      // 3. Isolated attribution link
      const link = document.createElement('a');
      link.id = 'shadow-architect-anchor';
      link.href = ARCHITECT_CREDENTIALS.GITHUB;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'shadow-badge-link';
      link.title = `Platform Architect: ${ARCHITECT_CREDENTIALS.NAME}`;
      link.setAttribute('data-signature', ARCHITECT_CREDENTIALS.EXPECTED_SIGNATURE);
      link.setAttribute('data-architect', ARCHITECT_CREDENTIALS.NAME);
      link.innerHTML = `Platform Architect: <span class="shadow-architect-name">${ARCHITECT_CREDENTIALS.NAME}</span>`;

      shadow.appendChild(link);
    } catch {
      // Fallback
    }
  }, []);

  return (
    <span
      id="platform-architect-badge"
      ref={hostRef}
      data-signature={ARCHITECT_CREDENTIALS.EXPECTED_SIGNATURE}
      data-architect={ARCHITECT_CREDENTIALS.NAME}
      data-shadow-mode="closed"
      className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors font-medium text-[11px]"
    >
      {/* Fallback markup for SSR crawlers & accessibility */}
      <a
        href={ARCHITECT_CREDENTIALS.GITHUB}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-primary transition-colors font-medium focus-visible:ring-1 focus-visible:ring-ring rounded-xs"
        title={`System Architect: ${ARCHITECT_CREDENTIALS.NAME}`}
      >
        Platform Architect:{' '}
        <span
          id="platform-architect-name"
          className="text-foreground hover:text-primary font-semibold underline decoration-primary/40 underline-offset-2"
        >
          {ARCHITECT_CREDENTIALS.NAME}
        </span>
      </a>
    </span>
  );
}
