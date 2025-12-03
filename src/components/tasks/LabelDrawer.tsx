import React from 'react';
import { X } from 'lucide-react';
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
}

interface LabelDrawerProps {
  isOpen: boolean;
  label: string | null;
  tasks: Task[];
  onClose: () => void;
  draggedTaskId: string | null;
  dragOverTaskId: string | null;
  expandedLabelsTaskId: string | null;
  onContextMenu: (e: React.MouseEvent, taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent, taskId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: () => void;
  onToggle: (taskId: string) => void;
  onToggleLabels: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
}

const LabelDrawer: React.FC<LabelDrawerProps> = ({
  isOpen,
  label,
  tasks,
  onClose,
  draggedTaskId,
  dragOverTaskId,
  expandedLabelsTaskId,
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
}) => {
  if (!isOpen || !label) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`fixed right-0 top-0 h-screen w-[450px] bg-[#161618] border-l border-[#414141] z-50 flex flex-col transform transition-all duration-500 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        borderRadius: '20px 0 0 20px'
      }}>
        <div className="flex items-center justify-between p-4 border-b border-[#414141]">
          <h2 className="text-white text-lg font-semibold truncate">
            Labels
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#252527] rounded-lg transition-colors duration-200"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No tasks with this label
              </div>
            ) : (
              <>
                <div className="mb-4 px-4 py-2">
                  <h3 className="text-white text-sm font-semibold">{label}</h3>
                </div>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
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
                      onLabelClick={() => {}}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LabelDrawer;
