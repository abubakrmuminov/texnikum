'use client';

import React, { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Compass,
  CornerDownRight,
  ExternalLink,
  GripVertical,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  CreateNavigationItemPayload,
  NavigationItem,
  NavigationMenuLocation,
  NavigationTargetType,
  UpdateNavigationItemPayload,
  UserRole,
} from '@college/shared';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api-client';

interface SortableRowProps {
  item: NavigationItem;
  level?: number;
  isUz: boolean;
  t: (key: string) => string;
  onEdit: (item: NavigationItem) => void;
  onDelete: (item: NavigationItem) => void;
  onToggleVisibility: (item: NavigationItem, checked: boolean) => void;
  onMoveUp: (item: NavigationItem) => void;
  onMoveDown: (item: NavigationItem) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function SortableRow({
  item,
  level = 0,
  isUz,
  t,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: SortableRowProps): JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const label = isUz ? item.labelUz : item.labelRu;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border bg-card transition-colors ${
        isDragging ? 'opacity-50 ring-2 ring-primary border-primary shadow-lg z-10' : 'hover:border-primary/40'
      } ${level > 0 ? 'ml-6 border-l-4 border-l-primary/60 bg-muted/20' : ''}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Ручка Drag-and-Drop */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`${label} - ${t('moveUp')} / ${t('moveDown')}`}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
        >
          <GripVertical className="size-4" />
        </button>

        {level > 0 && (
          <CornerDownRight className="size-4 text-muted-foreground shrink-0 -mr-1" aria-hidden="true" />
        )}

        <div className="flex flex-col min-w-0 gap-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground truncate">{label}</span>
            {item.isRequired && (
              <Badge variant="outline" className="text-[11px] border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10">
                {t('mandatoryBadge')}
              </Badge>
            )}
            {item.isSystem && (
              <Badge variant="secondary" className="text-[11px]">
                System
              </Badge>
            )}
            {item.openInNewTab && (
              <span className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <ExternalLink className="size-3" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            <code className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono">{item.path}</code>
            <span>•</span>
            <span className="capitalize">{item.targetType.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:self-center self-end shrink-0">
        {/* Клавиатурные стрелки перемещения вверх/вниз (WCAG AA A11y) */}
        <div className="flex items-center gap-1 border-r border-border pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canMoveUp}
            onClick={() => onMoveUp(item)}
            aria-label={`${t('moveUp')}: ${label}`}
            className="size-8 p-0"
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canMoveDown}
            onClick={() => onMoveDown(item)}
            aria-label={`${t('moveDown')}: ${label}`}
            className="size-8 p-0"
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>

        {/* Переключатель видимости */}
        <div className="flex items-center gap-2 px-1">
          <Label htmlFor={`visible-${item.id}`} className="sr-only">
            {label} koʻrinishi
          </Label>
          <Switch
            id={`visible-${item.id}`}
            checked={item.isVisible}
            onCheckedChange={(checked) => onToggleVisibility(item, checked)}
          />
        </div>

        {/* Редактирование */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(item)}
          className="text-xs h-8"
        >
          {t('edit')}
        </Button>

        {/* Удаление */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item)}
          aria-label={`${t('delete')}: ${label}`}
          className="size-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminNavigationPage(): JSX.Element {
  const { hasRole } = useAdminAuth();
  const isAdmin = hasRole(UserRole.ADMIN);
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const t = useTranslations('builder');

  const [activeTab, setActiveTab] = useState<NavigationMenuLocation | 'trash'>('header');
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Диалоги
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [mandatoryConfirmOpen, setMandatoryConfirmOpen] = useState(false);
  const [pendingMandatoryAction, setPendingMandatoryAction] = useState<(() => Promise<void>) | null>(null);
  const [restoreDefaultsConfirmOpen, setRestoreDefaultsConfirmOpen] = useState(false);

  // Форма редактирования/добавления
  const [formLabelUz, setFormLabelUz] = useState('');
  const [formLabelRu, setFormLabelRu] = useState('');
  const [formPath, setFormPath] = useState('');
  const [formLocation, setFormLocation] = useState<NavigationMenuLocation>('header');
  const [formTargetType, setFormTargetType] = useState<NavigationTargetType>('internal_page');
  const [formParentId, setFormParentId] = useState<string>('none');
  const [formOpenInNewTab, setFormOpenInNewTab] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getAdminNavigation(true);
      setItems(res || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const announce = (msg: string) => {
    setLiveAnnouncement(msg);
    setTimeout(() => setLiveAnnouncement(''), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive font-bold text-lg">
              <ShieldAlert className="size-5" />
              <span>Ruxsat cheklangan / Доступ ограничен</span>
            </div>
            <CardDescription>
              Ushbu boʻlim faqat tizim Bosh Administratori uchun moʻljallangan.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Фильтрация элементов по вкладкам
  const activeItems = items.filter((i) => !i.deletedAt);
  const trashItems = items.filter((i) => !!i.deletedAt);

  const currentTabItems = activeTab === 'trash'
    ? trashItems
    : activeItems.filter((i) => i.location === activeTab);

  // Список доступных родительских элементов:
  // Строго корень (parentId === null) и исключая текущий редактируемый элемент
  const availableParents = activeItems.filter(
    (i) => i.parentId === null && (!editingItem || i.id !== editingItem.id),
  );

  // Сортировка перетаскиванием (drag and drop)
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentTabItems.findIndex((i) => i.id === active.id);
    const newIndex = currentTabItems.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(currentTabItems, oldIndex, newIndex);

    // Локальное обновление
    setItems((prev) => {
      const remaining = prev.filter((p) => !currentTabItems.some((c) => c.id === p.id));
      return [...remaining, ...reordered];
    });

    announce(t('itemSaved'));

    // Сохранение нового порядка на сервере
    try {
      const movedItem = reordered[newIndex];
      if (!movedItem) return;
      const targetSortOrder = (newIndex + 1) * 10;
      await apiClient.updateNavigationItem(movedItem.id, { sortOrder: targetSortOrder });
      loadData();
    } catch {
      loadData();
    }
  };

  // Перемещение вверх кнопкой
  const handleMoveUp = async (item: NavigationItem) => {
    const idx = currentTabItems.findIndex((i) => i.id === item.id);
    if (idx <= 0) return;
    const prevItem = currentTabItems[idx - 1];
    if (!prevItem) return;

    const reordered = arrayMove(currentTabItems, idx, idx - 1);
    setItems((prev) => {
      const remaining = prev.filter((p) => !currentTabItems.some((c) => c.id === p.id));
      return [...remaining, ...reordered];
    });

    announce(t('movedUp'));

    try {
      await apiClient.updateNavigationItem(item.id, { sortOrder: prevItem.sortOrder - 5 });
      loadData();
    } catch {
      loadData();
    }
  };

  // Перемещение вниз кнопкой
  const handleMoveDown = async (item: NavigationItem) => {
    const idx = currentTabItems.findIndex((i) => i.id === item.id);
    if (idx === -1 || idx >= currentTabItems.length - 1) return;
    const nextItem = currentTabItems[idx + 1];
    if (!nextItem) return;

    const reordered = arrayMove(currentTabItems, idx, idx + 1);
    setItems((prev) => {
      const remaining = prev.filter((p) => !currentTabItems.some((c) => c.id === p.id));
      return [...remaining, ...reordered];
    });

    announce(t('movedDown'));

    try {
      await apiClient.updateNavigationItem(item.id, { sortOrder: nextItem.sortOrder + 5 });
      loadData();
    } catch {
      loadData();
    }
  };

  // Переключение видимости
  const handleToggleVisibility = async (item: NavigationItem, checked: boolean) => {
    if (item.isRequired && !checked) {
      setPendingMandatoryAction(() => async () => {
        try {
          await apiClient.updateNavigationItem(item.id, { isVisible: false, confirm: true });
          announce(t('itemSaved'));
          loadData();
        } catch {
          // ignore
        }
      });
      setMandatoryConfirmOpen(true);
      return;
    }

    try {
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isVisible: checked } : i)),
      );
      await apiClient.updateNavigationItem(item.id, { isVisible: checked });
      announce(t('itemSaved'));
    } catch {
      loadData();
    }
  };

  // Удаление (Soft delete)
  const handleDelete = async (item: NavigationItem) => {
    if (item.isRequired) {
      setPendingMandatoryAction(() => async () => {
        try {
          await apiClient.deleteNavigationItem(item.id, { confirm: true });
          announce(t('itemDeleted'));
          loadData();
        } catch {
          // ignore
        }
      });
      setMandatoryConfirmOpen(true);
      return;
    }

    try {
      await apiClient.deleteNavigationItem(item.id);
      announce(t('itemDeleted'));
      loadData();
    } catch {
      // ignore
    }
  };

  // Восстановление из корзины
  const handleRestore = async (item: NavigationItem) => {
    try {
      await apiClient.restoreNavigationItem(item.id);
      announce(t('itemRestored'));
      loadData();
    } catch {
      // ignore
    }
  };

  // Восстановление структуры по умолчанию
  const handleRestoreDefaults = async () => {
    try {
      setActionLoading(true);
      await apiClient.restoreDefaultNavigation();
      setRestoreDefaultsConfirmOpen(false);
      announce(t('itemSaved'));
      await loadData();
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  // Открытие формы добавления
  const openAddDialog = () => {
    setEditingItem(null);
    setFormLabelUz('');
    setFormLabelRu('');
    setFormPath('/');
    setFormLocation(activeTab === 'trash' ? 'header' : activeTab);
    setFormTargetType('internal_page');
    setFormParentId('none');
    setFormOpenInNewTab(false);
    setFormError(null);
    setEditDialogOpen(true);
  };

  // Открытие формы редактирования
  const openEditDialog = (item: NavigationItem) => {
    setEditingItem(item);
    setFormLabelUz(item.labelUz);
    setFormLabelRu(item.labelRu);
    setFormPath(item.path);
    setFormLocation(item.location);
    setFormTargetType(item.targetType);
    setFormParentId(item.parentId || 'none');
    setFormOpenInNewTab(item.openInNewTab);
    setFormError(null);
    setEditDialogOpen(true);
  };

  // Сохранение формы
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formLabelUz.trim() || !formLabelRu.trim() || !formPath.trim()) {
      setFormError(isUz ? 'Barcha maydonlarni toʻldiring' : 'Заполните все обязательные поля');
      return;
    }

    // Проверка глубины: максимум 1 уровень вложенности
    const targetParent = formParentId === 'none' ? null : formParentId;
    if (targetParent) {
      const parentObj = items.find((i) => i.id === targetParent);
      if (parentObj && parentObj.parentId !== null) {
        setFormError(t('depthLimitWarning'));
        return;
      }
    }

    try {
      setActionLoading(true);
      if (editingItem) {
        const payload: UpdateNavigationItemPayload = {
          labelUz: formLabelUz.trim(),
          labelRu: formLabelRu.trim(),
          path: formPath.trim(),
          location: formLocation,
          targetType: formTargetType,
          parentId: targetParent,
          openInNewTab: formOpenInNewTab,
        };
        await apiClient.updateNavigationItem(editingItem.id, payload);
      } else {
        const payload: CreateNavigationItemPayload = {
          labelUz: formLabelUz.trim(),
          labelRu: formLabelRu.trim(),
          path: formPath.trim(),
          location: formLocation,
          targetType: formTargetType,
          parentId: targetParent,
          openInNewTab: formOpenInNewTab,
          sortOrder: (currentTabItems.length + 1) * 10,
        };
        await apiClient.createNavigationItem(payload);
      }
      setEditDialogOpen(false);
      announce(t('itemSaved'));
      await loadData();
    } catch (err: unknown) {
      setFormError((err as Error).message || 'Xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  // Переключение встроенных системных модулей (Новости, События, Педагоги, Специальности, Контакты)
  const systemModules = [
    { key: 'news', path: '/news', labelUz: 'Yangiliklar va maqolalar', labelRu: 'Новости и статьи' },
    { key: 'events', path: '/events', labelUz: 'Tadbirlar va taqvim', labelRu: 'События и календарь' },
    { key: 'teachers', path: '/teachers', labelUz: 'Pedagogik tarkib', labelRu: 'Преподаватели' },
    { key: 'specialties', path: '/specialties', labelUz: 'Taʼlim yoʻnalishlari', labelRu: 'Специальности' },
    { key: 'administration', path: '/administration', labelUz: 'Rahbariyat va maʼmuriyat', labelRu: 'Руководство и администрация' },
    { key: 'contacts', path: '/contacts', labelUz: 'Bogʻlanish va aloqa', labelRu: 'Контакты' },
  ];

  const handleToggleModule = async (modulePath: string, checked: boolean) => {
    const matchingItems = items.filter((i) => i.path === modulePath && !i.deletedAt);
    if (matchingItems.length === 0) return;

    try {
      for (const item of matchingItems) {
        await apiClient.updateNavigationItem(item.id, { isVisible: checked });
      }
      announce(t('itemSaved'));
      loadData();
    } catch {
      loadData();
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-6xl space-y-6">
      {/* Скрытый блок анонсов для скринридеров */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Верхний блок заголовка и глобальных действий */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <Compass className="size-7 text-primary" />
            <span>{t('navTitle')}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('navSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-tour="navigation.restore-defaults"
            onClick={() => setRestoreDefaultsConfirmOpen(true)}
            className="text-xs"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            {t('restoreDefaults')}
          </Button>

          <Button
            type="button"
            data-tour="navigation.add-btn"
            onClick={openAddDialog}
            className="text-xs"
          >
            <Plus className="size-4 mr-1.5" />
            {t('addItem')}
          </Button>
        </div>
      </div>

      {/* Карточка быстрого включения/отключения системных модулей */}
      <Card data-tour="navigation.modules-card" className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <span>{t('modulesCardTitle')}</span>
          </CardTitle>
          <CardDescription className="text-xs">
            {t('modulesCardDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {systemModules.map((mod) => {
              const matching = items.find((i) => i.path === mod.path && !i.deletedAt);
              const isEnabled = matching ? matching.isVisible : false;
              return (
                <div
                  key={mod.key}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 bg-muted/20"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {isUz ? mod.labelUz : mod.labelRu}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">{mod.path}</span>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggleModule(mod.path, checked)}
                    aria-label={isUz ? mod.labelUz : mod.labelRu}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Вкладки навигации */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as NavigationMenuLocation | 'trash')}
        className="w-full space-y-4"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full h-auto p-1">
          <TabsTrigger value="header" className="text-xs py-2">
            {t('tabHeader')} ({activeItems.filter((i) => i.location === 'header').length})
          </TabsTrigger>
          <TabsTrigger value="footer_regulatory" className="text-xs py-2">
            {t('tabFooterRegulatory')} ({activeItems.filter((i) => i.location === 'footer_regulatory').length})
          </TabsTrigger>
          <TabsTrigger value="footer_students" className="text-xs py-2">
            {t('tabFooterStudents')} ({activeItems.filter((i) => i.location === 'footer_students').length})
          </TabsTrigger>
          <TabsTrigger value="trash" className="text-xs py-2 text-destructive">
            {t('tabTrash')} ({trashItems.length})
          </TabsTrigger>
        </TabsList>

        {['header', 'footer_regulatory', 'footer_students'].map((locKey) => (
          <TabsContent key={locKey} value={locKey} className="space-y-3">
            <Card data-tour="navigation.tree" className="border-border">
              <CardContent className="pt-5 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground text-sm gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Yuklanmoqda...</span>
                  </div>
                ) : currentTabItems.length === 0 ? (
                  <div className="text-center p-8 text-sm text-muted-foreground">
                    Ushbu menyuda elementlar mavjud emas
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={currentTabItems.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {currentTabItems
                          .filter((item) => item.parentId === null)
                          .map((rootItem, rootIdx, rootArr) => {
                            const childItems = currentTabItems.filter((c) => c.parentId === rootItem.id);
                            return (
                              <React.Fragment key={rootItem.id}>
                                <SortableRow
                                  item={rootItem}
                                  level={0}
                                  isUz={isUz}
                                  t={t}
                                  onEdit={openEditDialog}
                                  onDelete={handleDelete}
                                  onToggleVisibility={handleToggleVisibility}
                                  onMoveUp={handleMoveUp}
                                  onMoveDown={handleMoveDown}
                                  canMoveUp={rootIdx > 0}
                                  canMoveDown={rootIdx < rootArr.length - 1}
                                />
                                {childItems.map((childItem, childIdx, childArr) => (
                                  <SortableRow
                                    key={childItem.id}
                                    item={childItem}
                                    level={1}
                                    isUz={isUz}
                                    t={t}
                                    onEdit={openEditDialog}
                                    onDelete={handleDelete}
                                    onToggleVisibility={handleToggleVisibility}
                                    onMoveUp={handleMoveUp}
                                    onMoveDown={handleMoveDown}
                                    canMoveUp={childIdx > 0}
                                    canMoveDown={childIdx < childArr.length - 1}
                                  />
                                ))}
                              </React.Fragment>
                            );
                          })}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Вкладка Корзина (удаленные элементы) */}
        <TabsContent value="trash">
          <Card className="border-border">
            <CardContent className="pt-5 space-y-3">
              {trashItems.length === 0 ? (
                <div className="text-center p-8 text-sm text-muted-foreground">
                  {t('emptyTrash')}
                </div>
              ) : (
                <div className="space-y-2">
                  {trashItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-lg border border-border/70 bg-card"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-semibold line-through text-muted-foreground truncate">
                          {isUz ? item.labelUz : item.labelRu}
                        </span>
                        <code className="text-[11px] text-muted-foreground font-mono">{item.path}</code>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(item)}
                        className="text-xs h-8"
                      >
                        <RefreshCw className="size-3.5 mr-1.5" />
                        {t('restore')}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Диалог добавления/редактирования пункта меню */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t('edit') : t('addItem')}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Maksimal 1 daraja ichki joylashuv (Ota-ona - Toʻgʻridan-toʻgʻri band).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveForm} className="space-y-4 pt-2">
            {formError && (
              <div className="p-2.5 rounded bg-destructive/10 text-destructive text-xs border border-destructive/20">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="formLabelUz" className="text-xs font-semibold">
                {t('labelUz')} *
              </Label>
              <Input
                id="formLabelUz"
                value={formLabelUz}
                onChange={(e) => setFormLabelUz(e.target.value)}
                placeholder="Masalan, Talabalar hayoti"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="formLabelRu" className="text-xs font-semibold">
                {t('labelRu')} *
              </Label>
              <Input
                id="formLabelRu"
                value={formLabelRu}
                onChange={(e) => setFormLabelRu(e.target.value)}
                placeholder="Например, Студенческая жизнь"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="formPath" className="text-xs font-semibold">
                {t('path')} *
              </Label>
              <Input
                id="formPath"
                value={formPath}
                onChange={(e) => setFormPath(e.target.value)}
                placeholder="/talabalar yoki https://..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="formLocation" className="text-xs font-semibold">
                  Menyu joylashuvi
                </Label>
                <Select
                  value={formLocation}
                  onValueChange={(val) => setFormLocation(val as NavigationMenuLocation)}
                >
                  <SelectTrigger id="formLocation" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">{t('tabHeader')}</SelectItem>
                    <SelectItem value="footer_regulatory">{t('tabFooterRegulatory')}</SelectItem>
                    <SelectItem value="footer_students">{t('tabFooterStudents')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="formTargetType" className="text-xs font-semibold">
                  {t('targetType')}
                </Label>
                <Select
                  value={formTargetType}
                  onValueChange={(val) => setFormTargetType(val as NavigationTargetType)}
                >
                  <SelectTrigger id="formTargetType" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal_page">Ichki sahifa</SelectItem>
                    <SelectItem value="module">Modul</SelectItem>
                    <SelectItem value="custom_url">Tashqi URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Родительский элемент: строго 1 уровень */}
            <div className="space-y-1.5">
              <Label htmlFor="formParent" className="text-xs font-semibold">
                {t('parent')}
              </Label>
              <Select
                value={formParentId}
                onValueChange={(val) => setFormParentId(val)}
              >
                <SelectTrigger id="formParent" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('parentNone')}</SelectItem>
                  {availableParents
                    .filter((p) => p.location === formLocation)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {isUz ? p.labelUz : p.labelRu}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <Switch
                id="formOpenInNewTab"
                checked={formOpenInNewTab}
                onCheckedChange={setFormOpenInNewTab}
              />
              <Label htmlFor="formOpenInNewTab" className="text-xs">
                {t('openInNewTab')}
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={actionLoading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения для обязательных нормативных разделов (ст. 37 ЗРУ-637) */}
      <Dialog open={mandatoryConfirmOpen} onOpenChange={setMandatoryConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="size-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-base text-foreground font-bold">
              {t('mandatoryWarningTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed pt-1.5 text-muted-foreground">
              {t('mandatoryWarningText')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMandatoryConfirmOpen(false);
                setPendingMandatoryAction(null);
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (pendingMandatoryAction) {
                  await pendingMandatoryAction();
                }
                setMandatoryConfirmOpen(false);
                setPendingMandatoryAction(null);
              }}
            >
              {t('confirmAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения сброса к заводским настройкам */}
      <Dialog open={restoreDefaultsConfirmOpen} onOpenChange={setRestoreDefaultsConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {t('restoreDefaultsConfirmTitle')}
            </DialogTitle>
            <DialogDescription className="text-xs pt-1.5 leading-relaxed text-muted-foreground">
              {t('restoreDefaultsConfirmText')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRestoreDefaultsConfirmOpen(false)}
              disabled={actionLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRestoreDefaults}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="size-4 mr-1.5 animate-spin" />}
              {t('confirmAction')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
