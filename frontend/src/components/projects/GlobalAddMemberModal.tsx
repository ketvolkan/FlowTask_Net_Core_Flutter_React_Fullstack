import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { DepartmentSelect } from '../common/DepartmentSelect';
import { projectsApi } from '../../api/projectsApi';
import { Project, ProjectRole } from '../../types';
import { UserPlus, CheckCircle2 } from 'lucide-react';

interface GlobalAddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const GlobalAddMemberModal: React.FC<GlobalAddMemberModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || '');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Yazılım & Mühendislik');
  const [role, setRole] = useState<ProjectRole>('Member');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      projectsApi.getProjects(1, 100).then((data) => {
        const list = data?.items || [];
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(defaultProjectId || list[0].id);
        }
      }).catch(console.error);
      setIsSuccess(false);
      setError(null);
      setEmail('');
      setRole('Member');
    }
  }, [isOpen, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError(t('membersModal.selectProject', 'Lütfen bir proje seçiniz.'));
      return;
    }
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await projectsApi.addMember(selectedProjectId, {
        email: email.trim(),
        role,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || t('membersModal.addFailed', 'Üye eklenirken bir hata oluştu. E-postayı kontrol ediniz.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('membersModal.quickAddTitle', 'Projeye Üye / Kullanıcı Ekle')}
      description={t('membersModal.quickAddDesc', 'Bir projeye e-posta adresi ve departman seçimiyle yeni bir ekip üyesi davet edin.')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{t('membersModal.addSuccess', 'Kullanıcı başarıyla projeye eklendi!')}</span>
          </div>
        )}

        <Select
          label={t('createIssue.project', 'Proje')}
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          required
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.key})
            </option>
          ))}
        </Select>

        <Input
          type="email"
          label={t('membersModal.userEmail', 'Kullanıcı E-Posta Adresi')}
          placeholder={t('membersModal.emailPlaceholder', 'Örn: uye@flowtask.com')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Department Dropdown with Manager Creation */}
        <DepartmentSelect
          label="Departman / Birim"
          value={department}
          onChange={setDepartment}
          allowCreate={true}
        />

        <Select
          label={t('membersModal.role', 'Proje Yetkisi / Rol')}
          value={role}
          onChange={(e) => setRole(e.target.value as ProjectRole)}
        >
          <option value="Member">{t('role.member', 'Üye (Görev alabilir, pano kullanabilir)')}</option>
          <option value="Admin">{t('role.admin', 'Yönetici (Sprint yönetimi & üye ekleme)')}</option>
          <option value="Viewer">{t('role.viewer', 'Gözlemci (Sadece izleme yetkisi)')}</option>
        </Select>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t('common.cancel', 'İptal')}
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            {t('membersModal.addMember', 'Üye Ekle')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
