'use client';

import * as React from 'react';
import {
  History,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  Calendar,
  AlertCircle,
  RefreshCw,
  Download,
  Newspaper,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  FileText,
  MapPin,
  Image as ImageIcon,
  Users,
  Server,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/dialog';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { apiClient } from '@/lib/api-client';
import { AuditLogItem, AuditAction, UserRole } from '@college/shared';

function getEntitySummary(log: AuditLogItem): string {
  const vals = (log.newValues || log.oldValues || {}) as Record<string, unknown>;
  if (vals.title && typeof vals.title === 'string') return vals.title;
  if (vals.fullName && typeof vals.fullName === 'string') {
    const pos = vals.position ? ` (${vals.position})` : '';
    return `${vals.fullName}${pos}`;
  }
  if (vals.name && typeof vals.name === 'string') return vals.name;
  if (vals.fileName && typeof vals.fileName === 'string') return vals.fileName;
  if (vals.message && typeof vals.message === 'string') return vals.message;
  if (vals.email && typeof vals.email === 'string') return vals.email;
  if (vals.event && typeof vals.event === 'string') return vals.event;
  if (log.entityType === 'contacts') return 'Texnikum manzili va aloqa rekvizitlari';
  if (log.entityType === 'system') return 'Tizim boshlangʻich sozlamalari';
  return log.entityId;
}

function getUserDisplayName(userId: string | null): { name: string; roleBadge: string } {
  if (!userId) return { name: 'Tizim (System)', roleBadge: 'system' };
  if (userId.includes('a0000000-0000-0000-0000-000000000001') || userId.includes('admin')) {
    return { name: 'Jasur Karimov', roleBadge: 'Admin' };
  }
  if (userId.includes('a0000000-0000-0000-0000-000000000002') || userId.includes('editor')) {
    return { name: 'Nilufar Yusupova', roleBadge: 'Editor' };
  }
  if (userId.includes('a0000000-0000-0000-0000-000000000003') || userId.includes('moderator')) {
    return { name: 'Dilshodbek Rustamov', roleBadge: 'Moderator' };
  }
  return { name: userId.length > 16 ? `${userId.slice(0, 8)}...` : userId, roleBadge: 'User' };
}

export default function AdminAuditPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const { hasRole, token } = useAdminAuth();
  const isAdmin = hasRole(UserRole.ADMIN);

  const [logs, setLogs] = React.useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState<string>('all');
  const [entityFilter, setEntityFilter] = React.useState<string>('all');

  // Diff Modal
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null);

  const loadAuditLogs = React.useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getAuditLogs({ limit: 100 }, token || undefined);
      setLogs(data.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Audit jurnalini yuklab boʻlmadi'
          : 'Не удалось загрузить журнал аудита'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isUz, token]);

  React.useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return (
          <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 text-xs font-mono font-bold">
            CREATE
          </Badge>
        );
      case 'UPDATE':
        return (
          <Badge variant="outline" className="text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/20 text-xs font-mono font-bold">
            UPDATE
          </Badge>
        );
      case 'DELETE':
        return (
          <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-500/30 bg-red-50/60 dark:bg-red-950/20 text-xs font-mono font-bold">
            DELETE
          </Badge>
        );
      case 'PUBLISH':
        return (
          <Badge variant="outline" className="text-purple-700 dark:text-purple-400 border-purple-500/30 bg-purple-50/60 dark:bg-purple-950/20 text-xs font-mono font-bold">
            PUBLISH
          </Badge>
        );
      case 'ARCHIVE':
        return (
          <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 text-xs font-mono font-bold">
            ARCHIVE
          </Badge>
        );
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getEntityBadge = (type: string) => {
    switch (type) {
      case 'news':
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-xs gap-1 font-medium">
            <Newspaper className="h-3 w-3" />
            <span>{isUz ? 'Yangiliklar' : 'Новости'}</span>
          </Badge>
        );
      case 'administration':
        return (
          <Badge variant="outline" className="border-indigo-500/30 text-indigo-700 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs gap-1 font-medium">
            <ShieldCheck className="h-3 w-3" />
            <span>{isUz ? 'Rahbariyat' : 'Руководство'}</span>
          </Badge>
        );
      case 'teachers':
        return (
          <Badge variant="outline" className="border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 text-xs gap-1 font-medium">
            <GraduationCap className="h-3 w-3" />
            <span>{isUz ? 'Oʻqituvchilar' : 'Преподаватели'}</span>
          </Badge>
        );
      case 'specialties':
        return (
          <Badge variant="outline" className="border-teal-500/30 text-teal-700 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-950/20 text-xs gap-1 font-medium">
            <BookOpen className="h-3 w-3" />
            <span>{isUz ? 'Mutaxassislik' : 'Специальность'}</span>
          </Badge>
        );
      case 'events':
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-xs gap-1 font-medium">
            <Calendar className="h-3 w-3" />
            <span>{isUz ? 'Tadbirlar' : 'События'}</span>
          </Badge>
        );
      case 'pages':
        return (
          <Badge variant="outline" className="border-slate-500/30 text-slate-700 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 text-xs gap-1 font-medium">
            <FileText className="h-3 w-3" />
            <span>{isUz ? 'Sahifalar' : 'Страницы'}</span>
          </Badge>
        );
      case 'contacts':
        return (
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs gap-1 font-medium">
            <MapPin className="h-3 w-3" />
            <span>{isUz ? 'Aloqa' : 'Контакты'}</span>
          </Badge>
        );
      case 'media':
        return (
          <Badge variant="outline" className="border-rose-500/30 text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 text-xs gap-1 font-medium">
            <ImageIcon className="h-3 w-3" />
            <span>{isUz ? 'Mediateka' : 'Медиа'}</span>
          </Badge>
        );
      case 'users':
        return (
          <Badge variant="outline" className="border-violet-500/30 text-violet-700 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/20 text-xs gap-1 font-medium">
            <Users className="h-3 w-3" />
            <span>{isUz ? 'Foydalanuvchilar' : 'Пользователи'}</span>
          </Badge>
        );
      case 'system':
        return (
          <Badge variant="outline" className="border-gray-500/30 text-gray-700 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-950/20 text-xs gap-1 font-medium">
            <Server className="h-3 w-3" />
            <span>{isUz ? 'Tizim' : 'Система'}</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        );
    }
  };

  const exportLogsToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `texnikum2-audit-log-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const summary = getEntitySummary(log).toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        summary.includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        (log.userId && log.userId.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q)) ||
        JSON.stringify(log.newValues || {}).toLowerCase().includes(q);

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, searchQuery, actionFilter, entityFilter]);

  if (!isAdmin) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          {isUz ? 'Ruxsat cheklangan' : 'Доступ ограничен'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isUz
            ? 'Tizim audit jurnali faqat bosh administratorga ruxsat etilgan.'
            : 'Журнал аудита действий в системе доступен только главному администратору.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            {isUz ? 'Tizim audit jurnali' : 'Журнал аудита системы'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Barcha maʼmuriy amallarni roʻyxatga olish: yozuvlarni yaratish, oʻzgartirish, eʼlon qilish va oʻchirish'
              : 'Протоколирование всех административных операций: создание, модификация, публикации и удаление записей'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            data-tour="audit.refresh-btn"
            onClick={() => loadAuditLogs(true)}
            disabled={isLoading || isRefreshing}
            className="text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isUz ? 'Yangilash' : 'Обновить'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            data-tour="audit.export-btn"
            onClick={exportLogsToJson}
            disabled={filteredLogs.length === 0}
            className="text-xs h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {isUz ? 'Eksport (JSON)' : 'Экспорт (JSON)'}
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            data-tour="audit.search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isUz
                ? 'Nomi, mohiyat, ijrochi yoki IP boʻyicha qidirish...'
                : 'Поиск по названию, сущности, исполнителю или IP...'
            }
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
            <select
              data-tour="audit.action-filter"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm font-medium"
            >
              <option value="all">{isUz ? 'Barcha amallar' : 'Все действия'}</option>
              <option value="CREATE">CREATE (Yaratish)</option>
              <option value="UPDATE">UPDATE (Tahrirlash)</option>
              <option value="DELETE">DELETE (Oʻchirish)</option>
              <option value="PUBLISH">PUBLISH (Eʼlon qilish)</option>
              <option value="ARCHIVE">ARCHIVE (Arxivlash)</option>
            </select>
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-1 text-xs sm:text-sm font-medium"
          >
            <option value="all">{isUz ? 'Barcha boʻlimlar' : 'Все сущности'}</option>
            <option value="news">{isUz ? 'Yangiliklar (news)' : 'Новости (news)'}</option>
            <option value="administration">{isUz ? 'Rahbariyat (administration)' : 'Руководство (administration)'}</option>
            <option value="teachers">{isUz ? 'Oʻqituvchilar (teachers)' : 'Преподаватели (teachers)'}</option>
            <option value="specialties">{isUz ? 'Mutaxassisliklar (specialties)' : 'Специальности (specialties)'}</option>
            <option value="events">{isUz ? 'Tadbirlar (events)' : 'События (events)'}</option>
            <option value="pages">{isUz ? 'Sahifalar (pages)' : 'Страницы (pages)'}</option>
            <option value="contacts">{isUz ? 'Aloqa va kampuslar (contacts)' : 'Контакты и кампусы'}</option>
            <option value="media">{isUz ? 'Mediateka (media)' : 'Медиа (media)'}</option>
            <option value="users">{isUz ? 'Foydalanuvchilar (users)' : 'Пользователи (users)'}</option>
            <option value="system">{isUz ? 'Tizim (system)' : 'Система (system)'}</option>
          </select>
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {isUz
            ? `Koʻrsatilmoqda: ${filteredLogs.length} ta yozuv (jami: ${logs.length})`
            : `Показано: ${filteredLogs.length} записей (всего: ${logs.length})`}
        </span>
        {(actionFilter !== 'all' || entityFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setActionFilter('all');
              setEntityFilter('all');
              setSearchQuery('');
            }}
            className="text-primary hover:underline font-medium"
          >
            {isUz ? 'Barcha filtrlarni tozalash' : 'Сбросить фильтры'}
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div data-tour="audit.table" className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p>{isUz ? 'Audit yozuvlari yuklanmoqda...' : 'Загрузка записей аудита...'}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground space-y-3">
            <History className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="font-semibold">
              {isUz ? 'Audit hodisalari topilmadi' : 'События аудита не найдены'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActionFilter('all');
                setEntityFilter('all');
                setSearchQuery('');
              }}
              className="text-xs"
            >
              {isUz ? 'Filtrlarni bekor qilish' : 'Сбросить фильтры'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Vaqt' : 'Время'}</th>
                  <th className="py-3 px-4">{isUz ? 'Amal' : 'Действие'}</th>
                  <th className="py-3 px-4">{isUz ? 'Boʻlim' : 'Раздел'}</th>
                  <th className="py-3 px-4">{isUz ? 'Obyekt / Nomi' : 'Объект / Название'}</th>
                  <th className="py-3 px-4">{isUz ? 'Ijrochi' : 'Исполнитель'}</th>
                  <th className="py-3 px-4">{isUz ? 'IP manzil' : 'IP адрес'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Tafsilotlar' : 'Детали'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => {
                  const summary = getEntitySummary(log);
                  const userDisplay = getUserDisplayName(log.userId);

                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span>{new Date(log.createdAt).toLocaleString(isUz ? 'uz-UZ' : 'ru-RU')}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {getEntityBadge(log.entityType)}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-foreground text-xs truncate" title={summary}>
                          {summary}
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate" title={log.entityId}>
                          ID: {log.entityId}
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-medium text-foreground">{userDisplay.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                            {userDisplay.roleBadge}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 px-2.5 text-xs text-primary hover:text-primary/80"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {isUz ? 'Diff / Surat' : 'Diff / Снимок'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diff / Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={Boolean(selectedLog)}
          onClose={() => setSelectedLog(null)}
          title={
            isUz
              ? `Amal tafsilotlari: ${selectedLog.action} (${selectedLog.entityType})`
              : `Детали операции: ${selectedLog.action} (${selectedLog.entityType})`
          }
          description={
            isUz
              ? `Obyekt: ${getEntitySummary(selectedLog)} • Vaqt: ${new Date(selectedLog.createdAt).toLocaleString('uz-UZ')}`
              : `Объект: ${getEntitySummary(selectedLog)} • Время: ${new Date(selectedLog.createdAt).toLocaleString('ru-RU')}`
          }
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Карточка метаданных события */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-lg bg-muted/40 border border-border text-[11px]">
              <div>
                <span className="text-muted-foreground block">{isUz ? 'Amal:' : 'Действие:'}</span>
                <span className="font-bold">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isUz ? 'Boʻlim:' : 'Раздел:'}</span>
                <span className="font-semibold">{selectedLog.entityType}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isUz ? 'Ijrochi:' : 'Исполнитель:'}</span>
                <span className="font-semibold">{getUserDisplayName(selectedLog.userId).name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">IP:</span>
                <span className="font-mono">{selectedLog.ipAddress || '127.0.0.1'}</span>
              </div>
            </div>

            {/* Снимок предыдущего состояния */}
            {selectedLog.oldValues && (
              <div>
                <h4 className="font-semibold text-rose-600 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rose-500 inline-block"></span>
                  {isUz ? 'Oldingi holati (Old Values):' : 'Предыдущее состояние (Old Values):'}
                </h4>
                <pre className="p-3 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 font-mono overflow-x-auto text-[11px] leading-relaxed max-h-60 text-foreground">
                  {JSON.stringify(selectedLog.oldValues, null, 2)}
                </pre>
              </div>
            )}

            {/* Снимок нового состояния */}
            {selectedLog.newValues && (
              <div>
                <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block"></span>
                  {isUz ? 'Yangi holati (New Values):' : 'Новое состояние (New Values):'}
                </h4>
                <pre className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 font-mono overflow-x-auto text-[11px] leading-relaxed max-h-60 text-foreground">
                  {JSON.stringify(selectedLog.newValues, null, 2)}
                </pre>
              </div>
            )}

            {!selectedLog.oldValues && !selectedLog.newValues && (
              <p className="text-muted-foreground italic p-4 text-center">
                {isUz
                  ? 'Surat maʼlumotlari mavjud emas yoki tozalangan.'
                  : 'Данные снимка отсутствуют или были очищены политикой ротации.'}
              </p>
            )}

            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                {isUz ? 'Yopish' : 'Закрыть'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
