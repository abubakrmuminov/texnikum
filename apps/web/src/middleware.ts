import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface SetupStatusCache {
  configured: boolean;
  timestamp: number;
}

let cachedStatus: SetupStatusCache | null = null;
const CACHE_TTL_MS = 1000; // Кратковременный кэш 1 секунда

async function checkIsConfigured(apiUrl: string): Promise<boolean> {
  const now = Date.now();
  if (cachedStatus && now - cachedStatus.timestamp < CACHE_TTL_MS) {
    return cachedStatus.configured;
  }

  try {
    const res = await fetch(`${apiUrl}/setup/status`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(1200),
    });

    // Если 404: эндпоинт /setup опечатан навсегда — система настроена
    if (res.status === 404) {
      cachedStatus = { configured: true, timestamp: now };
      return true;
    }

    if (res.ok) {
      const data = (await res.json()) as { configured?: boolean };
      const isConfigured = Boolean(data?.configured);
      cachedStatus = { configured: isConfigured, timestamp: now };
      return isConfigured;
    }

    return true;
  } catch {
    // При недоступности бэкенда (например, во время автономной сборки SSG)
    // не блокируем работу сайта
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем статические файлы, картинки, служебные пути Next.js и внутренние /api маршруты
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/docs') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';

  const isConfigured = await checkIsConfigured(apiUrl);

  // 1. Если система еще НЕ настроена: перенаправляем на /setup
  if (!isConfigured) {
    if (pathname !== '/setup') {
      return NextResponse.redirect(new URL('/setup', request.url));
    }
    return NextResponse.next();
  }

  // 2. Если система УЖЕ настроена: маршрут /setup навсегда возвращает 404 Not Found
  if (isConfigured && pathname === '/setup') {
    return NextResponse.rewrite(new URL('/not-found', request.url), {
      status: 404,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|docs|.*\\..*).*)',
  ],
};
