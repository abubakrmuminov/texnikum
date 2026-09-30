'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminScheduleRedirect(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/administration');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-muted-foreground">
      Yuklanmoqda... / Перенаправление в раздел «Rahbariyat va maʼmuriyat»...
    </div>
  );
}
