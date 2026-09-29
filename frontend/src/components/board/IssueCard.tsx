import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Issue } from '../../types';
import { PriorityBadge, TypeBadge } from '../common/Badge';
import { UserAvatar } from '../common/UserAvatar';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { tr as trLocale, enUS } from 'date-fns/locale';

interface IssueCardProps {
  issue: Issue;
  index: number;
  onClick: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, index, onClick }) => {
  const { t, isTurkish } = useLanguage();
  const dateLocale = isTurkish ? trLocale : enUS;

  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group relative mb-2.5 rounded-xl border bg-white p-3.5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md cursor-pointer ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-xl ring-2 ring-indigo-500/20 rotate-1'
              : 'border-slate-200/80'
          }`}
        >
          {/* Top Key & Badges */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <span className="font-mono text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
              {issue.key}
            </span>
            <div className="flex items-center gap-1">
              <TypeBadge type={issue.type} />
              <PriorityBadge priority={issue.priority} />
            </div>
          </div>

          {/* Title */}
          <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-2 mb-2.5">
            {issue.title}
          </h4>

          {/* Bottom row: Story Points / Due Date & Assignee */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-2.5">
              {issue.storyPoints !== undefined && issue.storyPoints !== null && (
                <span className="flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                  {issue.storyPoints} {t('backlog.storyPoints', 'pts')}
                </span>
              )}

              {issue.dueDate && (
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(issue.dueDate), 'd MMM', { locale: dateLocale })}
                </span>
              )}

              {issue.commentCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                  <MessageSquare className="h-3 w-3" />
                  {issue.commentCount}
                </span>
              )}

              {issue.attachmentCount > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                  <Paperclip className="h-3 w-3" />
                  {issue.attachmentCount}
                </span>
              )}
            </div>

            <UserAvatar
              name={issue.assigneeName || t('common.unassigned', 'Unassigned')}
              avatarUrl={issue.assigneeAvatarUrl}
              size="xs"
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};
