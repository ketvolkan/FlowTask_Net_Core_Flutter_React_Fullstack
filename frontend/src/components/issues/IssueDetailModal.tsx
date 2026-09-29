import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { StatusBadge, PriorityBadge, TypeBadge } from '../common/Badge';
import { issuesApi } from '../../api/issuesApi';
import { projectsApi } from '../../api/projectsApi';
import { sprintsApi } from '../../api/sprintsApi';
import { Issue, IssuePriority, IssueStatus, IssueType, ProjectMember, Sprint } from '../../types';
import { CommentList } from './CommentList';
import { AttachmentList } from './AttachmentList';
import { Trash2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { tr as dateFnsTr, enUS as dateFnsEn } from 'date-fns/locale';

interface IssueDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  members?: ProjectMember[];
  sprints?: Sprint[];
  onIssueUpdated: () => void;
  onIssueDeleted: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  isOpen,
  onClose,
  issueId,
  members = [],
  sprints = [],
  onIssueUpdated,
  onIssueDeleted,
}) => {
  const { t, language } = useLanguage();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form edit states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>('Todo');
  const [priority, setPriority] = useState<IssuePriority>('Medium');
  const [type, setType] = useState<IssueType>('Task');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState<string>('');

  const [localMembers, setLocalMembers] = useState<ProjectMember[]>(members);
  const [localSprints, setLocalSprints] = useState<Sprint[]>(sprints);

  useEffect(() => {
    if (members && members.length > 0) {
      setLocalMembers(members);
    }
  }, [members]);

  useEffect(() => {
    if (sprints && sprints.length > 0) {
      setLocalSprints(sprints);
    }
  }, [sprints]);

  const fetchIssueDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await issuesApi.getIssueById(issueId);
      setIssue(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setStatus(data.status);
      setPriority(data.priority);
      setType(data.type);
      setAssigneeId(data.assigneeId || '');
      setSprintId(data.sprintId || '');
      setStoryPoints(data.storyPoints);
      setDueDate(data.dueDate ? data.dueDate.split('T')[0] : '');

      if (data.projectId) {
        if (!members || members.length === 0) {
          projectsApi.getMembers(data.projectId).then((m) => {
            if (Array.isArray(m)) setLocalMembers(m);
          }).catch(console.error);
        }
        if (!sprints || sprints.length === 0) {
          sprintsApi.getProjectSprints(data.projectId).then((s) => {
            if (Array.isArray(s)) setLocalSprints(s);
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error(err);
      setError(t('issueDetail.notFound', 'Görev bulunamadı.'));
    } finally {
      setIsLoading(false);
    }
  }, [issueId, members, sprints, t]);

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssueDetails();
    }
  }, [isOpen, issueId, fetchIssueDetails]);

  const handleSave = async () => {
    if (!issue || !title.trim()) return;
    setIsSaving(true);
    setError(null);

    try {
      await issuesApi.updateIssue(issue.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        type,
        assigneeId: assigneeId && assigneeId.trim() !== '' ? assigneeId.trim() : undefined,
        sprintId: sprintId && sprintId.trim() !== '' ? sprintId.trim() : undefined,
        storyPoints: storyPoints !== undefined && storyPoints !== null && !isNaN(Number(storyPoints)) ? Number(storyPoints) : undefined,
        dueDate: dueDate && dueDate.trim() !== '' ? new Date(dueDate).toISOString() : undefined,
      });

      onIssueUpdated();
      fetchIssueDetails();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to update issue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!issue) return;
    if (!window.confirm(t('issueDetail.deleteConfirm', 'Bu görevi silmek istediğinize emin misiniz?'))) return;

    try {
      await issuesApi.deleteIssue(issue.id);
      onIssueDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete issue');
    }
  };

  const dateLocale = language === 'tr' ? dateFnsTr : dateFnsEn;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
    >
      {isLoading ? (
        <div className="relative py-16 text-center text-xs text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {t('issueDetail.loading', 'Görev detayları yükleniyor...')}
        </div>
      ) : !issue ? (
        <div className="relative py-16 text-center text-xs text-rose-500">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-0 right-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          {t('issueDetail.notFound', 'Görev bulunamadı.')}
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {/* Header Key & Actions */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-mono font-bold text-indigo-700">
                {issue.key}
              </span>
              <TypeBadge type={issue.type} />
              <PriorityBadge priority={issue.priority} />
              <StatusBadge status={issue.status} />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                onClick={handleDelete}
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                {t('common.delete', 'Sil')}
              </Button>
              <Button
                size="sm"
                isLoading={isSaving}
                onClick={handleSave}
                leftIcon={<Save className="h-3.5 w-3.5" />}
              >
                {t('common.save', 'Kaydet')}
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title={t('common.close', 'Kapat')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Title, Description, Comments, Attachments */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t('createIssue.issueTitle', 'Başlık')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {t('createIssue.issueDescription', 'Açıklama')}
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('createIssue.issueDescriptionPlaceholder', 'Detaylar, kabul kriterleri veya adımları ekleyin...')}
                  className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Attachments Section */}
              <div className="border-t border-slate-100 pt-4">
                <AttachmentList
                  issueId={issue.id}
                  attachments={issue.attachments || []}
                  onAttachmentChanged={fetchIssueDetails}
                />
              </div>

              {/* Comments Section */}
              <div className="border-t border-slate-100 pt-4">
                <CommentList
                  issueId={issue.id}
                  comments={issue.comments || []}
                  onCommentChanged={fetchIssueDetails}
                />
              </div>
            </div>

            {/* Right 1 Col: Metadata & Field Properties */}
            <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {t('issueDetail.details', 'Detaylar')}
              </h4>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('issueDetail.status', 'Durum')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IssueStatus)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todo">{t('status.todo', 'Yapılacak')}</option>
                  <option value="InProgress">{t('status.inProgress', 'Devam Eden')}</option>
                  <option value="InReview">{t('status.inReview', 'İncelemede')}</option>
                  <option value="Done">{t('status.done', 'Tamamlandı')}</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('issueDetail.priority', 'Öncelik')}</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Low">{t('priority.low', 'Düşük')}</option>
                  <option value="Medium">{t('priority.medium', 'Orta')}</option>
                  <option value="High">{t('priority.high', 'Yüksek')}</option>
                  <option value="Urgent">{t('priority.urgent', 'Acil')}</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('createIssue.type', 'Tip')}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IssueType)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Task">{t('type.task', 'Görev')}</option>
                  <option value="Bug">{t('type.bug', 'Hata')}</option>
                  <option value="Story">{t('type.story', 'Hikaye')}</option>
                  <option value="Epic">{t('type.epic', 'Epik')}</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('issueDetail.assignee', 'Sorumlu')}</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">{t('common.unassigned', 'Atanmamış')}</option>
                  {localMembers.map((m) => {
                    const name = m.userFullName || m.fullName || m.userEmail || m.email || 'İsimsiz Üye';
                    return (
                      <option key={m.userId} value={m.userId}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Sprint */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('issueDetail.sprint', 'Sprint')}</label>
                <select
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">{t('createIssue.noSprintBacklog', 'Backlog (Sprint Yok)')}</option>
                  {localSprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Story Points */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('issueDetail.storyPoints', 'Hikaye Puanı')}</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={storyPoints ?? ''}
                  onChange={(e) => setStoryPoints(e.target.value ? Number(e.target.value) : undefined)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. 3"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{t('issueDetail.dueDate', 'Bitiş Tarihi')}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Reporter Info */}
              <div className="pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-[11px] text-slate-400">{t('issueDetail.reporter', 'Oluşturan')}:</span>
                <div className="flex items-center gap-2 mt-1">
                  <UserAvatar name={issue.reporterName} avatarUrl={issue.reporterAvatarUrl} size="xs" />
                  <span className="font-semibold text-slate-800">{issue.reporterName || 'Unknown'}</span>
                </div>
              </div>

              {/* Created info */}
              <div className="text-[10px] text-slate-400">
                {t('issueDetail.created', 'Oluşturuldu')}: {format(new Date(issue.createdAt), 'MMM dd, yyyy HH:mm', { locale: dateLocale })}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
