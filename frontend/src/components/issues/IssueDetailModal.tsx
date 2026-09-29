import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { StatusBadge, PriorityBadge, TypeBadge } from '../common/Badge';
import { issuesApi } from '../../api/issuesApi';
import { Issue, IssuePriority, IssueStatus, IssueType, ProjectMember, Sprint } from '../../types';
import { CommentList } from './CommentList';
import { AttachmentList } from './AttachmentList';
import { Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';

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
    } catch (err) {
      console.error(err);
      setError('Failed to load issue details');
    } finally {
      setIsLoading(false);
    }
  }, [issueId]);

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
        assigneeId: assigneeId || undefined,
        sprintId: sprintId || undefined,
        storyPoints: storyPoints ? Number(storyPoints) : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
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
    if (!window.confirm(`Are you sure you want to delete ${issue.key}?`)) return;

    try {
      await issuesApi.deleteIssue(issue.id);
      onIssueDeleted();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to delete issue');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
    >
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading issue details...</div>
      ) : !issue ? (
        <div className="py-16 text-center text-xs text-rose-500">Issue not found.</div>
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
                Delete
              </Button>
              <Button
                size="sm"
                isLoading={isSaving}
                onClick={handleSave}
                leftIcon={<Save className="h-3.5 w-3.5" />}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Title, Description, Comments, Attachments */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title
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
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a detailed description..."
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
                Details & Properties
              </h4>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IssueStatus)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Todo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="InReview">In Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as IssueType)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Task">Task</option>
                  <option value="Bug">Bug</option>
                  <option value="Story">Story</option>
                  <option value="Epic">Epic</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.userFullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sprint */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Sprint</label>
                <select
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Backlog (No Sprint)</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Story Points */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Story Points</label>
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
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Reporter Info */}
              <div className="pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-[11px] text-slate-400">Reporter:</span>
                <div className="flex items-center gap-2 mt-1">
                  <UserAvatar name={issue.reporterName} avatarUrl={issue.reporterAvatarUrl} size="xs" />
                  <span className="font-semibold text-slate-800">{issue.reporterName || 'Unknown'}</span>
                </div>
              </div>

              {/* Created info */}
              <div className="text-[10px] text-slate-400">
                Created on {format(new Date(issue.createdAt), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
