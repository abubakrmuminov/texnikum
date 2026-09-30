'use client';

import * as React from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Award,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Specialty, BaseEducation } from '@college/shared';
import { ImageUploadField } from '@/components/admin/image-upload-field';
import { useAppLocale } from '@/components/i18n/locale-provider';

function slugify(text: string): string {
  const ru: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
    з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
    п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };
  return text
    .toLowerCase()
    .split('')
    .map((char) => ru[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function AdminSpecialtiesPage() {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [specialties, setSpecialties] = React.useState<Specialty[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Specialty | null>(null);

  // Form State
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [qualification, setQualification] = React.useState('');
  const [durationText, setDurationText] = React.useState('3 yil 10 oy');
  const [durationMonths, setDurationMonths] = React.useState<number>(46);
  const [baseEducation, setBaseEducation] = React.useState<BaseEducation>('9_classes');
  const [budgetPlaces, setBudgetPlaces] = React.useState<number>(50);
  const [commercialPlaces, setCommercialPlaces] = React.useState<number>(25);
  const [costPerYear, setCostPerYear] = React.useState<string>('9500000');
  const [passingScore, setPassingScore] = React.useState<string>('4.5');
  const [description, setDescription] = React.useState('');
  const [careerOpportunities, setCareerOpportunities] = React.useState('');
  const [coverImageUrl, setCoverImageUrl] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [formError, setFormError] = React.useState<string | null>(null);

  const loadSpecialties = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getSpecialties();
      setSpecialties(data.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Mutaxassisliklarni yuklab boʻlmadi' : 'Не удалось загрузить специальности')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isUz]);

  React.useEffect(() => {
    loadSpecialties();
  }, [loadSpecialties]);

  const openCreateModal = () => {
    setEditingItem(null);
    setCode('40610101');
    setName('');
    setQualification(
      isUz ? 'Dasturiy injiniring texnigi' : 'Техник программной инженерии'
    );
    setDurationText(isUz ? '3 yil 10 oy' : '3 года 10 месяцев');
    setDurationMonths(46);
    setBaseEducation('9_classes');
    setBudgetPlaces(50);
    setCommercialPlaces(25);
    setCostPerYear('9500000');
    setPassingScore('4.5');
    setDescription('');
    setCareerOpportunities('');
    setCoverImageUrl('');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Specialty) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setQualification(item.qualification);
    setDurationText(item.durationText);
    setDurationMonths(item.durationMonths);
    setBaseEducation(item.baseEducation);
    setBudgetPlaces(item.budgetPlaces);
    setCommercialPlaces(item.commercialPlaces);
    setCostPerYear(item.costPerYear !== null ? String(item.costPerYear) : '');
    setPassingScore(item.passingScore !== null ? String(item.passingScore) : '');
    setDescription(item.description);
    setCareerOpportunities(item.careerOpportunities || '');
    setCoverImageUrl(item.coverImageUrl || '');
    setIsActive(item.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !name.trim()) {
      setFormError(
        isUz
          ? 'Mutaxassislik kodi va nomini kiriting'
          : 'Укажите код и наименование специальности'
      );
      return;
    }

    const payload: Partial<Specialty> = {
      code: code.trim(),
      name: name.trim(),
      slug: slugify(name),
      qualification: qualification.trim(),
      durationText: durationText.trim(),
      durationMonths: Number(durationMonths) || 36,
      baseEducation,
      budgetPlaces: Number(budgetPlaces) || 0,
      commercialPlaces: Number(commercialPlaces) || 0,
      costPerYear: costPerYear ? Number(costPerYear) : null,
      passingScore: passingScore ? Number(passingScore) : null,
      description: description.trim(),
      careerOpportunities: careerOpportunities.trim() || null,
      coverImageUrl: coverImageUrl.trim() || null,
      isActive,
      orderIndex: editingItem?.orderIndex ?? specialties.length + 1,
    };

    try {
      if (editingItem) {
        await apiClient.updateSpecialty(editingItem.id, payload);
        setSpecialties((prev) =>
          prev.map((s) => (s.id === editingItem.id ? ({ ...s, ...payload } as Specialty) : s))
        );
        setSuccess(
          isUz ? 'Mutaxassislik muvaffaqiyatli yangilandi' : 'Специальность успешно обновлена'
        );
      } else {
        const created = await apiClient.createSpecialty(payload);
        setSpecialties((prev) => [created, ...prev]);
        setSuccess(
          isUz ? 'Mutaxassislik katalogga qoʻshildi' : 'Специальность добавлена в каталог'
        );
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : (isUz ? 'Mutaxassislikni saqlashda xatolik yuz berdi' : 'Ошибка при сохранении специальности')
      );
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    const confirmMsg = isUz
      ? `Haqiqatan ham «${itemName}» mutaxassisligini oʻchirmoqchimisiz?`
      : `Вы уверены, что хотите удалить специальность «${itemName}»?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }
    try {
      await apiClient.deleteSpecialty(id);
      setSpecialties((prev) => prev.filter((s) => s.id !== id));
      setSuccess(
        isUz ? `«${itemName}» mutaxassisligi oʻchirildi` : `Специальность «${itemName}» удалена`
      );
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      alert(isUz ? 'Mutaxassislikni oʻchirib boʻlmadi' : 'Не удалось удалить специальность');
    }
  };

  const filteredSpecialties = React.useMemo(() => {
    return specialties.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.qualification.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [specialties, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isUz ? 'Mutaxassisliklar va kasblar' : 'Специальности и профессии'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isUz
              ? 'Texnikum taʼlim dasturlari, qabul reja koʻrsatkichlari (grant / toʻlov-kontrakt) va tavsiflarini boshqarish'
              : 'Управление образовательными программами техникума, контрольными цифрами приема (грант / контракт) и описаниями'}
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          {isUz ? 'Mutaxassislik qoʻshish' : 'Добавить специальность'}
        </Button>
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
          placeholder={
            isUz ? 'Kodi (40610101), nomi boʻyicha qidiruv...' : 'Поиск по коду (40610101), названию...'
          }
          className="pl-9 h-10"
        />
      </div>

      {/* Specialties Table */}
      <div className="rounded-xl border bg-card shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {isUz ? 'Mutaxassisliklar yuklanmoqda...' : 'Загрузка специальностей...'}
          </div>
        ) : filteredSpecialties.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {isUz ? 'Mutaxassisliklar topilmadi' : 'Специальности не найдены'}
            </p>
            <Button variant="outline" size="sm" onClick={openCreateModal}>
              {isUz ? 'Mutaxassislik qoʻshish' : 'Добавить специальность'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                <tr>
                  <th className="py-3 px-4">{isUz ? 'Kod / Nomi' : 'Код / Название'}</th>
                  <th className="py-3 px-4">{isUz ? 'Malaka' : 'Квалификация'}</th>
                  <th className="py-3 px-4">{isUz ? 'Muddat / Negiz' : 'Срок / База'}</th>
                  <th className="py-3 px-4">{isUz ? 'Oʻrinlar (grant / kontr.)' : 'Места (грант / контр.)'}</th>
                  <th className="py-3 px-4">{isUz ? 'Oʻtish balli' : 'Балл аттестата'}</th>
                  <th className="py-3 px-4 text-right">{isUz ? 'Amallar' : 'Действия'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSpecialties.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {s.code}
                        </span>
                        <div className="font-semibold text-foreground">{s.name}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-primary/70" />
                        {s.qualification}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      <div>{s.durationText}</div>
                      <Badge variant="outline" className="text-[10px] mt-0.5">
                        {s.baseEducation === '9_classes'
                          ? (isUz ? '9-sinf negizida' : 'На базе 9 кл.')
                          : s.baseEducation === '11_classes'
                          ? (isUz ? '11-sinf negizida' : 'На базе 11 кл.')
                          : (isUz ? '9 va 11-sinf' : '9 и 11 кл.')}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-xs text-foreground">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-emerald-600 font-bold">{s.budgetPlaces}</span>{' '}
                        {isUz ? 'gr' : 'г'} /{' '}
                        <span>{s.commercialPlaces}</span> {isUz ? 'k' : 'к'}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs">
                      {s.passingScore !== null ? (
                        <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded">
                          {s.passingScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(s)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          title={isUz ? 'Tahrirlash' : 'Редактировать'}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(s.id, s.name)}
                          className="h-8 w-8 p-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          title={isUz ? 'Oʻchirish' : 'Удалить'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal for Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingItem
            ? (isUz ? 'Mutaxassislikni tahrirlash' : 'Редактирование специальности')
            : (isUz ? 'Yangi mutaxassislik qoʻshish' : 'Добавление специальности техникума')
        }
        description={
          isUz
            ? 'Taʼlim dasturi parametrlari va qabul reja koʻrsatkichlarini kiriting'
            : 'Заполните параметры образовательной программы и контрольные цифры приема'
        }
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Mutaxassislik kodi' : 'Код специальности'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="40610101"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                {isUz ? 'Mutaxassislik nomi' : 'Наименование специальности'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kompyuter injiniringi"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Beriladigan malaka' : 'Присваиваемая квалификация'}{' '}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Dasturchi-texnik"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Taʼlim negizi' : 'Базовое образование для поступления'}
              </label>
              <select
                value={baseEducation}
                onChange={(e) => setBaseEducation(e.target.value as BaseEducation)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="9_classes">
                  {isUz ? '9-sinf negizida' : 'На базе 9 классов'}
                </option>
                <option value="11_classes">
                  {isUz ? '11-sinf negizida' : 'На базе 11 классов'}
                </option>
                <option value="both">
                  {isUz ? '9 va 11-sinf negizida' : 'На базе 9 и 11 классов'}
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Oʻqish muddati (matn)' : 'Срок обучения (текст)'}
              </label>
              <Input
                value={durationText}
                onChange={(e) => setDurationText(e.target.value)}
                placeholder={isUz ? '3 yil 10 oy' : '3 года 10 месяцев'}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Oʻqish muddati (oy)' : 'Срок обучения в месяцах'}
              </label>
              <Input
                type="number"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Davlat granti boʻyicha oʻrinlar' : 'Мест по государственному гранту'}
              </label>
              <Input
                type="number"
                min="0"
                value={budgetPlaces}
                onChange={(e) => setBudgetPlaces(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Toʻlov-kontrakt boʻyicha oʻrinlar' : 'Мест на платно-контрактной основе'}
              </label>
              <Input
                type="number"
                min="0"
                value={commercialPlaces}
                onChange={(e) => setCommercialPlaces(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Yillik kontrakt miqdori (soʻm)' : 'Стоимость обучения (сум/год)'}
              </label>
              <Input
                type="number"
                value={costPerYear}
                onChange={(e) => setCostPerYear(e.target.value)}
                placeholder="9500000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz
                  ? 'Oʻtgan yilgi oʻtish bali (attestat)'
                  : 'Проходной балл аттестата прошлого года'}
              </label>
              <Input
                type="number"
                step="0.01"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                placeholder="4.65"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <ImageUploadField
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                label={isUz ? 'Mutaxassislik rasmi' : 'Обложка специальности'}
                description={
                  isUz
                    ? 'Yoʻnalish sahifasining asosiy rasmi (16:9, JPG, PNG, WEBP, 10 MB gacha)'
                    : 'Основное изображение страницы направления (16:9, JPG, PNG, WEBP, до 10 МБ)'
                }
                bucket="news-media"
                aspectRatio="video"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz ? 'Mutaxassislik tavsifi' : 'Описание специальности'}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={
                  isUz
                    ? 'Ushbu mutaxassislik dasturiy taʼminot yaratish, sinash va tatbiq etish...'
                    : 'Специальность готовит специалистов по разработке...'
                }
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">
                {isUz
                  ? 'Karyera imkoniyatlari va bitiruvchilar qayerda ishlaydi'
                  : 'Карьерные перспективы и кем работают выпускники'}
              </label>
              <Textarea
                value={careerOpportunities}
                onChange={(e) => setCareerOpportunities(e.target.value)}
                rows={2}
                placeholder={
                  isUz
                    ? 'Kichik web-dasturchi, testlovchi muhandis, tizim administratori...'
                    : 'Младший веб-разработчик, инженер по тестированию, системный аналитик...'
                }
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
                <span>
                  {isUz
                    ? 'Faol dastur («Abituriyentlarga» va «Mutaxassisliklar» boʻlimida koʻrsatish)'
                    : 'Активная программа (отображать в разделе «Поступающим» и «Специальности»)'}
                </span>
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
              {isUz ? 'Bekor qilish' : 'Отмена'}
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
              {editingItem
                ? (isUz ? 'Oʻzgarishlarni saqlash' : 'Сохранить изменения')
                : (isUz ? 'Mutaxassislikni yaratish' : 'Создать специальность')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
