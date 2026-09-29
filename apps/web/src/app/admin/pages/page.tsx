'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Search,
  Edit2,
  ExternalLink,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { WysiwygEditor } from '@/components/admin/wysiwyg-editor';
import { apiClient } from '@/lib/api-client';
import { PageItem, PageSection } from '@college/shared';

export default function AdminPagesPage() {
  const [pages, setPages] = React.useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sectionFilter, setSectionFilter] = React.useState<string>('all');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPage, setEditingPage] = React.useState<PageItem | null>(null);

  // Form Fields
  const [title, setTitle] = React.useState('');
  const [section, setSection] = React.useState<PageSection>('info');
  const [contentHtml, setContentHtml] = React.useState('');
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [isPublished, setIsPublished] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadPages = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getPages();
      setPages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить разделы сайта');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPages();
  }, [loadPages]);

  const openEditModal = (p: PageItem) => {
    setEditingPage(p);
    setTitle(p.title);
    setSection(p.section);
    setContentHtml(p.contentHtml);
    setMetaTitle(p.metaTitle || '');
    setMetaDescription(p.metaDescription || '');
    setIsPublished(p.isPublished);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    setFormError(null);

    if (!title.trim() || !contentHtml.trim()) {
      setFormError('Sahifa sarlavhasi va matnini toʻldiring');
      return;
    }

    const payload: Partial<PageItem> = {
      title: title.trim(),
      section,
      contentHtml,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      isPublished,
    };

    try {
      await apiClient.updatePage(editingPage.id, payload);
      setPages((prev) =>
        prev.map((item) =>
          item.id === editingPage.id ? ({ ...item, ...payload } as PageItem) : item
        )
      );
      setSuccess(`«${title}» sahifasi muvaffaqiyatli saqlandi`);
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Sahifani saqlashda xatolik yuz berdi');
    }
  };

  const handleTogglePublish = async (p: PageItem) => {
    try {
      const nextStatus = !p.isPublished;
      await apiClient.updatePage(p.id, { isPublished: nextStatus });
      setPages((prev) =>
        prev.map((item) =>
          item.id === p.id ? { ...item, isPublished: nextStatus } : item
        )
      );
    } catch {
      alert('Sahifa nashr holatini oʻzgartirib boʻlmadi');
    }
  };

  const filteredPages = React.useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection =
        sectionFilter === 'all' || p.section === sectionFilter;
      return matchesSearch && matchesSection;
    });
  }, [pages, searchQuery, sectionFilter]);

  const getSectionBadge = (sec: PageSection) => {
    switch (sec) {
      case 'info':
        return <Badge variant="outline" className="text-primary border-primary/20">Rasmiy maʼlumot (OʻRQ-637)</Badge>;
      case 'sveden':
        return <Badge variant="outline" className="text-primary border-primary/20">Rasmiy boʻlim</Badge>;
      case 'about':
        return <Badge variant="outline" className="text-muted-foreground">Texnikum haqida</Badge>;
      case 'applicants':
        return <Badge variant="outline" className="text-emerald-600 border-emerald-500/20">Abituriyentlarga</Badge>;
      case 'students':
        return <Badge variant="outline" className="text-purple-600 border-purple-500/20">Talabalarga</Badge>;
      default:
        return <Badge variant="outline">Umumiy</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileCheck2 className="h-6 w-6 text-primary" />
            Rasmiy maʼlumotlar va meʼyoriy sahifalar
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Oʻzbekiston Respublikasi «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-modda) boʻyicha 12 ta majburiy boʻlim va axborot sahifalarini boshqarish
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sahifa nomi yoki slug boʻyicha qidiruv..."
            className="pl-9 h-10"
          />
        </div>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="all">Barcha boʻlimlar ({pages.length})</option>
          <option value="info">Rasmiy maʼlumotlar (OʻRQ-637, 37-modda)</option>
          <option value="about">Texnikum haqida</option>
          <option value="applicants">Abituriyentlarga</option>
          <option value="students">Talabalarga</option>
          <option value="general">Umumiy</option>
        </select>
      </div>

      {/* Pages Table */}
      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Sahifalar yuklanmoqda...
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Sahifalar topilmadi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">Boʻlim / Nomi</th>
                  <th className="py-3 px-4">URL (slug)</th>
                  <th className="py-3 px-4">Kategoriya</th>
                  <th className="py-3 px-4">Holati</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPages.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-2">
                        {p.title}
                      </div>
                      {p.metaDescription && (
                        <p className="text-xs text-muted-foreground line-clamp-1 font-normal mt-0.5">
                          {p.metaDescription}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      /{p.section === 'info' ? 'info/' : p.section === 'sveden' ? 'info/' : ''}{p.slug}
                    </td>

                    <td className="py-3 px-4">
                      {getSectionBadge(p.section)}
                    </td>

                    <td className="py-3 px-4">
                      {p.isPublished ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                          Chop etilgan
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                          Yashirilgan
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={p.section === 'info' || p.section === 'sveden' ? `/info/${p.slug}` : `/${p.slug}`}
                          target="_blank"
                          title="Sahifani saytda koʻrish"
                        >
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(p)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={p.isPublished ? 'Sahifani yashirish' : 'Chop etish'}
                        >
                          {p.isPublished ? (
                            <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(p)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title="Tahrirlash"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Page Modal */}
      {editingPage && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Boʻlimni tahrirlash: ${editingPage.title}`}
          description={`URL: /info/${editingPage.slug}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleSave} className="space-y-4">
            {formError && (
              <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Sahifa sarlavhasi <span className="text-destructive">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Boʻlim toifasi
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as PageSection)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="info">Rasmiy maʼlumotlar (OʻRQ-637, 37-modda)</option>
                  <option value="about">Texnikum haqida</option>
                  <option value="applicants">Abituriyentlarga</option>
                  <option value="students">Talabalarga</option>
                  <option value="general">Umumiy</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Meta Title (qidiruv tizimlari uchun)
                </label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO sarlavhasi"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Meta Description (sahifa tavsifi)
                </label>
                <Input
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Qidiruv tizimlari uchun qisqacha tavsif..."
                />
              </div>

              <div className="sm:col-span-2">
                <WysiwygEditor
                  value={contentHtml}
                  onChange={setContentHtml}
                  label="Sahifaning HTML-matni va jadvallari"
                  minHeight="320px"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  />
                  <span>Sahifa saytda ochiq koʻrinishda chop etilsin</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Bekor qilish
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Oʻzgarishlarni saqlash
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
