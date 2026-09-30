'use client';

import * as React from 'react';
import { NewsForm } from '@/components/admin/news-form';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { apiClient } from '@/lib/api-client';
import { NewsCategory } from '@college/shared';

export default function NewNewsArticlePage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const [categories, setCategories] = React.useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await apiClient.getNewsCategories();
        setCategories(cats);
      } catch {
        setCategories([
          { id: 1, name: isUz ? 'Tadbirlar' : 'События', slug: 'events', colorBadge: '#2563eb', createdAt: '' },
          { id: 2, name: isUz ? 'Taʼlim' : 'Образование', slug: 'education', colorBadge: '#16a34a', createdAt: '' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, [isUz]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        {isUz ? 'Nashr shakli yuklanmoqda...' : 'Загрузка формы публикации...'}
      </div>
    );
  }

  return <NewsForm categories={categories} isEditing={false} />;
}
