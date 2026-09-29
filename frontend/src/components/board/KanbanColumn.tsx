import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Issue, IssueStatus } from '../../types';
import { IssueCard } from './IssueCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  status: IssueStatus;
  title: string;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onQuickCreate: (status: IssueStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  issues,
  onIssueClick,
  onQuickCreate,
}) => {
  const getHeaderColor = () => {
    switch (status) {
      case 'Todo':
        return 'bg-slate-500';
      case 'InProgress':
        return 'bg-blue-500';
      case 'InReview':
        return 'bg-amber-500';
      case 'Done':
        return 'bg-emerald-500';
    }
  };

  return (
    <div className="flex w-72 sm:w-80 flex-col rounded-2xl bg-slate-100/70 p-3 shrink-0 border border-slate-200/60 max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${getHeaderColor()}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {title}
          </h3>
          <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-[11px] font-bold text-slate-600">
            {issues.length}
          </span>
        </div>

        <button
          onClick={() => onQuickCreate(status)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          title="Add issue"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto pr-1 min-h-[150px] transition-colors rounded-xl p-1 ${
              snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
            }`}
          >
            {issues.map((issue, index) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                index={index}
                onClick={() => onIssueClick(issue)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
