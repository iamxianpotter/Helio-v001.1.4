import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TaskItem from './TaskItem';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  creationDate: string;
  dueDate?: string;
  time?: string;
  priority: string;
  description: string;
  reminder?: string;
  labels?: string[];
  repeat?: string;
  isDraft?: boolean;
  subtasks?: Task[];
  sectionId: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  draggedTaskId: string | null;
  dragOverTaskId: string | null;
  expandedLabelsTaskId: string | null;
  expandedTaskId: string | null;
  selectMode: boolean;
  selectedTaskIds: string[];
  onContextMenu: (e: React.MouseEvent, taskId: string, isSubtaskInList?: boolean) => void;
  onDragStart: (e: React.DragEvent, taskId: string, parentId: string | null) => void;
  onDragOver: (e: React.DragEvent, taskId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, taskId: string, parentId: string | null) => void;
  onDragEnd: () => void;
  onToggle: (taskId: string) => void;
  onToggleLabels: (taskId: string) => void;
  onOpenTask: (taskId: string, parentId?: string | null) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
  onLabelClick: (label: string) => void;
  onToggleExpand: (taskId: string) => void;
  onSelect: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  draggedTaskId,
  dragOverTaskId,
  expandedLabelsTaskId,
  expandedTaskId,
  selectMode,
  selectedTaskIds,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onToggle,
  onToggleLabels,
  onOpenTask,
  onEditTask,
  onDeleteTask,
  getLabelColor,
  getPriorityStyle,
  onLabelClick,
  onToggleExpand,
  onSelect,
}) => {
  const draftTasks = tasks.filter(task => task.isDraft);
  const pendingTasks = tasks.filter(task => !task.completed && !task.isDraft);
  const completedTasks = tasks.filter(task => task.completed && !task.isDraft);

  const Column = ({
    title,
    tasks: columnTasks,
    columnId,
  }: {
    title: string;
    tasks: Task[];
    columnId: string;
  }) => (
    <div className="flex flex-col w-full min-w-[350px] bg-[#1b1b1b] rounded-[20px] border border-[#414141] h-full">
      <div className="sticky top-0 bg-[#1b1b1b] border-b border-[#414141] rounded-t-[20px] p-4 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <span className="px-3 py-1 bg-[#252527] border border-[#414141] rounded-full text-xs font-semibold text-gray-300">
            {columnTasks.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-2 pr-4">
          {columnTasks.map((task) => (
            <div
              key={task.id}
              onDragOver={(e) => onDragOver(e, task.id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, task.id, null)}
              className="group"
            >
              <TaskItem
                task={task}
                parentId={null}
                draggedTaskId={draggedTaskId}
                dragOverTaskId={dragOverTaskId}
                expandedLabelsTaskId={expandedLabelsTaskId}
                onContextMenu={onContextMenu}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onDragEnd={onDragEnd}
                onToggle={onToggle}
                onToggleLabels={onToggleLabels}
                onOpenTask={onOpenTask}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                getLabelColor={getLabelColor}
                getPriorityStyle={getPriorityStyle}
                onLabelClick={onLabelClick}
                expandedTaskId={expandedTaskId}
                onToggleExpand={onToggleExpand}
                selectMode={selectMode}
                selected={selectedTaskIds.includes(task.id)}
                onSelect={onSelect}
              />
            </div>
          ))}
          {columnTasks.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-500">
              <p className="text-sm">No tasks</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex gap-4 h-full pb-4 overflow-x-auto px-4">
      <Column title="Drafts" tasks={draftTasks} columnId="drafts" />
      <Column title="Pending" tasks={pendingTasks} columnId="pending" />
      <Column title="Completed" tasks={completedTasks} columnId="completed" />
    </div>
  );
};

export default KanbanBoard;
