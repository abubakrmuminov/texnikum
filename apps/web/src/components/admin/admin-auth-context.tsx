'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, UserRole } from '@college/shared';
import { FALLBACK_USERS, recordLocalAudit } from '@/lib/api-client';

interface AdminAuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (requiredRoles: UserRole | UserRole[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'college_admin_session';

export function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Восстановление сессии при монтировании
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { user: UserProfile; token: string };
        if (parsed.user && parsed.token) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch {
      // Игнорируем ошибки доступа к localStorage
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Route Guard: проверка прав доступа
  useEffect(() => {
    if (isLoading) return;

    const isAdminPath = pathname.startsWith('/admin');
    const isLoginPath = pathname === '/admin/login';

    if (isAdminPath && !isLoginPath && !user) {
      router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, user, isLoading, router]);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Имитация аутентификации Supabase Auth с поддержкой демо-учетных записей
    await new Promise((resolve) => setTimeout(resolve, 300));

    const validAccounts: Record<string, { pass: string; userIndex: number }> = {
      'admin@texnikum2.uz': { pass: 'admin123', userIndex: 0 },
      'editor@texnikum2.uz': { pass: 'editor123', userIndex: 1 },
      'moderator@texnikum2.uz': { pass: 'moderator123', userIndex: 2 },
    };

    const target = validAccounts[email.trim().toLowerCase()];
    if (target && target.pass === password) {
      const matchedUser = FALLBACK_USERS[target.userIndex]!;
      const sessionToken = `session-${matchedUser.role}-${Date.now()}`;
      setUser(matchedUser);
      setToken(sessionToken);
      try {
        localStorage.setItem(
          ADMIN_STORAGE_KEY,
          JSON.stringify({ user: matchedUser, token: sessionToken }),
        );
      } catch {
        // ignore
      }

      recordLocalAudit('CREATE', 'users', matchedUser.id, {
        actionType: 'login',
        email: matchedUser.email,
        fullName: matchedUser.fullName,
        role: matchedUser.role,
        message: 'Tizimga muvaffaqiyatli kirildi (Login)',
      });

      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: 'Notoʻgʻri email yoki parol. Qayta urinib koʻring / Неверный email или пароль.',
    };
  };

  const logout = () => {
    if (user) {
      recordLocalAudit('DELETE', 'users', user.id, {
        actionType: 'logout',
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        message: 'Tizimdan chiqildi (Logout)',
      });
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    router.push('/admin/login');
  };

  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return allowed.includes(user.role);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
