import React from 'react';
import { Issue, Sprint } from '../../types';
import { SprintStatusBadge, StatusBadge, PriorityBadge, TypeBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { UserAvatar } from '../common/UserAvatar';
import { Play, CheckCircle2, Plus, Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';

interface SprintSectionProps {
  sprint?: Sprint;
  isBacklog?: boolean;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onQuickAddIssue: (sprintId?: string) => void;
  onStartSprint?: (sprintId: string) => void;
  onCompleteSprint?: (sprintId: string) => void;
}

export const SprintSection: React.FC<SprintSectionProps> = ({
  sprint,
  isBacklog = false,
  issues,
  onIssueClick,
  onQuickAddIssue,
  onStartSprint,
  onCompleteSprint,
}) => {
  const totalPoints = issues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden mb-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            {isBacklog ? 'Product Backlog' : sprint?.name}
          </h3>
          {sprint && <SprintStatusBadge status={sprint.status} />}
          <span className="text-xs text-slate-400">
            ({issues.length} {issues.length === 1 ? 'issue' : 'issues'} • {totalPoints} pts)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {sprint?.startDate && sprint?.endDate && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 mr-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {format(new Date(sprint.startDate), 'MMM d')} – {format(new Date(sprint.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {sprint && sprint.status === 'Planned' && onStartSprint && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStartSprint(sprint.id)}
              leftIcon={<Play className="h-3.5 w-3.5 text-emerald-600" />}
            >
              Start Sprint
            </Button>
          )}

          {sprint && sprint.status === 'Active' && onCompleteSprint && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onCompleteSprint(sprint.id)}
              leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
            >
              Complete Sprint
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onQuickAddIssue(sprint?.id)}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            Create Issue
          </Button>
        </div>
      </div>

      {sprint?.goal && (
        <div className="flex items-center gap-2 bg-indigo-50/40 px-5 py-2 border-b border-indigo-50 text-xs text-indigo-900">
          <Target className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span className="font-semibold text-indigo-700">Goal:</span>
          <span>{sprint.goal}</span>
        </div>
      )}

      {/* Issues Table List */}
      <div className="divide-y divide-slate-100">
        {issues.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No issues in this {isBacklog ? 'backlog' : 'sprint'}. Click &quot;Create Issue&quot; to plan work.
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onIssueClick(issue)}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <TypeBadge type={issue.type} />
                <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                  {issue.key}
                </span>
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {issue.title}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                    {issue.storyPoints} pts
                  </span>
                )}
                <PriorityBadge priority={issue.priority} />
                <StatusBadge status={issue.status} />
                <UserAvatar
                  name={issue.assigneeName || 'Unassigned'}
                  avatarUrl={issue.assigneeAvatarUrl}
                  size="xs"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
