import React, { useState } from 'react';
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
  const [drawerWidth, setDrawerWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < 800) {
        setDrawerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  if (!isOpen || !label) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-screen bg-[#161618] border-l border-[#414141] z-50 flex flex-col transform transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isResizing ? 'select-none' : ''}`}
        style={{
          width: `${drawerWidth}px`,
          borderRadius: '20px 0 0 20px'
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-transparent hover:bg-gray-600 cursor-col-resize transition-all duration-200"
          onMouseDown={handleMouseDown}
          style={{ opacity: isResizing ? 1 : 0, cursor: isResizing ? 'col-resize' : 'col-resize' }}
        />

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
          <div className="p-4 my-4 mx-2">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No tasks with this label
              </div>
            ) : (
              <>
                <div
                  className="flex items-center gap-3 mb-6 cursor-pointer group relative bg-[#1b1b1b] border border-[#525252] rounded-[20px]"
                  style={{ padding: '0.80rem' }}
                >
                  <span className={`h-5 w-5 flex items-center justify-center text-gray-400 font-orbitron font-bold text-xl`}>
                    #
                  </span>
                  <h2 className={`text-white text-xl font-semibold truncate ${getLabelColor(label)}`}>
                    {label}
                  </h2>
                  <div className="bg-[#242628] border border-[#414141] text-white font-orbitron font-bold px-3 py-1 rounded-[5px] ml-auto">
                    {tasks.length}
                  </div>
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
