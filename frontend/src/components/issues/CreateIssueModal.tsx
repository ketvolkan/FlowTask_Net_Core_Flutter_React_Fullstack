import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { issuesApi } from '../../api/issuesApi';
import { projectsApi } from '../../api/projectsApi';
import { sprintsApi } from '../../api/sprintsApi';
import { IssuePriority, IssueStatus, IssueType, Project, ProjectMember, Sprint } from '../../types';

interface CreateIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projects?: Project[];
  sprints?: Sprint[];
  members?: ProjectMember[];
  defaultSprintId?: string;
  defaultStatus?: IssueStatus;
  onIssueCreated: () => void;
  onOpenCreateProject?: () => void;
}

export const CreateIssueModal: React.FC<CreateIssueModalProps> = ({
  isOpen,
  onClose,
  projectId: initialProjectId,
  projects = [],
  sprints: initialSprints = [],
  members: initialMembers = [],
  defaultSprintId,
  defaultStatus = 'Todo',
  onIssueCreated,
  onOpenCreateProject,
}) => {
  const { t } = useLanguage();
  const [availableProjects, setAvailableProjects] = useState<Project[]>(projects);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || '');
  const [localSprints, setLocalSprints] = useState<Sprint[]>(initialSprints);
  const [localMembers, setLocalMembers] = useState<ProjectMember[]>(initialMembers);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<IssueType>('Task');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [status, setStatus] = useState<IssueStatus>(defaultStatus);
  const [sprintId, setSprintId] = useState<string>(defaultSprintId || '');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setSelectedProjectId(initialProjectId);
      } else if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
      setStatus(defaultStatus);
      setSprintId(defaultSprintId || '');
      setError(null);

      if (projects.length > 0) {
        setAvailableProjects(projects);
      } else {
        projectsApi.getProjects(1, 100).then((data) => {
          const list = data?.items || [];
          setAvailableProjects(list);
          if (list.length > 0 && !selectedProjectId && !initialProjectId) {
            setSelectedProjectId(list[0].id);
          }
        }).catch(console.error);
      }
    }
  }, [isOpen, initialProjectId, projects, defaultStatus, defaultSprintId]);

  // Load sprints & members when project changes
  useEffect(() => {
    if (!isOpen || !selectedProjectId) return;

    if (selectedProjectId === initialProjectId && initialSprints.length > 0) {
      setLocalSprints(initialSprints);
      setLocalMembers(initialMembers);
      return;
    }

    const loadMeta = async () => {
      try {
        const [sData, mData] = await Promise.all([
          sprintsApi.getProjectSprints(selectedProjectId),
          projectsApi.getMembers(selectedProjectId),
        ]);
        setLocalSprints(Array.isArray(sData) ? sData : []);
        setLocalMembers(Array.isArray(mData) ? mData : []);
      } catch {
        // ignore
      }
    };
    loadMeta();
  }, [isOpen, selectedProjectId, initialProjectId, initialSprints, initialMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError(t('board.selectProject', 'Lütfen bir proje seçin veya oluşturun.'));
      return;
    }

    if (!title.trim()) {
      setError(t('createIssue.issueTitle', 'Başlık') + ' zorunludur');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await issuesApi.createIssue(selectedProjectId, {
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        type,
        priority,
        status,
        sprintId: sprintId && sprintId.trim() !== '' ? sprintId.trim() : undefined,
        assigneeId: assigneeId && assigneeId.trim() !== '' ? assigneeId.trim() : undefined,
        storyPoints: storyPoints !== undefined && storyPoints !== null && !isNaN(Number(storyPoints)) ? Number(storyPoints) : undefined,
        dueDate: dueDate && dueDate.trim() !== '' ? new Date(dueDate).toISOString() : undefined,
      });

      setTitle('');
      setDescription('');
      setType('Task');
      setPriority('Medium');
      setStatus('Todo');
      setSprintId('');
      setAssigneeId('');
      setStoryPoints(undefined);
      setDueDate('');
      onIssueCreated();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: string[] | Record<string, string[]> } } };
      const data = e.response?.data;
      let msg = data?.message;
      if (!msg && data?.errors) {
        if (Array.isArray(data.errors)) {
          msg = data.errors.join(', ');
        } else if (typeof data.errors === 'object') {
          msg = Object.values(data.errors).flat().join(', ');
        }
      }
      setError(msg || t('createIssue.failed', 'Görev oluşturulamadı. Lütfen alanları kontrol ediniz.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('createIssue.title', 'Yeni Görev Oluştur')}
      description={t('createIssue.description', 'Bu proje için görev, hata, hikaye veya epik oluşturun.')}
      size="lg"
    >
      {!selectedProjectId && availableProjects.length === 0 ? (
        <div className="py-6 text-center space-y-4">
          <p className="text-sm text-slate-600">
            {t('createIssue.noProjects', 'Kullanılabilir proje bulunamadı. Görev oluşturmadan önce bir proje oluşturmalı veya bir projeye katılmalısınız.')}
          </p>
          {onOpenCreateProject && (
            <Button
              onClick={() => {
                onClose();
                onOpenCreateProject();
              }}
            >
              {t('createIssue.createNewProject', 'Yeni Proje Oluştur')}
            </Button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Project Selector if multiple projects */}
          {availableProjects.length > 1 && (
            <Select
              label={t('createIssue.project', 'Proje')}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
            >
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </Select>
          )}

          <Input
            label={t('createIssue.issueTitle', 'Başlık')}
            placeholder={t('createIssue.issueTitlePlaceholder', 'Ne yapılması gerekiyor?')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('createIssue.issueDescription', 'Açıklama')}
            </label>
            <textarea
              rows={3}
              placeholder={t('createIssue.issueDescriptionPlaceholder', 'Detaylar, kabul kriterleri veya adımları ekleyin...')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label={t('createIssue.type', 'Tip')}
              value={type}
              onChange={(e) => setType(e.target.value as IssueType)}
            >
              <option value="Task">{t('type.task', 'Görev')}</option>
              <option value="Bug">{t('type.bug', 'Hata')}</option>
              <option value="Story">{t('type.story', 'Hikaye')}</option>
              <option value="Epic">{t('type.epic', 'Epik')}</option>
            </Select>

            <Select
              label={t('createIssue.priority', 'Öncelik')}
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
            >
              <option value="Low">{t('priority.low', 'Düşük')}</option>
              <option value="Medium">{t('priority.medium', 'Orta')}</option>
              <option value="High">{t('priority.high', 'Yüksek')}</option>
              <option value="Urgent">{t('priority.urgent', 'Acil')}</option>
            </Select>

            <Select
              label={t('createIssue.initialStatus', 'Başlangıç Durumu')}
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
            >
              <option value="Todo">{t('status.todo', 'Yapılacak')}</option>
              <option value="InProgress">{t('status.inProgress', 'Devam Eden')}</option>
              <option value="InReview">{t('status.inReview', 'İncelemede')}</option>
              <option value="Done">{t('status.done', 'Tamamlandı')}</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label={t('createIssue.assignee', 'Sorumlu Kişi')}
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <option value="">{t('common.unassigned', 'Atanmamış')}</option>
              {localMembers.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userFullName}
                </option>
              ))}
            </Select>

            <Select
              label={t('createIssue.sprint', 'Sprint')}
              value={sprintId}
              onChange={(e) => setSprintId(e.target.value)}
            >
              <option value="">{t('createIssue.noSprintBacklog', 'Backlog (Sprint Yok)')}</option>
              {localSprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="number"
              label={t('createIssue.storyPoints', 'Hikaye Puanı (Story Points)')}
              placeholder="e.g. 1, 2, 3, 5, 8"
              min={0}
              max={100}
              value={storyPoints ?? ''}
              onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : undefined)}
            />

            <Input
              type="date"
              label={t('createIssue.dueDate', 'Bitiş Tarihi')}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel', 'İptal')}
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {t('createIssue.submit', 'Görev Oluştur')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
