import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Issue, IssueStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { issuesApi } from '../../api/issuesApi';
import { useLanguage } from '../../context/LanguageContext';

interface KanbanBoardProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onQuickCreate: (status: IssueStatus) => void;
  onIssuesUpdated: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  issues,
  onIssueClick,
  onQuickCreate,
  onIssuesUpdated,
}) => {
  const { t } = useLanguage();

  const columns: { status: IssueStatus; title: string }[] = [
    { status: 'Todo', title: t('status.todo', 'Yapılacak') },
    { status: 'InProgress', title: t('status.inProgress', 'Devam Eden') },
    { status: 'InReview', title: t('status.inReview', 'İncelemede') },
    { status: 'Done', title: t('status.done', 'Tamamlandı') },
  ];

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as IssueStatus;
    const movedIssue = issues.find((i) => i.id === draggableId);
    if (!movedIssue) return;

    try {
      await issuesApi.updateStatus(draggableId, {
        status: newStatus,
        order: (destination.index + 1) * 1000,
      });
      onIssuesUpdated();
    } catch (err) {
      console.error('Failed to update issue status', err);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 items-start h-[calc(100vh-210px)]">
        {columns.map((col) => {
          const colIssues = issues
            .filter((i) => i.status === col.status)
            .sort((a, b) => a.order - b.order);

          return (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              issues={colIssues}
              onIssueClick={onIssueClick}
              onQuickCreate={onQuickCreate}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
