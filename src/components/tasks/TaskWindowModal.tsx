import React from 'react';
import { X, Calendar, Flag, Bell, Repeat, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface TaskWindowModalProps {
  task: Task | null;
  onClose: () => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
}

const TaskWindowModal: React.FC<TaskWindowModalProps> = ({
  task,
  onClose,
  getLabelColor,
  getPriorityStyle,
}) => {
  if (!task) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1f1f1f] rounded-[20px] w-full max-w-[500px] h-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Task Details Section */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
          {/* Task Title */}
          <div>
            <h1 className="text-2xl font-bold text-white">{task.title}</h1>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Task Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400">Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              {(task.dueDate || task.time) && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-white">
                      {task.dueDate && task.time
                        ? `${task.dueDate} at ${task.time}`
                        : task.dueDate || task.time}
                    </p>
                  </div>
                </div>
              )}

              {/* Priority */}
              {(() => {
                const style = getPriorityStyle(task.priority);
                const flagColorClass = style.text;
                return (
                  <div className="flex items-start gap-3">
                    <Flag className={`h-4 w-4 ${flagColorClass} flex-shrink-0 mt-1`} />
                    <div>
                      <p className="text-xs text-gray-500">Priority</p>
                      <p className="text-white text-sm">{task.priority}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Reminder */}
              {task.reminder && (
                <div className="flex items-start gap-3">
                  <Bell className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Reminder</p>
                    <p className="text-white">{task.reminder}</p>
                  </div>
                </div>
              )}

              {/* Repeat */}
              {task.repeat && (
                <div className="flex items-start gap-3">
                  <Repeat className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Repeats</p>
                    <p className="text-white">{task.repeat.replace(/-/g, ' ')}</p>
                  </div>
                </div>
              )}

              {/* Creation Date */}
              {task.creationDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-white">{task.creationDate}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full"
                  >
                    <Tag className={`h-3 w-3 ${getLabelColor(label)}`} />
                    <span className="text-xs text-gray-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty Section for Future Features */}
        <div className="p-6 bg-[#161618] min-h-[100px] flex items-center justify-center text-gray-500 text-sm">
          <p>Additional features coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default TaskWindowModal;
