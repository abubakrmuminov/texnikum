'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Lock,
  Mail,
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function LoginFormContent(): JSX.Element {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      router.push(redirectUrl);
    } else {
      setError(
        result.error ||
          (isUz ? 'Kirishda xatolik yuz berdi' : 'Ошибка входа')
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 bg-muted/20">
      <div className="w-full max-w-md space-y-4">
        {/* Кнопка возврата на сайт */}
        <div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 pl-0 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>{isUz ? 'Bosh sahifaga qaytish' : 'На главную страницу'}</span>
            </Button>
          </Link>
        </div>

        <Card className="border border-border shadow-md">
          <CardHeader className="space-y-2 text-center pb-4">
            <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow font-black text-base">
              CMS
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">
              {isUz ? 'Boshqaruv paneli (CMS)' : 'Панель управления (CMS)'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isUz
                ? 'Fargʻona 2-son politexnika texnikumi • Tizimga kirish'
                : 'Ферганский политехнический техникум №2 • Авторизация'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-start gap-2"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  {isUz ? 'Elektron pochta (Email)' : 'Электронная почта (Email)'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@texnikum2.uz"
                    className="pl-9 text-xs"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold text-foreground mb-1"
                >
                  {isUz ? 'Parol' : 'Пароль'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 text-xs font-mono"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full text-xs font-semibold h-10 shadow cursor-pointer"
              >
                {loading
                  ? (isUz ? 'Tekshirilmoqda...' : 'Проверка...')
                  : (isUz ? 'Tizimga kirish' : 'Войти в систему')}
              </Button>
            </form>

            <div className="text-[11px] text-muted-foreground text-center pt-2 border-t border-border/50">
              {isUz
                ? 'Xizmatdan faqat roʻyxatdan oʻtgan maʼmurlar va tahrirchilar foydalanishi mumkin.'
                : 'Доступ разрешен только зарегистрированным администраторам и редакторам.'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-12 px-4 bg-muted/20">
          <div className="text-sm text-muted-foreground">Загрузка формы авторизации...</div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

