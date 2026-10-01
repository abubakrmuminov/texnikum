'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Eye,
  Save,
  Send,
  History,
  Settings,
  Undo2,
  Redo2,
  Layers,
  Sparkles,
  Loader2,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  BookmarkPlus,
  Copy,
  Search,
  Globe,
  Trash2,
} from 'lucide-react';
import {
  PageBlock,
  PageItem,
  PageRevision,
  NavigationItem,
  UserRole,
  GridRow,
  normalizePageRows,
  ReusableBlock,
  ReusableBlockCategory,
} from '@college/shared';
import { apiClient } from '@/lib/api-client';
import { checkPageContent, ContentCheckResult } from '@/lib/page-checker';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { ViewportSwitcher, BuilderViewport } from '@/components/admin/page-builder/viewport-switcher';
import { OutlinePanel } from '@/components/admin/page-builder/outline-panel';
import { RowStyleDialog } from '@/components/admin/page-builder/row-style-dialog';
import { BlockEditDialog } from '@/components/admin/page-builder/block-edit-dialog';
import { CanvasGrid } from '@/components/admin/page-builder/canvas-grid';
import { PALETTE_BLOCKS, PaletteBlockDef, PALETTE_CATEGORIES } from '@/components/admin/page-builder/palette';
import {
  findBlockLocation,
  createDefaultRow,
  deleteBlock,
  moveBlock,
} from '@/components/admin/page-builder/grid-operations';

function extractFlatBlocks(rows: GridRow[]): PageBlock[] {
  const result: PageBlock[] = [];
  let sortOrder = 0;
  for (const row of rows) {
    for (const cell of row.cells) {
      for (const block of cell.blocks) {
        result.push({ ...block, sortOrder: sortOrder++ });
      }
    }
  }
  return result;
}

export default function AdminPageBuilder(): JSX.Element {
  const params = useParams();
  const id = params?.id as string;
  const { locale } = useAppLocale();
  const isDefaultUz = locale === 'uz';
  const { token, hasRole } = useAdminAuth();
  const canEdit = hasRole(UserRole.ADMIN) || hasRole(UserRole.EDITOR);

  const [page, setPage] = useState<PageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Editing language: 'uz' or 'ru'
  const [activeLang, setActiveLang] = useState<'uz' | 'ru'>('uz');
  const isUz = activeLang === 'uz';

  // Responsive Viewport
  const [viewport, setViewport] = useState<BuilderViewport>('desktop');
  const [customWidth, setCustomWidth] = useState<number>(1280);

  // Left sidebar active tab: 'palette' | 'reusable' | 'outline'
  const [sidebarTab, setSidebarTab] = useState<'palette' | 'reusable' | 'outline'>('palette');
  const [paletteSearch, setPaletteSearch] = useState('');

  // Reusable Blocks State
  const [reusableBlocks, setReusableBlocks] = useState<ReusableBlock[]>([]);
  const [reusableLoading, setReusableLoading] = useState(false);
  const [saveReusableOpen, setSaveReusableOpen] = useState(false);
  const [rowToSaveAsReusable, setRowToSaveAsReusable] = useState<GridRow | null>(null);
  const [reusableTitleUz, setReusableTitleUz] = useState('');
  const [reusableTitleRu, setReusableTitleRu] = useState('');
  const [reusableCategory, setReusableCategory] = useState<string>('custom');
  const [reusableIsGlobal, setReusableIsGlobal] = useState(false);
  const [isSavingReusable, setIsSavingReusable] = useState(false);
  const [reusableToDelete, setReusableToDelete] = useState<ReusableBlock | null>(null);
  const [isDeletingReusable, setIsDeletingReusable] = useState(false);

  // Clipboard State (cross-page row and block copies)
  const [hasRowClipboard, setHasRowClipboard] = useState(false);

  // Rows and selection state
  const [rows, setRows] = useState<GridRow[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Undo / Redo history (at least 30 states)
  const [history, setHistory] = useState<GridRow[][]>([]);
  const [future, setFuture] = useState<GridRow[][]>([]);

  // Dialogs
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [stylingRow, setStylingRow] = useState<GridRow | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [revisions, setRevisions] = useState<PageRevision[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [checksOpen, setChecksOpen] = useState(false);
  const [checkResult, setCheckResult] = useState<ContentCheckResult | null>(null);

  // Page Settings fields
  const [titleUz, setTitleUz] = useState('');
  const [titleRu, setTitleRu] = useState('');
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState('');
  const [showInMenu, setShowInMenu] = useState(false);
  const [selectedParentNavId, setSelectedParentNavId] = useState<string>('none');
  const [rootNavItems, setRootNavItems] = useState<NavigationItem[]>([]);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTargetField, setUploadTargetField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Page Data
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    apiClient
      .getPageById(id, token || undefined)
      .then((data) => {
        if (!isMounted) return;
        setPage(data);
        setTitleUz(data.titleUz || data.title || '');
        setTitleRu(data.titleRu || data.title || '');
        setSlug(data.slug);
        setMetaTitle(data.metaTitle || '');
        setMetaDescription(data.metaDescription || '');
        setOgImageUrl(data.ogImageUrl || '');

        // Normalize rows (backward-compatible zero data loss)
        const loadedRows = normalizePageRows(data);
        setRows(loadedRows);
        setHistory([loadedRows]);

        // Select first block if exists
        const firstBlock = loadedRows[0]?.cells[0]?.blocks[0];
        if (firstBlock) {
          setSelectedBlockId(firstBlock.id);
        }
      })
      .catch((err) => {
        console.error('Failed to load page', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    apiClient
      .getAdminNavigation(false, token || undefined)
      .then((navs) => {
        if (!isMounted) return;
        const roots = navs.filter((item) => !item.parentId && item.location === 'header');
        setRootNavItems(roots);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [id, token]);

  // Load reusable blocks
  const loadReusableBlocks = useCallback(async () => {
    setReusableLoading(true);
    try {
      const list = await apiClient.getReusableBlocks(token || undefined);
      setReusableBlocks(list);
    } catch (err) {
      console.error('Failed to load reusable blocks', err);
    } finally {
      setReusableLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadReusableBlocks();
    if (typeof window !== 'undefined') {
      setHasRowClipboard(Boolean(localStorage.getItem('college_builder_row_clipboard')));
    }
  }, [loadReusableBlocks]);

  // Clipboard operations (cross-page row and block copies)
  const handleCopyRow = (row: GridRow) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('college_builder_row_clipboard', JSON.stringify(row));
    setHasRowClipboard(true);
    setAnnouncement(isUz ? 'Boʻlim xotiraga nusxalandi' : 'Секция скопирована в буфер обмена');
  };

  const handlePasteRow = (targetIndex?: number) => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem('college_builder_row_clipboard');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as GridRow;
      const clonedRow: GridRow = {
        ...parsed,
        id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        cells: parsed.cells.map((cell) => ({
          ...cell,
          id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          blocks: cell.blocks.map((block) => ({
            ...block,
            id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          })),
        })),
      };
      const nextRows = [...rows];
      const insertIdx = targetIndex !== undefined ? targetIndex : rows.length;
      nextRows.splice(insertIdx, 0, clonedRow);
      updateRowsWithHistory(nextRows);
      setAnnouncement(isUz ? 'Boʻlim sahifaga joylashtirildi' : 'Секция вставлена из буфера');
    } catch (err) {
      console.error('Failed to paste row', err);
    }
  };

  const handleCopyBlock = (block: PageBlock) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('college_builder_block_clipboard', JSON.stringify(block));
    setAnnouncement(isUz ? 'Blok xotiraga nusxalandi' : 'Блок скопирован в буфер обмена');
  };

  // Reusable blocks operations
  const handleOpenSaveReusable = (row: GridRow) => {
    setRowToSaveAsReusable(row);
    setReusableTitleUz('');
    setReusableTitleRu('');
    setReusableCategory('custom');
    setReusableIsGlobal(false);
    setSaveReusableOpen(true);
  };

  const handleConfirmSaveReusable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rowToSaveAsReusable || !reusableTitleUz.trim()) return;
    try {
      setIsSavingReusable(true);
      await apiClient.createReusableBlock(
        {
          titleUz: reusableTitleUz.trim(),
          titleRu: reusableTitleRu.trim() || reusableTitleUz.trim(),
          category: reusableCategory as ReusableBlockCategory,
          isGlobal: reusableIsGlobal,
          rowData: rowToSaveAsReusable,
        },
        token || undefined,
      );
      setSaveReusableOpen(false);
      await loadReusableBlocks();
      setAnnouncement(
        isUz ? 'Boʻlim shablon sifatida saqlandi' : 'Секция сохранена как шаблон',
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setIsSavingReusable(false);
    }
  };

  const handleInsertReusableAsCopy = (item: ReusableBlock) => {
    const freshRow: GridRow = {
      ...item.rowData,
      id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cells: item.rowData.cells.map((cell) => ({
        ...cell,
        id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        blocks: cell.blocks.map((block) => ({
          ...block,
          id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        })),
      })),
    };
    const nextRows = [...rows, freshRow];
    updateRowsWithHistory(nextRows);
    setAnnouncement(
      isUz
        ? `«${item.titleUz}» bloki sahifaga nusxa sifatida qoʻshildi`
        : `Блок «${item.titleRu}» добавлен на холст как копия`,
    );
  };

  const handleInsertReusableAsGlobal = (item: ReusableBlock) => {
    const globalRefBlock: PageBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: 'reusable_ref',
      sortOrder: 0,
      isVisible: true,
      config: {
        reusableBlockId: item.id,
        isGlobal: true,
      },
    };
    const newRow = createDefaultRow();
    newRow.cells = [
      {
        id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        colSpan: 12,
        verticalAlign: 'top',
        isCard: false,
        blocks: [globalRefBlock],
      },
    ];
    const nextRows = [...rows, newRow];
    updateRowsWithHistory(nextRows);
    setAnnouncement(
      isUz
        ? `«${item.titleUz}» global bloki sahifaga ulandi`
        : `Глобальный блок «${item.titleRu}» привязан к странице`,
    );
  };

  const handleConfirmDeleteReusable = async () => {
    if (!reusableToDelete) return;
    try {
      setIsDeletingReusable(true);
      await apiClient.deleteReusableBlock(reusableToDelete.id, token || undefined);
      await loadReusableBlocks();
      setReusableToDelete(null);
      setAnnouncement(isUz ? 'Shablon oʻchirildi' : 'Шаблон успешно удален');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xatolik');
    } finally {
      setIsDeletingReusable(false);
    }
  };

  // Push new state to undo history (up to 30 states)
  const updateRowsWithHistory = useCallback((nextRows: GridRow[]) => {
    setRows((prev) => {
      setHistory((h) => [...h.slice(-30), prev]);
      setFuture([]);
      return nextRows;
    });
    setIsDirty(true);
  }, []);

  // Undo
  const handleUndo = () => {
    if (history.length <= 1) return;
    const previous = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setFuture((f) => [rows, ...f]);
    setHistory(newHistory);
    if (previous) setRows(previous);
    setIsDirty(true);
    setAnnouncement(isUz ? 'Oxirgi amal bekor qilindi' : 'Действие отменено');
  };

  // Redo
  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setHistory((h) => [...h, rows]);
    setFuture(newFuture);
    if (next) setRows(next);
    setIsDirty(true);
    setAnnouncement(isUz ? 'Amal qaytarildi' : 'Действие возвращено');
  };

  // Keyboard shortcuts: Ctrl+Z, Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Warn before unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Save draft
  const handleSaveDraft = async (silent = false) => {
    if (!page || !canEdit) return;
    try {
      if (!silent) setSaving(true);

      const flatBlocks = extractFlatBlocks(rows);
      const payload: Partial<PageItem> = {
        title: titleUz.trim() || page.title,
        titleUz: titleUz.trim(),
        titleRu: titleRu.trim(),
        slug: slug.trim().toLowerCase(),
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        ogImageUrl: ogImageUrl.trim() || null,
        schemaVersion: 2,
        rows,
        blocks: flatBlocks,
      };

      const updated = await apiClient.updatePage(page.id, payload, token || undefined);
      setPage(updated);
      setIsDirty(false);
      const timeStr = new Date().toLocaleTimeString(isUz ? 'uz-UZ' : 'ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setLastSavedTime(timeStr);
      setAnnouncement(isUz ? `Qoralama saqlandi (${timeStr})` : `Черновик сохранен (${timeStr})`);

      if (showInMenu && selectedParentNavId !== 'none') {
        await apiClient
          .createNavigationItem(
            {
              labelUz: titleUz || 'Yangi sahifa',
              labelRu: titleRu || 'Новая страница',
              path: `/${slug}`,
              targetType: 'internal_page',
              pageId: page.id,
              location: 'header',
              parentId: selectedParentNavId === 'root' ? null : selectedParentNavId,
            },
            token || undefined,
          )
          .catch(() => {});
      }
    } catch (err) {
      if (!silent) {
        alert(
          err instanceof Error
            ? err.message
            : isUz
            ? 'Saqlashda xatolik yuz berdi'
            : 'Ошибка сохранения',
        );
      }
    } finally {
      if (!silent) setSaving(false);
    }
  };

  const handleSaveDraftRef = useRef(handleSaveDraft);
  handleSaveDraftRef.current = handleSaveDraft;

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    if (!isDirty || !page) return;
    const interval = setInterval(() => {
      handleSaveDraftRef.current(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, page]);

  // Add block from palette
  const handleAddPaletteBlock = (def: PaletteBlockDef) => {
    const newBlock: PageBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: def.type,
      sortOrder: 0,
      isVisible: true,
      config: JSON.parse(JSON.stringify(def.defaultConfig)),
    };

    // If a block is currently selected, add beside or below, else append new 12-col row at the bottom
    if (selectedBlockId) {
      const loc = findBlockLocation(rows, selectedBlockId);
      if (loc) {
        const nextRows = rows.map((r, rIdx) => {
          if (rIdx !== loc.rowIndex) return r;
          return {
            ...r,
            cells: r.cells.map((c, cIdx) => {
              if (cIdx !== loc.cellIndex) return c;
              const nextBlocks = [...c.blocks];
              nextBlocks.splice(loc.blockIndex + 1, 0, newBlock);
              return { ...c, blocks: nextBlocks };
            }),
          };
        });
        updateRowsWithHistory(nextRows);
        setSelectedBlockId(newBlock.id);
        setAnnouncement(
          isUz ? `«${def.nameUz}» bloki qoʻshildi` : `Блок «${def.nameRu}» добавлен на страницу`,
        );
        return;
      }
    }

    // Default: append new 12-col row at bottom
    const newRow = createDefaultRow();
    newRow.cells = [
      {
        id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        colSpan: 12,
        verticalAlign: 'top',
        isCard: false,
        blocks: [newBlock],
      },
    ];

    updateRowsWithHistory([...rows, newRow]);
    setSelectedBlockId(newBlock.id);
    setAnnouncement(
      isUz ? `«${def.nameUz}» bloki qoʻshildi` : `Блок «${def.nameRu}» добавлен на страницу`,
    );
  };

  // Pre-Publish Checks and Publishing
  const handleOpenPublishModal = () => {
    if (!page) return;
    const flatBlocks = extractFlatBlocks(rows);
    const draftPage: Partial<PageItem> = {
      ...page,
      titleUz,
      titleRu,
      slug,
      rows,
      blocks: flatBlocks,
    };
    const result = checkPageContent(draftPage);
    setCheckResult(result);
    setChecksOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!page || !canEdit || !checkResult?.canPublish) return;
    try {
      setSaving(true);
      const flatBlocks = extractFlatBlocks(rows);
      const payload: Partial<PageItem> = {
        title: titleUz.trim() || page.title,
        titleUz: titleUz.trim(),
        titleRu: titleRu.trim(),
        slug: slug.trim().toLowerCase(),
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        ogImageUrl: ogImageUrl.trim() || null,
        isPublished: true,
        schemaVersion: 2,
        rows,
        blocks: flatBlocks,
      };

      const updated = await apiClient.updatePage(page.id, payload, token || undefined);
      setPage(updated);
      setIsDirty(false);
      setChecksOpen(false);
      setAnnouncement(
        isUz ? 'Sahifa muvaffaqiyatli eʼlon qilindi!' : 'Страница успешно опубликована!',
      );
      fetch('/api/revalidate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: updated.slug }),
      }).catch(() => {});
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!page || !canEdit) return;
    try {
      setSaving(true);
      const updated = await apiClient.updatePage(
        page.id,
        { isPublished: false },
        token || undefined,
      );
      setPage(updated);
      setAnnouncement(
        isUz ? 'Sahifa qoralama holatiga oʻtkazildi' : 'Страница снята с публикации',
      );
    } catch {
      alert('Xatolik');
    } finally {
      setSaving(false);
    }
  };

  // Revisions Modal
  const handleOpenRevisions = async () => {
    if (!page) return;
    setRevisionsOpen(true);
    setRevisionsLoading(true);
    try {
      const revs = await apiClient.getPageRevisions(page.id, token || undefined);
      setRevisions(revs);
    } catch {
      setRevisions([]);
    } finally {
      setRevisionsLoading(false);
    }
  };

  const handleRestoreRevision = async (revId: string) => {
    if (!page || !canEdit) return;
    try {
      setSaving(true);
      const restored = await apiClient.restorePageRevision(page.id, revId, token || undefined);
      setPage(restored);
      setTitleUz(restored.titleUz || restored.title || '');
      setTitleRu(restored.titleRu || restored.title || '');
      setSlug(restored.slug);
      const restoredRows = normalizePageRows(restored);
      setRows(restoredRows);
      setHistory([restoredRows]);
      setFuture([]);
      setIsDirty(false);
      setRevisionsOpen(false);
      setAnnouncement(isUz ? 'Oldingi versiya tiklandi' : 'Версия страницы восстановлена');
    } catch {
      alert(isUz ? 'Versiyani tiklab boʻlmadi' : 'Не удалось восстановить версию');
    } finally {
      setSaving(false);
    }
  };

  // Trigger media upload
  const handleTriggerUpload = (field: string) => {
    setUploadTargetField(field);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingBlock) return;

    try {
      setIsUploading(true);
      const res = await apiClient.uploadMedia(file, 'news-media', token || undefined);
      const cfg = { ...(editingBlock.config as Record<string, unknown>) };
      if (uploadTargetField) {
        cfg[uploadTargetField] = res.publicUrl;
      } else {
        cfg.url = res.publicUrl;
      }
      const updatedBlock = { ...editingBlock, config: cfg };
      setEditingBlock(updatedBlock);

      // Update in rows
      const nextRows = rows.map((r) => ({
        ...r,
        cells: r.cells.map((c) => ({
          ...c,
          blocks: c.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
        })),
      }));
      updateRowsWithHistory(nextRows);
    } catch {
      alert(isUz ? 'Faylni yuklashda xatolik yuz berdi' : 'Ошибка загрузки файла');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-12 text-center">
        <Loader2 className="size-8 animate-spin mx-auto text-primary mb-3" />
        <p className="text-xs text-muted-foreground">
          {isDefaultUz ? 'Konstruktor yuklanmoqda...' : 'Загрузка конструктора страниц...'}
        </p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto p-6 max-w-md text-center space-y-4">
        <AlertTriangle className="size-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold">Sahifa topilmadi</h2>
        <Link href="/admin/pages">
          <Button variant="outline" size="sm">
            Roʻyxatga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Hidden file input for uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
      />

      {isUploading && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-border shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 text-sm font-semibold text-foreground animate-in fade-in slide-in-from-bottom-2">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>{isUz ? 'Fayl yuklanmoqda...' : 'Загрузка файла...'}</span>
        </div>
      )}

      {/* Screen Reader live announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Верхняя панель управления (Top Bar) */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-xs px-4 py-2.5">
        <div className="container mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Левая часть: Назад, название страницы, статус */}
          <div className="flex items-center gap-3">
            <Link href="/admin/pages">
              <Button variant="ghost" size="sm" className="size-8 p-0" title="Roʻyxatga qaytish">
                <ArrowLeft className="size-4" />
              </Button>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-foreground truncate max-w-xs sm:max-w-md">
                  {isUz ? titleUz || 'Yangi sahifa' : titleRu || 'Новая страница'}
                </h1>
                {page.isPublished ? (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0 font-semibold">
                    {isUz ? 'Eʼlon qilingan' : 'Опубликовано'}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0"
                  >
                    {isUz ? 'Qoralama' : 'Черновик'}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                <span className="font-mono">/{slug}</span>
                <span>•</span>
                {saving ? (
                  <span className="text-primary flex items-center gap-1">
                    <Loader2 className="size-3 animate-spin" />
                    {isUz ? 'Saqlanmoqda...' : 'Сохранение...'}
                  </span>
                ) : isDirty ? (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {isUz ? 'Saqlanmagan oʻzgarishlar' : 'Несохраненные правки'}
                  </span>
                ) : lastSavedTime ? (
                  <span>
                    {isUz ? 'Saqlangan' : 'Сохранено'} {lastSavedTime}
                  </span>
                ) : (
                  <span>{isUz ? 'Avtosaqlash faol' : 'Автосохранение'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Центр: Viewport Switcher */}
          <div className="flex justify-center">
            <ViewportSwitcher
              viewport={viewport}
              customWidth={customWidth}
              onChange={setViewport}
              onCustomWidthChange={setCustomWidth}
              isUz={isUz}
            />
          </div>

          {/* Правая часть: Язык, Undo/Redo, Настройки, Превью, Сохранить, Опубликовать */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Языковой переключатель */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveLang('uz')}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  isUz
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Oʻzbekcha tahrir"
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('ru')}
                className={`px-2 py-1 rounded-md font-bold transition-colors ${
                  !isUz
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Редактирование на русском"
              >
                RU
              </button>
            </div>

            {/* Undo / Redo */}
            <div className="flex items-center border border-border rounded-lg bg-card overflow-hidden">
              <button
                type="button"
                id="btn-builder-undo"
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                title="Bekor qilish (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 className="size-4" />
              </button>
              <div className="w-[1px] h-4 bg-border" />
              <button
                type="button"
                id="btn-builder-redo"
                onClick={handleRedo}
                disabled={future.length === 0}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                title="Qaytarish (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 className="size-4" />
              </button>
            </div>

            {/* История версий */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-tour="page-builder.revisions-btn"
              onClick={handleOpenRevisions}
              className="text-xs"
            >
              <History className="size-3.5 mr-1" />
              <span className="hidden sm:inline">{isUz ? 'Tarix' : 'Версии'}</span>
            </Button>

            {/* Настройки страницы */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-tour="page-builder.settings-btn"
              onClick={() => setSettingsOpen(true)}
              className="text-xs"
            >
              <Settings className="size-3.5 mr-1" />
              <span className="hidden sm:inline">{isUz ? 'Sozlamalar' : 'Настройки'}</span>
            </Button>

            {/* Предпросмотр */}
            <Link href={`/admin/pages/${page.id}/preview`} target="_blank">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-tour="page-builder.preview-btn"
                className="text-xs"
              >
                <Eye className="size-3.5 mr-1" />
                <span>{isUz ? 'Koʻrish' : 'Превью'}</span>
              </Button>
            </Link>

            {/* Сохранить черновик */}
            <Button
              type="button"
              id="btn-save-draft"
              variant="secondary"
              size="sm"
              onClick={() => handleSaveDraft(false)}
              disabled={saving || !canEdit}
              className="text-xs font-semibold"
            >
              <Save className="size-3.5 mr-1" />
              <span>{isUz ? 'Saqlash' : 'Сохранить'}</span>
            </Button>

            {/* Опубликовать / Снять с публикации */}
            {page.isPublished ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUnpublish}
                disabled={saving || !canEdit}
                className="text-xs text-amber-600 dark:text-amber-400 border-amber-500/30"
              >
                <span>{isUz ? 'Eʼlondan olish' : 'Снять с публикации'}</span>
              </Button>
            ) : (
              <Button
                type="button"
                id="btn-publish-page"
                size="sm"
                data-tour="page-builder.publish-btn"
                onClick={handleOpenPublishModal}
                disabled={saving || !canEdit}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <Send className="size-3.5 mr-1" />
                <span>{isUz ? 'Eʼlon qilish' : 'Опубликовать'}</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Основная рабочая зона */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Левая боковая панель: Табы "Палитра" и "Структура" */}
          <aside className="lg:col-span-4 space-y-4">
            <Card className="border-border shadow-xs sticky top-20">
              {/* Переключатель вкладок Палитра / Шаблоны / Структура */}
              <div className="p-2 border-b border-border bg-muted/30 flex items-center gap-1">
                <button
                  type="button"
                  id="tab-palette-btn"
                  onClick={() => setSidebarTab('palette')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    sidebarTab === 'palette'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="size-3.5 text-primary" />
                  <span>{isUz ? 'Kutubxona' : 'Палитра'}</span>
                </button>
                <button
                  type="button"
                  id="tab-reusable-btn"
                  data-tour="page-builder.reusable-tab"
                  onClick={() => setSidebarTab('reusable')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    sidebarTab === 'reusable'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookmarkPlus className="size-3.5 text-primary" />
                  <span>{isUz ? 'Shablonlar' : 'Модули'}</span>
                </button>
                <button
                  type="button"
                  id="tab-outline-btn"
                  data-tour="page-builder.outline-tab"
                  onClick={() => setSidebarTab('outline')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    sidebarTab === 'outline'
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Layers className="size-3.5 text-primary" />
                  <span>{isUz ? 'Struktura' : 'Дерево'}</span>
                </button>
              </div>

              {/* Содержимое вкладки: Палитра блоков */}
              {sidebarTab === 'palette' && (
                <div data-tour="page-builder.palette">
                  <CardHeader className="p-3 pb-2 border-b border-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {isUz ? 'Barcha bloklar' : 'Все блоки'}
                      </CardTitle>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {PALETTE_BLOCKS.length}
                      </Badge>
                    </div>

                    {/* Поиск по палитре */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        value={paletteSearch}
                        onChange={(e) => setPaletteSearch(e.target.value)}
                        placeholder={isUz ? 'Bloklarni qidirish...' : 'Поиск блоков...'}
                        className="h-7 text-xs pl-8 bg-background"
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 max-h-[68vh] overflow-y-auto space-y-4">
                    {/* Список блоков по 5 категориям */}
                    {PALETTE_CATEGORIES.map((cat) => {
                      const catBlocks = PALETTE_BLOCKS.filter((b) => {
                        if (b.category !== cat.id) return false;
                        if (!paletteSearch.trim()) return true;
                        const q = paletteSearch.toLowerCase().trim();
                        return (
                          b.nameUz.toLowerCase().includes(q) ||
                          b.nameRu.toLowerCase().includes(q) ||
                          b.descUz.toLowerCase().includes(q) ||
                          b.descRu.toLowerCase().includes(q) ||
                          b.type.toLowerCase().includes(q)
                        );
                      });

                      if (catBlocks.length === 0) return null;

                      return (
                        <div key={cat.id} className="space-y-1.5">
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              {isUz ? cat.nameUz : cat.nameRu}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                              {catBlocks.length}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {catBlocks.map((def) => {
                              const Icon = def.icon;
                              return (
                                <button
                                  key={def.type}
                                  type="button"
                                  id={`btn-palette-add-${def.type}`}
                                  onClick={() => handleAddPaletteBlock(def)}
                                  className="w-full p-2.5 rounded-lg border border-border bg-card hover:bg-primary/5 hover:border-primary/40 transition-all text-left flex items-start gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
                                >
                                  <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0 mt-0.5">
                                    <Icon className="size-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-xs font-semibold text-foreground block group-hover:text-primary transition-colors truncate">
                                      {isUz ? def.nameUz : def.nameRu}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                                      {isUz ? def.descUz : def.descRu}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </div>
              )}

              {/* Содержимое вкладки: Переиспользуемые и глобальные блоки */}
              {sidebarTab === 'reusable' && (
                <div data-tour="page-builder.reusable">
                  <CardHeader className="p-3 pb-2 border-b border-border/60 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {isUz ? 'Shablonlar va modullar' : 'Шаблоны и модули'}
                      </CardTitle>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {isUz ? 'Saqlangan tayyor boʻlimlar' : 'Переиспользуемые секции'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {reusableBlocks.length}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-3 max-h-[68vh] overflow-y-auto space-y-3">
                    {reusableLoading ? (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        <Loader2 className="size-4 animate-spin mx-auto mb-2 text-primary" />
                        <span>{isUz ? 'Yuklanmoqda...' : 'Загрузка...'}</span>
                      </div>
                    ) : reusableBlocks.length === 0 ? (
                      <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20 space-y-2">
                        <BookmarkPlus className="size-7 text-muted-foreground/50 mx-auto" />
                        <p className="text-xs font-bold text-foreground">
                          {isUz ? 'Hozircha shablonlar yoʻq' : 'Шаблонов пока нет'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {isUz
                            ? 'Xolstdagi ixtiyoriy qator boshidagi «Shablon» tugmasini bosib saqlang.'
                            : 'Нажмите «Шаблон» в заголовке любой строки на холсте для сохранения.'}
                        </p>
                      </div>
                    ) : (
                      reusableBlocks.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-all space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-xs text-foreground">
                                  {isUz ? item.titleUz : item.titleRu}
                                </span>
                                {item.isGlobal ? (
                                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 py-0 font-semibold flex items-center gap-1">
                                    <Globe className="size-2.5" />
                                    <span>Global</span>
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground">
                                    {isUz ? 'Mustaqil' : 'Обычный'}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground block mt-0.5">
                                {isUz ? `${item.usageCount || 0} ta sahifada ishlatilmoqda` : `Используется на ${item.usageCount || 0} стр.`}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => setReusableToDelete(item)}
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              title={isUz ? 'Oʻchirish' : 'Удалить'}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>

                          {/* Кнопки вставки в страницу */}
                          <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
                            <Button
                              type="button"
                              id={`btn-insert-reusable-copy-${item.id}`}
                              size="sm"
                              variant="outline"
                              onClick={() => handleInsertReusableAsCopy(item)}
                              className="flex-1 h-7 text-[11px] px-2"
                              title={isUz ? 'Mustaqil nusxa sifatida qoʻshish' : 'Вставить как независимую копию'}
                            >
                              <Copy className="size-3 mr-1" />
                              <span>{isUz ? 'Nusxa' : 'Копия'}</span>
                            </Button>

                            <Button
                              type="button"
                              id={`btn-insert-reusable-global-${item.id}`}
                              size="sm"
                              variant="outline"
                              onClick={() => handleInsertReusableAsGlobal(item)}
                              className="flex-1 h-7 text-[11px] px-2 text-primary border-primary/30 hover:bg-primary/5"
                              title={isUz ? 'Sinxronlanuvchi global blok sifatida ulash' : 'Вставить как синхронизируемый глобальный блок'}
                            >
                              <Globe className="size-3 mr-1" />
                              <span>{isUz ? 'Global' : 'Глобальный'}</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </div>
              )}

              {/* Содержимое вкладки: Дерево структуры (Outline) */}
              {sidebarTab === 'outline' && (
                <OutlinePanel
                  rows={rows}
                  selectedBlockId={selectedBlockId}
                  selectedRowId={selectedRowId}
                  isUz={isUz}
                  onSelectBlock={(bId) => {
                    setSelectedBlockId(bId);
                    const el = document.getElementById(`canvas-block-${bId}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  onSelectRow={(rId) => setSelectedRowId(rId)}
                  onMoveBlock={(bId, dir) => {
                    const nextRows = moveBlock(rows, bId, dir);
                    updateRowsWithHistory(nextRows);
                  }}
                  onMoveRow={(rId, dir) => {
                    const idx = rows.findIndex((r) => r.id === rId);
                    if (idx !== -1) {
                      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
                      if (targetIdx >= 0 && targetIdx < rows.length) {
                        const nextRows = [...rows];
                        const temp = nextRows[idx]!;
                        nextRows[idx] = nextRows[targetIdx]!;
                        nextRows[targetIdx] = temp;
                        updateRowsWithHistory(nextRows);
                      }
                    }
                  }}
                  onDeleteBlock={(bId) => {
                    const nextRows = deleteBlock(rows, bId);
                    updateRowsWithHistory(nextRows);
                    if (selectedBlockId === bId) setSelectedBlockId(null);
                  }}
                  onDeleteRow={(rId) => {
                    const nextRows = rows.filter((r) => r.id !== rId);
                    updateRowsWithHistory(nextRows);
                  }}
                  onEditBlock={(bId) => {
                    const loc = findBlockLocation(rows, bId);
                    if (loc) setEditingBlock(loc.block);
                  }}
                  onEditRowStyle={(rId) => {
                    const target = rows.find((r) => r.id === rId);
                    if (target) setStylingRow(target);
                  }}
                />
              )}
            </Card>
          </aside>

          {/* Правая часть: Визуальный холст сетки (Canvas Grid) */}
          <main className="lg:col-span-8 space-y-4">
            <CanvasGrid
              rows={rows}
              selectedBlockId={selectedBlockId}
              viewport={viewport}
              customWidth={customWidth}
              isUz={isUz}
              onSelectBlock={setSelectedBlockId}
              onUpdateRows={updateRowsWithHistory}
              onEditBlockSettings={setEditingBlock}
              onOpenRowStyles={setStylingRow}
              onAnnounce={setAnnouncement}
              onSaveRowAsReusable={handleOpenSaveReusable}
              onCopyRow={handleCopyRow}
              onPasteRow={handlePasteRow}
              hasRowClipboard={hasRowClipboard}
              onCopyBlock={handleCopyBlock}
            />
          </main>
        </div>
      </div>

      {/* Диалог настроек блока */}
      <BlockEditDialog
        isOpen={Boolean(editingBlock)}
        onClose={() => setEditingBlock(null)}
        block={editingBlock}
        isUz={isUz}
        onUpdateConfig={(newConfig, newStyle) => {
          if (!editingBlock) return;
          const updatedBlock: PageBlock = {
            ...editingBlock,
            config: newConfig as PageBlock['config'],
            ...(newStyle !== undefined ? { style: newStyle } : {}),
          };
          setEditingBlock(updatedBlock);

          const nextRows = rows.map((r) => ({
            ...r,
            cells: r.cells.map((c) => ({
              ...c,
              blocks: c.blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b)),
            })),
          }));
          updateRowsWithHistory(nextRows);
        }}
        onTriggerUpload={handleTriggerUpload}
      />

      {/* Диалог стилей строки с валидацией контраста WCAG AA */}
      <RowStyleDialog
        open={Boolean(stylingRow)}
        row={stylingRow}
        onOpenChange={(open) => !open && setStylingRow(null)}
        onSave={(rowId, style) => {
          const nextRows = rows.map((r) => (r.id === rowId ? { ...r, style } : r));
          updateRowsWithHistory(nextRows);
          setStylingRow(null);
          setAnnouncement(isUz ? 'Qator uslubi saqlandi' : 'Стили строки сохранены');
        }}
        isUz={isUz}
      />

      {/* Модальное окно настроек страницы */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              <span>{isUz ? 'Sahifa sozlamalari va SEO' : 'Настройки страницы и SEO'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isUz
                ? 'Sarlavhalar, URL manzili, meta maʼlumotlar va navigatsiya sozlamalari'
                : 'Заголовки, URL-адрес, мета-теги и настройки навигации'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'Sarlavha (UZ) *' : 'Заголовок страницы (UZ) *'}
                </label>
                <Input
                  value={titleUz}
                  onChange={(e) => setTitleUz(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'Sarlavha (RU) *' : 'Заголовок страницы (RU) *'}
                </label>
                <Input
                  value={titleRu}
                  onChange={(e) => setTitleRu(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                {isUz ? 'Sahifa URL manzili (Slug) *' : 'URL адрес страницы (Slug) *'}
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground font-mono">/</span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <h4 className="text-xs font-bold text-foreground">SEO & Open Graph</h4>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Meta Title</label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Meta Description
                </label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    {isUz ? 'Bosh menyuda aks ettirish' : 'Отображать в главном меню'}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {isUz
                      ? 'Saytning yuqori navigatsiya paneliga havola qoʻshish'
                      : 'Добавить пункт меню в шапку сайта'}
                  </span>
                </div>
                <Switch checked={showInMenu} onCheckedChange={setShowInMenu} />
              </div>

              {showInMenu && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    {isUz ? 'Ota-ona boʻlimi' : 'Родительский раздел'}
                  </label>
                  <select
                    value={selectedParentNavId}
                    onChange={(e) => setSelectedParentNavId(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-border bg-background"
                  >
                    <option value="none">Tanlanmagan</option>
                    <option value="root">Bosh daraja (Root menu)</option>
                    {rootNavItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {isUz ? item.labelUz : item.labelRu}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen(false)}
              className="text-xs"
            >
              {isUz ? 'Yopish' : 'Закрыть'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* История версий (Revisions) */}
      <Dialog open={revisionsOpen} onOpenChange={setRevisionsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="size-5 text-primary" />
              <span>{isUz ? 'Sahifa tahrirlash tarixi' : 'История изменений страницы'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isUz
                ? 'Oxirgi 20 ta saqlangan versiya. Istalgan versiyani tiklash mumkin.'
                : 'Последние 20 ревизий страницы. Вы можете откатиться к любому состоянию.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto p-1">
            {revisionsLoading ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                <Loader2 className="size-6 animate-spin mx-auto text-primary mb-2" />
                <span>{isUz ? 'Tarix yuklanmoqda...' : 'Загрузка ревизий...'}</span>
              </div>
            ) : revisions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs border border-dashed rounded-lg">
                {isUz ? 'Hozircha saqlangan versiyalar mavjud emas' : 'История изменений пуста'}
              </div>
            ) : (
              revisions.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {rev.snapshot?.titleUz || rev.snapshot?.title || 'Sahifa'}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                        {rev.snapshot?.rows?.length || rev.snapshot?.blocks?.length || 0} el
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{new Date(rev.createdAt).toLocaleString(isUz ? 'uz-UZ' : 'ru-RU')}</span>
                      {rev.authorName && <span>• {rev.authorName}</span>}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestoreRevision(rev.id)}
                    className="text-xs shrink-0"
                  >
                    <span>{isUz ? 'Tiklash' : 'Восстановить'}</span>
                  </Button>
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRevisionsOpen(false)}
              className="text-xs"
            >
              {isUz ? 'Yopish' : 'Закрыть'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Проверка контента перед публикацией */}
      <Dialog open={checksOpen} onOpenChange={setChecksOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="size-5 text-primary" />
              <span>{isUz ? 'Nashr oldi tekshiruvi' : 'Проверка перед публикацией'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isUz
                ? 'WCAG 2.1 AA va qonunchilik talablari boʻyicha avtomatik tekshiruv'
                : 'Автоматическая валидация доступности (WCAG 2.1 AA) и редакционных норм'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 max-h-[60vh] overflow-y-auto p-1">
            {checkResult ? (
              <>
                {checkResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                      <XCircle className="size-4 shrink-0" />
                      <span>
                        {isUz
                          ? `Bloklovchi xatoliklar (${checkResult.errors.length})`
                          : `Блокирующие ошибки (${checkResult.errors.length})`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {checkResult.errors.map((err) => (
                        <div
                          key={err.id}
                          className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs space-y-1"
                        >
                          <span className="font-bold text-destructive block">
                            {isUz ? err.titleUz : err.titleRu}
                          </span>
                          <p className="text-muted-foreground leading-relaxed">
                            {isUz ? err.descriptionUz : err.descriptionRu}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {checkResult.warnings.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>
                        {isUz
                          ? `Tavsiyalar va ogohlantirishlar (${checkResult.warnings.length})`
                          : `Предупреждения (${checkResult.warnings.length})`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {checkResult.warnings.map((warn) => (
                        <div
                          key={warn.id}
                          className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs space-y-1"
                        >
                          <span className="font-bold text-amber-700 dark:text-amber-400 block">
                            {isUz ? warn.titleUz : warn.titleRu}
                          </span>
                          <p className="text-muted-foreground leading-relaxed">
                            {isUz ? warn.descriptionUz : warn.descriptionRu}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {checkResult.errors.length === 0 && checkResult.warnings.length === 0 && (
                  <div className="p-6 text-center space-y-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-10 mx-auto" />
                    <p className="font-bold text-sm">
                      {isUz ? 'Barcha talablar bajarildi!' : 'Все проверки пройдены!'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isUz
                        ? 'Sahifa raqamli qulaylik (WCAG) va qonunchilik talablariga toʻliq mos.'
                        : 'Контент страницы полностью удовлетворяет стандартам доступности.'}
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setChecksOpen(false)}
              className="text-xs"
            >
              {isUz ? 'Bekor qilish' : 'Отмена'}
            </Button>
            <Button
              type="button"
              disabled={!checkResult?.canPublish || saving}
              onClick={handleConfirmPublish}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              <span>{isUz ? 'Tasdiqlash va eʼlon qilish' : 'Подтвердить публикацию'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно сохранения секции как переиспользуемого блока */}
      <Dialog open={saveReusableOpen} onOpenChange={setSaveReusableOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleConfirmSaveReusable} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <BookmarkPlus className="size-5 text-primary" />
                <span>{isUz ? 'Boʻlimni shablon sifatida saqlash' : 'Сохранить секцию как модуль'}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isUz
                  ? 'Ushbu boʻlimni boshqa sahifalarda qayta ishlatish yoki global sinxronlanuvchi blok sifatida ulash mumkin.'
                  : 'Сохраненную секцию можно вставлять на любые страницы как независимую копию или как глобальный блок.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'Shablon nomi (UZ)' : 'Название модуля (UZ)'} *
                </label>
                <Input
                  id="reusable-title-uz-input"
                  value={reusableTitleUz}
                  onChange={(e) => setReusableTitleUz(e.target.value)}
                  placeholder={isUz ? 'Masalan: Kafedra xodimlari' : 'Например: Блок сотрудников'}
                  className="text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'Shablon nomi (RU)' : 'Название модуля (RU)'}
                </label>
                <Input
                  id="reusable-title-ru-input"
                  value={reusableTitleRu}
                  onChange={(e) => setReusableTitleRu(e.target.value)}
                  placeholder={isUz ? 'Masalan: Блок сотрудников' : 'Например: Блок сотрудников'}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  {isUz ? 'Kategoriya' : 'Категория'}
                </label>
                <select
                  value={reusableCategory}
                  onChange={(e) => setReusableCategory(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">{isUz ? 'Umumiy' : 'Общие'}</option>
                  <option value="academic">{isUz ? 'Akademik' : 'Академические'}</option>
                  <option value="hero">{isUz ? 'Bosh ekran / Banner' : 'Главный экран / Баннер'}</option>
                  <option value="footer">{isUz ? 'Footer / Aloqa' : 'Подвал / Контакты'}</option>
                  <option value="cta">{isUz ? 'Harakatga chaqiriq (CTA)' : 'Призыв к действию'}</option>
                  <option value="custom">{isUz ? 'Boshqa' : 'Другое'}</option>
                </select>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/40 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {isUz ? 'Global blok sifatida saqlash' : 'Глобальный синхронизируемый модуль'}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {isUz
                        ? 'Tahrirlanganda ushbu blok qoʻllangan barcha sahifalarda bir zumda yangilanadi'
                        : 'При изменении модуль автоматически обновится на всех страницах'}
                    </span>
                  </div>
                  <Switch
                    id="switch-is-global"
                    checked={reusableIsGlobal}
                    onCheckedChange={setReusableIsGlobal}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaveReusableOpen(false)}
                className="text-xs"
              >
                {isUz ? 'Bekor qilish' : 'Отмена'}
              </Button>
              <Button
                type="submit"
                id="btn-confirm-save-reusable"
                disabled={isSavingReusable || !reusableTitleUz.trim()}
                className="text-xs"
              >
                {isSavingReusable && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
                <span>{isUz ? 'Shablonni saqlash' : 'Сохранить модуль'}</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Модальное окно подтверждения удаления переиспользуемого блока */}
      <Dialog open={Boolean(reusableToDelete)} onOpenChange={() => setReusableToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2 text-base">
              <AlertTriangle className="size-5" />
              <span>{isUz ? 'Shablonni oʻchirish' : 'Удаление модуля'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-2 space-y-2">
              <p>
                {isUz
                  ? `Haqiqatan ham «${reusableToDelete?.titleUz}» shablonini oʻchirmoqchimisiz?`
                  : `Вы действительно хотите удалить модуль «${reusableToDelete?.titleRu || reusableToDelete?.titleUz}»?`}
              </p>
              {(reusableToDelete?.usageCount || 0) > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold">
                  {isUz
                    ? `Diqqat: Ushbu blok saytdagi ${reusableToDelete?.usageCount} ta sahifada ishlatilmoqda! Oʻchirilsa, barcha bogʻlangan sahifalardan olib tashlanadi.`
                    : `Внимание: Этот модуль используется на ${reusableToDelete?.usageCount} страницах сайта! После удаления он исчезнет со всех привязанных страниц.`}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReusableToDelete(null)}
              className="text-xs"
            >
              {isUz ? 'Bekor qilish' : 'Отмена'}
            </Button>
            <Button
              type="button"
              id="btn-confirm-delete-reusable"
              variant="destructive"
              disabled={isDeletingReusable}
              onClick={handleConfirmDeleteReusable}
              className="text-xs"
            >
              {isDeletingReusable && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
              <span>{isUz ? 'Oʻchirish' : 'Удалить'}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
