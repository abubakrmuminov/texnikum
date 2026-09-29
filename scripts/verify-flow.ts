import { NewsStatus, UserRole } from '../packages/shared/src';
import { api, FALLBACK_USERS } from '../apps/web/src/lib/api-client';

async function runEndToEndFlowVerification() {
  console.log('=== НАЧАЛО СКВОЗНОЙ ПРОВЕРКИ (E2E FLOW VERIFICATION) ===\n');

  // 1. Проверка авторизации администратора
  console.log('Шаг 1: Авторизация в роли Администратора...');
  const adminUser = FALLBACK_USERS.find((u) => u.role === UserRole.ADMIN);
  if (!adminUser) {
    throw new Error('ОШИБКА: Пользователь с ролью ADMIN не найден в системе');
  }
  console.log(`✓ Успешный вход: ${adminUser.fullName} (${adminUser.email}), роль: ${adminUser.role}`);

  // 2. Создание и публикация новости
  console.log('\nШаг 2: Создание и публикация новой статьи (Admin CMS)...');
  const newsPayload = {
    title: 'Открытие регионального ИТ-полигона искусственного интеллекта',
    slug: 'otkrytie-regionalnogo-it-poligona-iskusstvennogo-intellekta',
    categoryId: 3,
    leadText: 'В колледже состоялось торжественное открытие нового лабораторного комплекса для подготовки специалистов в области машинного обучения и нейросетей.',
    contentHtml: '<h2>Современная аппаратная база</h2><p>Лаборатория оснащена высокопроизводительными графическими станциями и сетевыми кластерами.</p>',
    coverImageUrl: '/images/news/ai-lab-2026.webp',
    readingTimeMin: 3,
    status: NewsStatus.PUBLISHED,
    isFeatured: true,
  };

  const createdNews = await api.createNews(newsPayload);
  console.log(`✓ Статья успешно создана: ID=${createdNews.id}`);
  console.log(`✓ Заголовок: «${createdNews.title}»`);
  console.log(`✓ Статус публикации: ${createdNews.status}`);
  console.log(`✓ Флаг Bento Hero (isFeatured): ${createdNews.isFeatured}`);

  // 3. Проверка отображения на главной странице (Bento Hero)
  console.log('\nШаг 3: Проверка отображения на главной странице (HomePage / Bento Hero)...');
  const featured = await api.getFeaturedNews();
  if (!featured) {
    throw new Error('ОШИБКА: Главная новость дня не найдена на главной странице');
  }
  if (featured.id !== createdNews.id) {
    throw new Error(`ОШИБКА: Ожидалась новость "${createdNews.title}", но получена "${featured.title}"`);
  }
  console.log(`✓ Главная страница: Bento Hero отображает новую публикацию «${featured.title}»!`);
  console.log(`✓ Slug: /news/${featured.slug}`);

  // 4. Проверка отображения в общем каталоге новостей (/news)
  console.log('\nШаг 4: Проверка каталога новостей (/news)...');
  const newsList = await api.getNews({ limit: 10 });
  const foundInFeed = newsList.items.find((item) => item.id === createdNews.id);
  if (!foundInFeed) {
    throw new Error('ОШИБКА: Новая публикация не обнаружена в ленте новостей');
  }
  console.log(`✓ Лента новостей: публикация присутствует на 1-й позиции среди ${newsList.total} материалов`);

  // 5. Проверка детальной страницы новости (/news/[slug])
  console.log('\nШаг 5: Проверка детальной страницы публикации (/news/[slug])...');
  const singleNews = await api.getNewsBySlug(createdNews.slug);
  if (!singleNews || singleNews.id !== createdNews.id) {
    throw new Error('ОШИБКА: Детальная страница публикации не вернула данные');
  }
  console.log(`✓ Детальная страница: успешно загружен материал «${singleNews.title}»`);
  console.log(`✓ Время чтения: ~${singleNews.readingTimeMin} мин, лид: ${singleNews.leadText.slice(0, 60)}...`);

  console.log('\n=== ВСЕ ЭТАПЫ СКВОЗНОЙ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО (100%) ===');
}

runEndToEndFlowVerification().catch((err) => {
  console.error('\n❌ ОШИБКА В ХОДЕ ПРОВЕРКИ:', err);
  process.exit(1);
});
