'use client';

import * as React from 'react';
import { NewsForm } from '@/components/admin/news-form';
import { apiClient } from '@/lib/api-client';
import { NewsCategory } from '@college/shared';

export default function NewNewsArticlePage() {
  const [categories, setCategories] = React.useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await apiClient.getNewsCategories();
        setCategories(cats);
      } catch {
        setCategories([
          { id: 1, name: 'События', slug: 'events', colorBadge: '#2563eb', createdAt: '' },
          { id: 2, name: 'Образование', slug: 'education', colorBadge: '#16a34a', createdAt: '' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadCategories();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Загрузка формы публикации...</div>;
  }

  return <NewsForm categories={categories} isEditing={false} />;
}
