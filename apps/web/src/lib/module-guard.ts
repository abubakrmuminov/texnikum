import { notFound } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { NavigationItem } from '@college/shared';

function findVisiblePath(items: NavigationItem[], targetPath: string): boolean {
  for (const item of items) {
    // Exact match or base prefix match (e.g. /info for /info/*)
    if (item.path === targetPath && item.isVisible && !item.deletedAt) {
      return true;
    }
    if (item.children && findVisiblePath(item.children, targetPath)) {
      return true;
    }
  }
  return false;
}

/**
 * Asserts that a built-in module or section is active in navigation.
 * If switched off by admin, triggers Next.js notFound() (HTTP 404).
 */
export async function assertModuleEnabled(modulePath: string): Promise<void> {
  try {
    const navItems = await apiClient.getPublicNavigation();
    if (navItems && navItems.length > 0) {
      const isEnabled = findVisiblePath(navItems, modulePath);
      if (!isEnabled) {
        notFound();
      }
    }
  } catch {
    // Fallback: don't block SSR if backend is temporarily unreachable
  }
}
