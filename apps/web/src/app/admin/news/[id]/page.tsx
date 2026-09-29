'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NewsForm } from '@/components/admin/news-form';
import { apiClient } from '@/lib/api-client';
import { NewsItem, NewsCategory } from '@college/shared';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EditNewsArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

  const [newsItem, setNewsItem] = React.useState<NewsItem | null>(null);
  const [categories, setCategories] = React.useState<NewsCategory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [newsResponse, cats] = await Promise.all([
          apiClient.getNews({ limit: 100 }),
          apiClient.getNewsCategories(),
        ]);
        setCategories(cats);

        const found = newsResponse.items.find((n) => n.id === id);
        if (found) {
          setNewsItem(found);
        } else {
          setError('Публикация не найдена в базе данных');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Ошибка при загрузке материала');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground">
        Загрузка данных публикации...
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <p className="text-destructive font-semibold">{error || 'Материал не найден'}</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/news')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Вернуться к новостям
        </Button>
      </div>
    );
  }

  return <NewsForm initialData={newsItem} categories={categories} isEditing={true} />;
}
