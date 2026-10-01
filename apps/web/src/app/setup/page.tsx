import { notFound } from 'next/navigation';
import { SetupWizard } from '@/components/setup/setup-wizard';

export const metadata = {
  title: 'Dastlabki sozlash ustasi | Setup Wizard',
  description: 'Taʼlim muassasasi portali va boshqaruv tizimini birinchi marta ishga tushirish',
};

export const dynamic = 'force-dynamic';

async function checkConfigured(): Promise<boolean> {
  const apiUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000/api/v1';

  try {
    const res = await fetch(`${apiUrl}/setup/status`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(1500),
    });
    if (res.status === 404) return true;
    if (res.ok) {
      const json = await res.json();
      return Boolean(json?.configured);
    }
    return false;
  } catch {
    return false;
  }
}

export default async function SetupPage(): Promise<JSX.Element> {
  const isConfigured = await checkConfigured();

  if (isConfigured) {
    notFound();
  }

  return <SetupWizard />;
}
