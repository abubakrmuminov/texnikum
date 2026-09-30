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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/dialog';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { apiClient } from '@/lib/api-client';
import { AuditLogItem, AuditAction, UserRole } from '@college/shared';

export default function AdminAuditPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const { hasRole } = useAdminAuth();
  const isAdmin = hasRole(UserRole.ADMIN);

  const [logs, setLogs] = React.useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [actionFilter, setActionFilter] = React.useState<string>('all');
  const [entityFilter, setEntityFilter] = React.useState<string>('all');

  // Diff Modal
  const [selectedLog, setSelectedLog] = React.useState<AuditLogItem | null>(null);

  const loadAuditLogs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAuditLogs({ limit: 100 });
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
    }
  }, [isUz]);

  React.useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 text-xs">CREATE</Badge>;
      case 'UPDATE':
        return <Badge variant="outline" className="text-blue-600 border-blue-500/20 text-xs">UPDATE</Badge>;
      case 'DELETE':
        return <Badge variant="outline" className="text-red-600 border-red-500/20 text-xs">DELETE</Badge>;
      case 'PUBLISH':
        return <Badge variant="outline" className="text-purple-600 border-purple-500/20 text-xs">PUBLISH</Badge>;
      case 'ARCHIVE':
        return <Badge variant="outline" className="text-amber-600 border-amber-500/20 text-xs">ARCHIVE</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.userId && log.userId.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAction =
        actionFilter === 'all' || log.action === actionFilter;
      const matchesEntity =
        entityFilter === 'all' || log.entityType === entityFilter;
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
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isUz ? 'Mohiyat yoki ID boʻyicha qidiruv...' : 'Поиск по сущности или ID...'}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="all">{isUz ? 'Barcha amallar' : 'Все действия'}</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="PUBLISH">PUBLISH</option>
            <option value="ARCHIVE">ARCHIVE</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="all">{isUz ? 'Barcha boʻlimlar' : 'Все сущности'}</option>
            <option value="news">{isUz ? 'Yangiliklar (news)' : 'Новости (news)'}</option>
            <option value="teachers">{isUz ? 'Oʻqituvchilar (teachers)' : 'Преподаватели (teachers)'}</option>
            <option value="specialties">{isUz ? 'Mutaxassisliklar (specialties)' : 'Специальности (specialties)'}</option>
            <option value="events">{isUz ? 'Tadbirlar (events)' : 'События (events)'}</option>
            <option value="schedule">{isUz ? 'Dars jadvali (schedule)' : 'Расписание (schedule)'}</option>
            <option value="pages">{isUz ? 'Sahifalar (pages)' : 'Страницы (pages)'}</option>
            <option value="media">{isUz ? 'Mediateka (media)' : 'Медиа (media)'}</option>
            <option value="users">{isUz ? 'Foydalanuvchilar (users)' : 'Пользователи (users)'}</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Audit yozuvlari yuklanmoqda...' : 'Загрузка записей аудита...'}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Audit hodisalari topilmadi' : 'События аудита не найдены'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Vaqt' : 'Время'}</th>
                  <th className="py-3 px-4">{isUz ? 'Amal' : 'Действие'}</th>
                  <th className="py-3 px-4">{isUz ? 'Boʻlim / Mohiyat' : 'Сущность'}</th>
                  <th className="py-3 px-4">{isUz ? 'Yozuv ID' : 'ID записи'}</th>
                  <th className="py-3 px-4">{isUz ? 'IP manzil' : 'IP адрес'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Tafsilotlar' : 'Детали'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(log.createdAt).toLocaleString(isUz ? 'uz-UZ' : 'ru-RU')}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>

                    <td className="py-3 px-4 font-medium text-foreground">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        {log.entityType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {log.entityId.slice(0, 12)}...
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                      {log.ipAddress || '127.0.0.1'}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 px-2 text-xs text-primary hover:text-primary/80"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        {isUz ? 'Surat (Diff)' : 'Снимок (Diff)'}
                      </Button>
                    </td>
                  </tr>
                ))}
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
              ? `Yozuv: ${selectedLog.entityId} • Vaqt: ${new Date(selectedLog.createdAt).toLocaleString('uz-UZ')}`
              : `Запись: ${selectedLog.entityId} • Время: ${new Date(selectedLog.createdAt).toLocaleString('ru-RU')}`
          }
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            {selectedLog.oldValues && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-1">
                  {isUz ? 'Oldingi holati (Old Values):' : 'Предыдущее состояние (Old Values):'}
                </h4>
                <pre className="p-3 rounded-lg bg-muted font-mono overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(selectedLog.oldValues, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.newValues && (
              <div>
                <h4 className="font-semibold text-muted-foreground mb-1">
                  {isUz ? 'Yangi holati (New Values):' : 'Новое состояние (New Values):'}
                </h4>
                <pre className="p-3 rounded-lg bg-muted font-mono overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(selectedLog.newValues, null, 2)}
                </pre>
              </div>
            )}

            {!selectedLog.oldValues && !selectedLog.newValues && (
              <p className="text-muted-foreground italic">
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
