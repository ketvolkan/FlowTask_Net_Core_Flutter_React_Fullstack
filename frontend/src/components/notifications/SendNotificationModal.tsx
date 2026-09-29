import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { DepartmentSelect } from '../common/DepartmentSelect';
import { notificationsApi } from '../../api/notificationsApi';
import { adminApi } from '../../api/adminApi';
import { User } from '../../types';
import { isAuthorizedUser } from '../../utils/permissionUtils';
import {
  Send,
  Users,
  Building2,
  Globe2,
  CheckCircle2,
  Search,
  Check,
  Megaphone,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent?: () => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  onSent,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [targetType, setTargetType] = useState<'All' | 'SpecificUsers' | 'Department'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<number>(8); // 8: SystemAlert

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSend = isAuthorizedUser(user);

  useEffect(() => {
    if (isOpen && canSend) {
      setIsLoadingUsers(true);
      adminApi
        .getAllUsers(1, 100)
        .then((res) => {
          setAllUsers(res?.items || []);
        })
        .catch(console.error)
        .finally(() => setIsLoadingUsers(false));

      // Reset fields
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setTargetType('All');
      setSelectedUserIds([]);
      setSelectedDepartment('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, canSend]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    setSelectedUserIds(allUsers.map((u) => u.id));
  };

  const handleClearSelectedUsers = () => {
    setSelectedUserIds([]);
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) {
      setError(t('notifications.unauthorized', 'Bildirim gönderme yetkiniz bulunmamaktadır.'));
      return;
    }

    if (!title.trim() || !message.trim()) {
      setError(t('notifications.fillFields', 'Lütfen başlık ve mesaj alanlarını doldurunuz.'));
      return;
    }

    if (targetType === 'SpecificUsers' && selectedUserIds.length === 0) {
      setError(t('notifications.selectAtLeastOneUser', 'Lütfen en az bir kullanıcı seçiniz.'));
      return;
    }

    if (targetType === 'Department' && !selectedDepartment.trim()) {
      setError(t('notifications.selectDepartment', 'Lütfen bir departman seçiniz.'));
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const res = await notificationsApi.sendNotification({
        title: title.trim(),
        message: message.trim(),
        type: notificationType,
        linkUrl: linkUrl.trim() || undefined,
        targetType,
        targetUserIds: targetType === 'SpecificUsers' ? selectedUserIds : undefined,
        department: targetType === 'Department' ? selectedDepartment.trim() : undefined,
      });

      setSuccessMessage(res?.message || t('notifications.sentSuccess', 'Bildirim başarıyla gönderildi!'));
      onSent?.();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || t('notifications.sendFailed', 'Bildirim gönderilemedi.'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('notifications.sendTitle', 'Kullanıcılara Bildirim / Duyuru Gönder')}
      description={t('notifications.sendSubtitle', 'Tüm şirket üyelerine veya belirli kullanıcılara anlık duyuru iletin.')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Target Audience Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {t('notifications.targetAudience', 'Hedef Kitle / Alıcılar')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setTargetType('All')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                targetType === 'All'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  targetType === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Globe2 className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={`text-xs font-bold ${
                    targetType === 'All' ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {t('notifications.allUsers', 'Tüm Kullanıcılar')}
                </p>
                <p className="text-[10px] text-slate-500">{t('notifications.allDesc', 'Genel şirket duyurusu')}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('SpecificUsers')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                targetType === 'SpecificUsers'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  targetType === 'SpecificUsers'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={`text-xs font-bold ${
                    targetType === 'SpecificUsers' ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {t('notifications.specificUsers', 'Seçili Kişiler')}
                </p>
                <p className="text-[10px] text-slate-500">
                  {selectedUserIds.length > 0
                    ? `${selectedUserIds.length} kişi seçildi`
                    : 'Listeden kullanıcı seç'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('Department')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                targetType === 'Department'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600/30'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  targetType === 'Department'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={`text-xs font-bold ${
                    targetType === 'Department' ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {t('notifications.byDepartment', 'Departmana Özel')}
                </p>
                <p className="text-[10px] text-slate-500">
                  {selectedDepartment || 'Departman seç'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Conditional Department Selector */}
        {targetType === 'Department' && (
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
            <DepartmentSelect
              label={t('notifications.selectTargetDept', 'Hedef Departmanı Seçin')}
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              allowCreate={false}
              required
            />
          </div>
        )}

        {/* Conditional Specific Users Picker */}
        {targetType === 'SpecificUsers' && (
          <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {t('notifications.selectUsersList', 'Kullanıcıları Seçin')} ({selectedUserIds.length} seçili)
              </span>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSelectAllUsers}
                  className="font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {t('notifications.selectAll', 'Tümünü Seç')}
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={handleClearSelectedUsers}
                  className="font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  {t('notifications.clearAll', 'Temizle')}
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('notifications.searchUsersPlaceholder', 'İsim, e-posta veya departmana göre ara...')}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* User List with Checkboxes */}
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 rounded-xl bg-white border border-slate-200">
              {isLoadingUsers ? (
                <div className="py-4 text-center text-xs text-slate-400">{t('admin.loadingUsers', 'Kullanıcılar yükleniyor...')}</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">{t('admin.noUsersMatch', 'Kullanıcı bulunamadı.')}</div>
              ) : (
                filteredUsers.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      onClick={() => toggleUserSelection(u.id)}
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors text-xs ${
                        isChecked ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {u.email} {u.department ? `• ${u.department}` : ''}
                          </p>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Notification Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('notifications.type', 'Bildirim Türü')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setNotificationType(8)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                notificationType === 8
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Megaphone className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t('notifications.typeAnnouncement', 'Duyuru')}</span>
            </button>

            <button
              type="button"
              onClick={() => setNotificationType(1)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                notificationType === 1
                  ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Info className="h-3.5 w-3.5 text-blue-600" />
              <span>{t('notifications.typeInfo', 'Bilgilendirme')}</span>
            </button>

            <button
              type="button"
              onClick={() => setNotificationType(2)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                notificationType === 2
                  ? 'border-amber-600 bg-amber-50 text-amber-700 ring-1 ring-amber-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>{t('notifications.typeAlert', 'Önemli / Uyarı')}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <Input
          label={t('notifications.titleLabel', 'Bildirim Başlığı')}
          placeholder={t('notifications.titlePlaceholder', 'Örn: Planlı Sunucu Bakımı veya Yeni Sprint Başlangıcı')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            {t('notifications.messageLabel', 'Bildirim Mesajı')} <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            placeholder={t('notifications.messagePlaceholder', 'Tüm ekibin görmesini istediğiniz duyuru detayını yazınız...')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Link URL (Optional) */}
        <Input
          label={t('notifications.linkUrlLabel', 'Yönlendirme Bağlantısı (Opsiyonel)')}
          placeholder="/board veya /projects"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />

        {/* Modal Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel', 'İptal')}
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isSending}
            leftIcon={<Send className="h-4 w-4" />}
          >
            {t('notifications.sendBtn', 'Bildirimi Gönder')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
