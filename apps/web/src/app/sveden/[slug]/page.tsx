import { redirect } from 'next/navigation';

interface SvedenPageProps {
  params: {
    slug: string;
  };
}

const SVEDEN_TO_INFO_MAP: Record<string, string> = {
  common: 'info-common',
  struct: 'info-struct',
  document: 'info-documents',
  'accessible-env': 'info-environment',
  objects: 'info-material',
  'paid-edu': 'info-grants',
  financial: 'info-financial',
  vacant: 'info-vacant',
  international: 'info-international',
  employment: 'info-employment',
  catering: 'info-common',
  safety: 'info-common',
};

export async function generateStaticParams() {
  return Object.keys(SVEDEN_TO_INFO_MAP).map((slug) => ({ slug }));
}

export default function SvedenRedirectPage({ params }: SvedenPageProps): never {
  const targetSlug = SVEDEN_TO_INFO_MAP[params.slug] || `info-${params.slug}`;
  redirect(`/info/${targetSlug}`);
}
