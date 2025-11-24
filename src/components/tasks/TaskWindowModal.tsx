import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Bell, Repeat, Tag, Plus, Check, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  creationDate: string;
}

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
  subtasks?: Subtask[];
}

interface TaskWindowModalProps {
  task: Task | null;
  onClose: () => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
  onTaskUpdate?: (updatedTask: Task) => void;
}

const TaskWindowModal: React.FC<TaskWindowModalProps> = ({
  task,
  onClose,
  getLabelColor,
  getPriorityStyle,
  onTaskUpdate,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [localTask, setLocalTask] = useState<Task | null>(task);

  useEffect(() => {
    if (task) {
      setLocalTask(task);
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!localTask) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false,
        creationDate: new Date().toLocaleDateString(),
      };
      const updatedSubtasks = [...subtasks, newSubtask];
      setSubtasks(updatedSubtasks);
      setNewSubtaskTitle('');

      const updatedTask = { ...localTask, subtasks: updatedSubtasks };
      setLocalTask(updatedTask);
      if (onTaskUpdate) onTaskUpdate(updatedTask);

      const savedTasks = localStorage.getItem('kario-tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
        localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
      }
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(updatedSubtasks);

    const updatedTask = { ...localTask, subtasks: updatedSubtasks };
    setLocalTask(updatedTask);
    if (onTaskUpdate) onTaskUpdate(updatedTask);

    const savedTasks = localStorage.getItem('kario-tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
      localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);
    setSubtasks(updatedSubtasks);

    const updatedTask = { ...localTask, subtasks: updatedSubtasks };
    setLocalTask(updatedTask);
    if (onTaskUpdate) onTaskUpdate(updatedTask);

    const savedTasks = localStorage.getItem('kario-tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
      localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1f1f1f] rounded-[20px] w-[500px] max-w-full h-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
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
            <h1 className="text-2xl font-bold text-white">{localTask.title}</h1>
          </div>

          {/* Description */}
          {localTask.description && (
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap">{localTask.description}</p>
            </div>
          )}

          {/* Task Metadata - Collapsible */}
          <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <div className="space-y-4">
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="text-sm font-semibold text-gray-400">Details</h3>
                <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDetailsOpen ? 'rotate-90' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Due Date */}
                  {(localTask.dueDate || localTask.time) && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="text-white">
                          {localTask.dueDate && localTask.time
                            ? `${localTask.dueDate} at ${localTask.time}`
                            : localTask.dueDate || localTask.time}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Priority */}
                  {(() => {
                    const style = getPriorityStyle(localTask.priority);
                    const flagColorClass = style.text;
                    return (
                      <div className="flex items-start gap-3">
                        <Flag className={`h-4 w-4 ${flagColorClass} flex-shrink-0 mt-1`} />
                        <div>
                          <p className="text-xs text-gray-500">Priority</p>
                          <p className="text-white text-sm">{localTask.priority}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Reminder */}
                  {localTask.reminder && (
                    <div className="flex items-start gap-3">
                      <Bell className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Reminder</p>
                        <p className="text-white">{localTask.reminder}</p>
                      </div>
                    </div>
                  )}

                  {/* Repeat */}
                  {localTask.repeat && (
                    <div className="flex items-start gap-3">
                      <Repeat className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Repeats</p>
                        <p className="text-white">{localTask.repeat.replace(/-/g, ' ')}</p>
                      </div>
                    </div>
                  )}

                  {/* Creation Date */}
                  {localTask.creationDate && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-white">{localTask.creationDate}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Labels */}
                {localTask.labels && localTask.labels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                      {localTask.labels.map((label, index) => (
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
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Subtasks</h3>

            {/* Subtasks List */}
            {subtasks.length > 0 && (
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                    <button
                      onClick={() => handleToggleSubtask(subtask.id)}
                      className="flex-shrink-0"
                    >
                      {subtask.completed ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <div className="h-4 w-4 border border-gray-400 rounded" />
                      )}
                    </button>
                    <span className={`text-sm flex-1 ${subtask.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {subtask.title}
                    </span>
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="flex-shrink-0 p-1 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Subtask Input */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Add a subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtask();
                  }
                }}
                className="bg-[#252527] border border-[#414141] text-white placeholder-gray-500 text-sm h-8"
              />
              <button
                onClick={handleAddSubtask}
                className="flex-shrink-0 p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
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
