'use client';

import * as React from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/components/admin/admin-auth-context';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { apiClient } from '@/lib/api-client';
import { UserProfile, UserRole } from '@college/shared';

export default function AdminUsersPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const { user: currentUser, hasRole } = useAdminAuth();
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const isAdmin = hasRole(UserRole.ADMIN);

  const loadUsers = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isUz
          ? 'Foydalanuvchilar roʻyxatini yuklab boʻlmadi'
          : 'Не удалось загрузить список пользователей'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUz]);

  React.useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole, userFullName: string) => {
    if (!isAdmin) {
      alert(
        isUz
          ? 'Faqat administrator foydalanuvchilar rolini oʻzgartirishi mumkin'
          : 'Только администратор может изменять роли пользователей'
      );
      return;
    }

    try {
      await apiClient.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setSuccess(
        isUz
          ? `«${userFullName}» foydalanuvchisining roli oʻzgartirildi: ${getRoleLabel(newRole)}`
          : `Роль пользователя «${userFullName}» изменена на: ${getRoleLabel(newRole)}`
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      alert(
        isUz
          ? 'Foydalanuvchi rolini yangilab boʻlmadi'
          : 'Не удалось обновить роль пользователя'
      );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 gap-1 text-xs">
            <ShieldAlert className="h-3 w-3" />
            {isUz ? 'Administrator' : 'Администратор'}
          </Badge>
        );
      case UserRole.EDITOR:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1 text-xs">
            <ShieldCheck className="h-3 w-3" />
            {isUz ? 'Muharrir' : 'Редактор'}
          </Badge>
        );
      case UserRole.MODERATOR:
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-xs">
            <Shield className="h-3 w-3" />
            {isUz ? 'Moderator' : 'Модератор'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{isUz ? 'Foydalanuvchi' : 'Пользователь'}</Badge>;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return isUz ? 'Administrator (toʻliq huquq)' : 'Администратор (полный доступ)';
      case UserRole.EDITOR:
        return isUz ? 'Muharrir (yangiliklar, tadbirlar, sahifalar)' : 'Редактор (новости, события, страницы)';
      case UserRole.MODERATOR:
        return isUz ? 'Moderator (koʻrish va qoralama)' : 'Модератор (просмотр и черновики)';
      default:
        return role;
    }
  };

  const filteredUsers = React.useMemo(() => {
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Route Guard View for Non-Admin
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
            ? 'Foydalanuvchilar hisoblari va huquqlarini boshqarish faqat kollej bosh administratoriga ruxsat etilgan.'
            : 'Управление учетными записями и правами доступа доступно только главному администратору колледжа.'}
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
            <Users className="h-6 w-6 text-primary" />
            {isUz ? 'Foydalanuvchilar va rollar (RBAC)' : 'Пользователи и роли (RBAC)'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Kollej xodimlari hisoblarini boshqarish va kirish huquqlari darajalarini taqsimlash'
              : 'Управление учетными записями персонала колледжа и распределение уровней доступа'}
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isUz ? 'FIO yoki email boʻyicha qidiruv...' : 'Поиск по имени или email...'}
          className="pl-9 h-10"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Foydalanuvchilar roʻyxati yuklanmoqda...' : 'Загрузка списка пользователей...'}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Foydalanuvchilar topilmadi' : 'Пользователи не найдены'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Foydalanuvchi' : 'Пользователь'}</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">{isUz ? 'Joriy roli' : 'Текущая роль'}</th>
                  <th className="py-3 px-4">{isUz ? 'Kirish darajasini oʻzgartirish' : 'Изменить уровень доступа'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Roʻyxatdan oʻtgan' : 'Регистрация'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              {u.fullName}
                              {isCurrent && (
                                <Badge variant="outline" className="text-[10px] py-0">
                                  {isUz ? 'Siz' : 'Вы'}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              ID: {u.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                        {u.email}
                      </td>

                      <td className="py-3 px-4">
                        {getRoleBadge(u.role)}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          disabled={isCurrent}
                          onChange={(e) =>
                            handleRoleChange(u.id, e.target.value as UserRole, u.fullName)
                          }
                          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                        >
                          <option value={UserRole.ADMIN}>
                            {isUz ? 'Administrator (Admin)' : 'Администратор (Admin)'}
                          </option>
                          <option value={UserRole.EDITOR}>
                            {isUz ? 'Muharrir (Editor)' : 'Редактор (Editor)'}
                          </option>
                          <option value={UserRole.MODERATOR}>
                            {isUz ? 'Moderator (Moderator)' : 'Модератор (Moderator)'}
                          </option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(u.createdAt).toLocaleDateString(isUz ? 'uz-UZ' : 'ru-RU')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
