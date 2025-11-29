import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, Bell, Repeat, Tag, Plus, Check, Trash2, ChevronRight, Edit, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TaskCreationForm from './TaskCreationForm';
import SubtaskItem from './SubtaskItem';

interface Subtask {
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
  subtasks?: Subtask[];
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
  onNavigate?: (direction: 'up' | 'down') => void;
  allTasks?: Task[];
  currentTaskIndex?: number;
  sectionName?: string;
  onOpenSubtaskAsTask?: (subtask: any) => void;
  isSubtaskOpened?: boolean;
  parentTaskId?: string;
}

const TaskWindowModal: React.FC<TaskWindowModalProps> = ({
  task,
  onClose,
  getLabelColor,
  getPriorityStyle,
  onTaskUpdate,
  onNavigate,
  allTasks = [],
  currentTaskIndex = -1,
  sectionName = 'Tasks Made By Kairo',
  onOpenSubtaskAsTask,
  isSubtaskOpened = false,
  parentTaskId = '',
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDescription, setNewSubtaskDescription] = useState('');
  const [newSubtaskDate, setNewSubtaskDate] = useState<Date | undefined>();
  const [newSubtaskTime, setNewSubtaskTime] = useState('');
  const [newSubtaskPriority, setNewSubtaskPriority] = useState('');
  const [newSubtaskReminder, setNewSubtaskReminder] = useState<string | undefined>();
  const [newSubtaskLabels, setNewSubtaskLabels] = useState<string[]>([]);
  const [newSubtaskRepeat, setNewSubtaskRepeat] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; subtaskId: string } | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [expandedLabelsSubtaskId, setExpandedLabelsSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');
  const [editSubtaskDescription, setEditSubtaskDescription] = useState('');
  const [editSubtaskDate, setEditSubtaskDate] = useState<Date | undefined>();
  const [editSubtaskTime, setEditSubtaskTime] = useState('');
  const [editSubtaskPriority, setEditSubtaskPriority] = useState('');
  const [editSubtaskReminder, setEditSubtaskReminder] = useState<string | undefined>();
  const [editSubtaskLabels, setEditSubtaskLabels] = useState<string[]>([]);
  const [editSubtaskRepeat, setEditSubtaskRepeat] = useState('');
  const [draggedSubtaskId, setDraggedSubtaskId] = useState<string | null>(null);
  const [dragOverSubtaskId, setDragOverSubtaskId] = useState<string | null>(null);
  const [openedNestedSubtask, setOpenedNestedSubtask] = useState<Subtask | null>(null);
  const [parentSubtaskStack, setParentSubtaskStack] = useState<Subtask[]>([]);

  useEffect(() => {
    setLocalTask(task);
    if (task) {
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setExpandedLabelsSubtaskId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const updateSubtaskInTask = (task: Task, updatedSubtask: Task): Task => {
    const updateRecursively = (subtasks: Subtask[] = []): Subtask[] => {
      return subtasks.map(st =>
        st.id === updatedSubtask.id
          ? {
              ...st,
              title: updatedSubtask.title,
              description: updatedSubtask.description,
              completed: updatedSubtask.completed,
              dueDate: updatedSubtask.dueDate,
              time: updatedSubtask.time,
              priority: updatedSubtask.priority,
              reminder: updatedSubtask.reminder,
              labels: updatedSubtask.labels,
              repeat: updatedSubtask.repeat,
              subtasks: updatedSubtask.subtasks as Subtask[] | undefined
            }
          : { ...st, subtasks: st.subtasks ? updateRecursively(st.subtasks) : undefined }
      );
    };
    return { ...task, subtasks: updateRecursively(task.subtasks) };
  };

  if (!localTask) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false,
        creationDate: new Date().toLocaleDateString(),
        dueDate: newSubtaskDate ? newSubtaskDate.toLocaleDateString() : undefined,
        time: newSubtaskTime || undefined,
        priority: newSubtaskPriority,
        description: newSubtaskDescription.trim(),
        reminder: newSubtaskReminder,
        labels: newSubtaskLabels,
        repeat: newSubtaskRepeat || undefined,
      };
      const updatedSubtasks = [...subtasks, newSubtask];
      setSubtasks(updatedSubtasks);
      setNewSubtaskTitle('');
      setNewSubtaskDescription('');
      setNewSubtaskDate(undefined);
      setNewSubtaskTime('');
      setNewSubtaskPriority('');
      setNewSubtaskReminder(undefined);
      setNewSubtaskLabels([]);
      setNewSubtaskRepeat('');
      setIsAddingSubtask(false);

      const updatedTask = { ...localTask, subtasks: updatedSubtasks };
      setLocalTask(updatedTask);
      if (onTaskUpdate) onTaskUpdate(updatedTask);

      const savedTasks = localStorage.getItem('kario-tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        if (isSubtaskOpened && parentTaskId) {
          const updatedTasks = tasks.map((t: Task) => {
            if (t.id === parentTaskId) {
              return updateSubtaskInTask(t, updatedTask);
            }
            return t;
          });
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        } else {
          const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        }
      }
    }
  };

  const handleCancelSubtaskCreation = () => {
    setIsAddingSubtask(false);
    setNewSubtaskTitle('');
    setNewSubtaskDescription('');
    setNewSubtaskDate(undefined);
    setNewSubtaskTime('');
    setNewSubtaskPriority('Priority 3');
    setNewSubtaskReminder(undefined);
    setNewSubtaskLabels([]);
    setNewSubtaskRepeat('');
  };

  const toggleSubtaskRecursively = (subtasks: Subtask[], subtaskId: string): Subtask[] => {
    return subtasks.map(st =>
      st.id === subtaskId
        ? { ...st, completed: !st.completed }
        : { ...st, subtasks: st.subtasks ? toggleSubtaskRecursively(st.subtasks, subtaskId) : undefined }
    );
  };

  const handleToggleSubtask = (subtaskId: string) => {
    let updatedSubtasks = toggleSubtaskRecursively(subtasks, subtaskId);
    setSubtasks(updatedSubtasks);

    const updatedTask = { ...localTask, subtasks: updatedSubtasks };
    setLocalTask(updatedTask);
    if (onTaskUpdate) onTaskUpdate(updatedTask);

    const savedTasks = localStorage.getItem('kario-tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      if (isSubtaskOpened && parentTaskId) {
        const updatedTasks = tasks.map((t: Task) => {
          if (t.id === parentTaskId) {
            return updateSubtaskInTask(t, updatedTask);
          }
          return t;
        });
        localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
      } else {
        const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
        localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
      }
    }
  };

  const deleteSubtaskRecursively = (subtasks: Subtask[], subtaskId: string): Subtask[] => {
    return subtasks
      .filter(st => st.id !== subtaskId)
      .map(st => ({
        ...st,
        subtasks: st.subtasks ? deleteSubtaskRecursively(st.subtasks, subtaskId) : undefined
      }));
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = deleteSubtaskRecursively(subtasks, subtaskId);
    setSubtasks(updatedSubtasks);

    const updatedTask = { ...localTask, subtasks: updatedSubtasks };
    setLocalTask(updatedTask);
    if (onTaskUpdate) onTaskUpdate(updatedTask);

    const savedTasks = localStorage.getItem('kario-tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      if (isSubtaskOpened && parentTaskId) {
        const updatedTasks = tasks.map((t: Task) => {
          if (t.id === parentTaskId) {
            return updateSubtaskInTask(t, updatedTask);
          }
          return t;
        });
        localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
      } else {
        const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
        localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
      }
    }
    setContextMenu(null);
  };

  const handleContextMenuSubtask = (e: React.MouseEvent, subtaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, subtaskId });
  };

  const findSubtaskRecursivelyForEdit = (subtasks: Subtask[], subtaskId: string): Subtask | null => {
    for (const st of subtasks) {
      if (st.id === subtaskId) return st;
      if (st.subtasks) {
        const found = findSubtaskRecursivelyForEdit(st.subtasks, subtaskId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleEditSubtask = (subtaskId: string) => {
    const subtaskToEdit = findSubtaskRecursivelyForEdit(subtasks, subtaskId);
    if (subtaskToEdit) {
      setEditingSubtaskId(subtaskId);
      setEditSubtaskTitle(subtaskToEdit.title);
      setEditSubtaskDescription(subtaskToEdit.description);
      setEditSubtaskPriority(subtaskToEdit.priority);

      let parsedDate: Date | undefined = undefined;
      if (subtaskToEdit.dueDate) {
        const parts = subtaskToEdit.dueDate.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            parsedDate = date;
          }
        }
      }
      setEditSubtaskDate(parsedDate);
      setEditSubtaskTime(subtaskToEdit.time || '');
      setEditSubtaskReminder(subtaskToEdit.reminder);
      setEditSubtaskLabels(subtaskToEdit.labels || []);
      setEditSubtaskRepeat(subtaskToEdit.repeat || '');
    }
    setContextMenu(null);
  };

  const handleSaveSubtaskEdit = () => {
    if (editSubtaskTitle.trim() && editingSubtaskId) {
      const updateSubtasksRecursively = (subtasks: Subtask[]): Subtask[] => {
        return subtasks.map(st =>
          st.id === editingSubtaskId
            ? {
                ...st,
                title: editSubtaskTitle.trim(),
                description: editSubtaskDescription.trim(),
                priority: editSubtaskPriority,
                dueDate: editSubtaskDate ? editSubtaskDate.toLocaleDateString() : st.dueDate,
                time: editSubtaskTime || st.time,
                reminder: editSubtaskReminder,
                labels: editSubtaskLabels,
                repeat: editSubtaskRepeat || undefined,
              }
            : { ...st, subtasks: st.subtasks ? updateSubtasksRecursively(st.subtasks) : undefined }
        );
      };

      const updatedSubtasks = updateSubtasksRecursively(subtasks);
      setSubtasks(updatedSubtasks);

      const updatedTask = { ...localTask, subtasks: updatedSubtasks };
      setLocalTask(updatedTask);
      if (onTaskUpdate) onTaskUpdate(updatedTask);

      const savedTasks = localStorage.getItem('kario-tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        if (isSubtaskOpened && parentTaskId) {
          const updatedTasks = tasks.map((t: Task) => {
            if (t.id === parentTaskId) {
              return updateSubtaskInTask(t, updatedTask);
            }
            return t;
          });
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        } else {
          const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        }
      }

      setEditingSubtaskId(null);
      setEditSubtaskTitle('');
      setEditSubtaskDescription('');
      setEditSubtaskPriority('');
      setEditSubtaskDate(undefined);
      setEditSubtaskTime('');
      setEditSubtaskReminder(undefined);
      setEditSubtaskLabels([]);
      setEditSubtaskRepeat('');
    }
  };

  const handleCancelSubtaskEdit = () => {
    setEditingSubtaskId(null);
    setEditSubtaskTitle('');
    setEditSubtaskDescription('');
    setEditSubtaskPriority('Priority 3');
    setEditSubtaskDate(undefined);
    setEditSubtaskTime('');
    setEditSubtaskReminder(undefined);
    setEditSubtaskLabels([]);
    setEditSubtaskRepeat('');
  };

  const handleSubtaskDragStart = (e: React.DragEvent, subtaskId: string) => {
    setDraggedSubtaskId(subtaskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSubtaskDragOver = (e: React.DragEvent, subtaskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSubtaskId(subtaskId);
  };

  const handleSubtaskDragLeave = () => {
    setDragOverSubtaskId(null);
  };

  const handleSubtaskDrop = (e: React.DragEvent, targetSubtaskId: string) => {
    e.preventDefault();

    if (!draggedSubtaskId || draggedSubtaskId === targetSubtaskId) {
      setDraggedSubtaskId(null);
      setDragOverSubtaskId(null);
      return;
    }

    const draggedIndex = subtasks.findIndex(st => st.id === draggedSubtaskId);
    const targetIndex = subtasks.findIndex(st => st.id === targetSubtaskId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newSubtasks = [...subtasks];
      const [removed] = newSubtasks.splice(draggedIndex, 1);
      newSubtasks.splice(targetIndex, 0, removed);

      setSubtasks(newSubtasks);
      const updatedTask = { ...localTask!, subtasks: newSubtasks };
      setLocalTask(updatedTask);
      if (onTaskUpdate) onTaskUpdate(updatedTask);

      const savedTasks = localStorage.getItem('kario-tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        if (isSubtaskOpened && parentTaskId) {
          const updatedTasks = tasks.map((t: Task) => {
            if (t.id === parentTaskId) {
              return updateSubtaskInTask(t, updatedTask);
            }
            return t;
          });
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        } else {
          const updatedTasks = tasks.map((t: Task) => t.id === localTask!.id ? updatedTask : t);
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        }
      }
    }

    setDraggedSubtaskId(null);
    setDragOverSubtaskId(null);
  };

  const handleSubtaskDragEnd = () => {
    setDraggedSubtaskId(null);
    setDragOverSubtaskId(null);
  };

  const findSubtaskRecursively = (subtasks: Subtask[], subtaskId: string): Subtask | null => {
    for (const st of subtasks) {
      if (st.id === subtaskId) return st;
      if (st.subtasks) {
        const found = findSubtaskRecursively(st.subtasks, subtaskId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleOpenNestedSubtask = (subtaskId: string) => {
    const subtask = findSubtaskRecursively(subtasks, subtaskId);
    if (subtask && onOpenSubtaskAsTask) {
      onOpenSubtaskAsTask(subtask);
    }
  };

  const handleCloseNestedSubtask = () => {
    if (parentSubtaskStack.length > 1) {
      const newStack = parentSubtaskStack.slice(0, -1);
      setParentSubtaskStack(newStack);
      setOpenedNestedSubtask(newStack[newStack.length - 1]);
    } else {
      setOpenedNestedSubtask(null);
      setParentSubtaskStack([]);
    }
  };

  const updateSubtaskRecursively = (subtasks: Subtask[], subtaskId: string, updater: (st: Subtask) => Subtask): Subtask[] => {
    return subtasks.map(st => {
      if (st.id === subtaskId) {
        return updater(st);
      }
      if (st.subtasks) {
        return { ...st, subtasks: updateSubtaskRecursively(st.subtasks, subtaskId, updater) };
      }
      return st;
    });
  };

  const handleAddNestedSubtask = () => {
    if (openedNestedSubtask && newSubtaskTitle.trim()) {
      const newNestedSubtask: Subtask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false,
        creationDate: new Date().toLocaleDateString(),
        dueDate: newSubtaskDate ? newSubtaskDate.toLocaleDateString() : undefined,
        time: newSubtaskTime || undefined,
        priority: newSubtaskPriority,
        description: newSubtaskDescription.trim(),
        reminder: newSubtaskReminder,
        labels: newSubtaskLabels,
        repeat: newSubtaskRepeat || undefined,
        subtasks: [],
      };

      const updatedSubtasks = updateSubtaskRecursively(subtasks, openedNestedSubtask.id, (st) => ({
        ...st,
        subtasks: [...(st.subtasks || []), newNestedSubtask],
      }));

      setSubtasks(updatedSubtasks);
      setOpenedNestedSubtask({ ...openedNestedSubtask, subtasks: [...(openedNestedSubtask.subtasks || []), newNestedSubtask] });

      const updatedTask = { ...localTask, subtasks: updatedSubtasks };
      setLocalTask(updatedTask);
      if (onTaskUpdate) onTaskUpdate(updatedTask);

      const savedTasks = localStorage.getItem('kario-tasks');
      if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        if (isSubtaskOpened && parentTaskId) {
          const updatedTasks = tasks.map((t: Task) => {
            if (t.id === parentTaskId) {
              return updateSubtaskInTask(t, updatedTask);
            }
            return t;
          });
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        } else {
          const updatedTasks = tasks.map((t: Task) => t.id === localTask.id ? updatedTask : t);
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        }
      }

      setNewSubtaskTitle('');
      setNewSubtaskDescription('');
      setNewSubtaskDate(undefined);
      setNewSubtaskTime('');
      setNewSubtaskPriority('Priority 3');
      setNewSubtaskReminder(undefined);
      setNewSubtaskLabels([]);
      setNewSubtaskRepeat('');
      setIsAddingSubtask(false);
    }
  };

  const canNavigateUp = currentTaskIndex > 0;
  const canNavigateDown = currentTaskIndex < allTasks.length - 1;

  const handleNavigateUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canNavigateUp && onNavigate) {
      onNavigate('up');
    }
  };

  const handleNavigateDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canNavigateDown && onNavigate) {
      onNavigate('down');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1f1f1f] rounded-[20px] w-[700px] max-w-full h-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header with Section Name and Controls */}
        <div className="flex items-center justify-between p-4 gap-4">
          {/* Section Name on Left */}
          <div className="flex items-center gap-1">
            <span className="text-gray-400">#</span>
            <span className="text-white font-orbitron font-bold">Kairo</span>
          </div>

          {/* Navigation and Close Buttons on Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNavigateUp}
              disabled={!canNavigateUp}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                canNavigateUp ? 'hover:bg-[#2a2a2a]' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronUp className={`h-5 w-5 ${canNavigateUp ? 'text-gray-400 hover:text-white' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleNavigateDown}
              disabled={!canNavigateDown}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                canNavigateDown ? 'hover:bg-[#2a2a2a]' : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <ChevronDown className={`h-5 w-5 ${canNavigateDown ? 'text-gray-400 hover:text-white' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={handleCloseButton}
              className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          </div>
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
          {(localTask.dueDate || localTask.time || localTask.priority || localTask.reminder || localTask.repeat || localTask.creationDate || (localTask.labels && localTask.labels.length > 0)) && (
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
          )}

          {/* Nested Subtask View */}
          {openedNestedSubtask && (
            <div className="border border-[#414141] rounded-lg p-4 bg-[#252527]">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleCloseNestedSubtask}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                  <span className="text-sm">Back</span>
                </button>
                <h2 className="text-lg font-semibold text-white">{openedNestedSubtask.title}</h2>
                <div className="w-12" />
              </div>

              {openedNestedSubtask.description && (
                <p className="text-sm text-gray-300 mb-3">{openedNestedSubtask.description}</p>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-400">Nested Tasks</h4>

                {openedNestedSubtask.subtasks && openedNestedSubtask.subtasks.length > 0 && (
                  <div className="space-y-2">
                    {openedNestedSubtask.subtasks.map((nestedSubtask) => (
                      editingSubtaskId === nestedSubtask.id ? (
                        <TaskCreationForm
                          key={nestedSubtask.id}
                          title={editSubtaskTitle}
                          onTitleChange={setEditSubtaskTitle}
                          description={editSubtaskDescription}
                          onDescriptionChange={setEditSubtaskDescription}
                          selectedDate={editSubtaskDate}
                          onDateSelect={setEditSubtaskDate}
                          selectedTime={editSubtaskTime}
                          onTimeSelect={setEditSubtaskTime}
                          selectedPriority={editSubtaskPriority}
                          onPrioritySelect={setEditSubtaskPriority}
                          selectedReminder={editSubtaskReminder}
                          onReminderSelect={setEditSubtaskReminder}
                          selectedLabels={editSubtaskLabels}
                          onLabelsSelect={setEditSubtaskLabels}
                          selectedRepeat={editSubtaskRepeat}
                          onRepeatSelect={setEditSubtaskRepeat}
                          onCancel={handleCancelSubtaskEdit}
                          onSaveDraft={handleSaveSubtaskEdit}
                          onSave={handleSaveSubtaskEdit}
                          showDraftButton={false}
                          mode="edit"
                        />
                      ) : (
                        <SubtaskItem
                          key={nestedSubtask.id}
                          subtask={nestedSubtask}
                          onToggle={handleToggleSubtask}
                          onEdit={handleEditSubtask}
                          onDelete={handleDeleteSubtask}
                          onContextMenu={handleContextMenuSubtask}
                          getLabelColor={getLabelColor}
                          getPriorityStyle={getPriorityStyle}
                          expandedLabelsSubtaskId={expandedLabelsSubtaskId}
                          onToggleLabels={(subtaskId) => setExpandedLabelsSubtaskId(expandedLabelsSubtaskId === subtaskId ? null : subtaskId)}
                          onDragStart={handleSubtaskDragStart}
                          onDragOver={handleSubtaskDragOver}
                          onDragLeave={handleSubtaskDragLeave}
                          onDrop={handleSubtaskDrop}
                          onDragEnd={handleSubtaskDragEnd}
                          draggedSubtaskId={draggedSubtaskId}
                          dragOverSubtaskId={dragOverSubtaskId}
                          onOpen={handleOpenNestedSubtask}
                        />
                      )
                    ))}
                  </div>
                )}

                {!isAddingSubtask && (
                  <button
                    onClick={() => setIsAddingSubtask(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add nested task
                  </button>
                )}

                {isAddingSubtask && (
                  <TaskCreationForm
                    title={newSubtaskTitle}
                    onTitleChange={setNewSubtaskTitle}
                    description={newSubtaskDescription}
                    onDescriptionChange={setNewSubtaskDescription}
                    selectedDate={newSubtaskDate}
                    onDateSelect={setNewSubtaskDate}
                    selectedTime={newSubtaskTime}
                    onTimeSelect={setNewSubtaskTime}
                    selectedPriority={newSubtaskPriority}
                    onPrioritySelect={setNewSubtaskPriority}
                    selectedReminder={newSubtaskReminder}
                    onReminderSelect={setNewSubtaskReminder}
                    selectedLabels={newSubtaskLabels}
                    onLabelsSelect={setNewSubtaskLabels}
                    selectedRepeat={newSubtaskRepeat}
                    onRepeatSelect={setNewSubtaskRepeat}
                    onCancel={handleCancelSubtaskCreation}
                    onSaveDraft={handleAddNestedSubtask}
                    onSave={handleAddNestedSubtask}
                    showDraftButton={false}
                    autoFocus={true}
                    mode="create"
                  />
                )}
              </div>
            </div>
          )}

          {/* Subtasks Section */}
          {!openedNestedSubtask && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Subtasks</h3>

            {/* Subtasks List */}
            {subtasks.length > 0 && (
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  editingSubtaskId === subtask.id ? (
                    <TaskCreationForm
                      key={subtask.id}
                      title={editSubtaskTitle}
                      onTitleChange={setEditSubtaskTitle}
                      description={editSubtaskDescription}
                      onDescriptionChange={setEditSubtaskDescription}
                      selectedDate={editSubtaskDate}
                      onDateSelect={setEditSubtaskDate}
                      selectedTime={editSubtaskTime}
                      onTimeSelect={setEditSubtaskTime}
                      selectedPriority={editSubtaskPriority}
                      onPrioritySelect={setEditSubtaskPriority}
                      selectedReminder={editSubtaskReminder}
                      onReminderSelect={setEditSubtaskReminder}
                      selectedLabels={editSubtaskLabels}
                      onLabelsSelect={setEditSubtaskLabels}
                      selectedRepeat={editSubtaskRepeat}
                      onRepeatSelect={setEditSubtaskRepeat}
                      onCancel={handleCancelSubtaskEdit}
                      onSaveDraft={handleSaveSubtaskEdit}
                      onSave={handleSaveSubtaskEdit}
                      showDraftButton={false}
                      mode="edit"
                    />
                  ) : (
                    <SubtaskItem
                      key={subtask.id}
                      subtask={subtask}
                      onToggle={handleToggleSubtask}
                      onEdit={handleEditSubtask}
                      onDelete={handleDeleteSubtask}
                      onContextMenu={handleContextMenuSubtask}
                      getLabelColor={getLabelColor}
                      getPriorityStyle={getPriorityStyle}
                      expandedLabelsSubtaskId={expandedLabelsSubtaskId}
                      onToggleLabels={(subtaskId) => setExpandedLabelsSubtaskId(expandedLabelsSubtaskId === subtaskId ? null : subtaskId)}
                      onDragStart={handleSubtaskDragStart}
                      onDragOver={handleSubtaskDragOver}
                      onDragLeave={handleSubtaskDragLeave}
                      onDrop={handleSubtaskDrop}
                      onDragEnd={handleSubtaskDragEnd}
                      draggedSubtaskId={draggedSubtaskId}
                      dragOverSubtaskId={dragOverSubtaskId}
                      onOpen={handleOpenNestedSubtask}
                    />
                  )
                ))}
              </div>
            )}

            {/* Add Subtask Button or Form */}
            {!isAddingSubtask && (
              <button
                onClick={() => setIsAddingSubtask(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                Add a subtask
              </button>
            )}

            {/* Add Subtask Form */}
            {isAddingSubtask && (
              <TaskCreationForm
                title={newSubtaskTitle}
                onTitleChange={setNewSubtaskTitle}
                description={newSubtaskDescription}
                onDescriptionChange={setNewSubtaskDescription}
                selectedDate={newSubtaskDate}
                onDateSelect={setNewSubtaskDate}
                selectedTime={newSubtaskTime}
                onTimeSelect={setNewSubtaskTime}
                selectedPriority={newSubtaskPriority}
                onPrioritySelect={setNewSubtaskPriority}
                selectedReminder={newSubtaskReminder}
                onReminderSelect={setNewSubtaskReminder}
                selectedLabels={newSubtaskLabels}
                onLabelsSelect={setNewSubtaskLabels}
                selectedRepeat={newSubtaskRepeat}
                onRepeatSelect={setNewSubtaskRepeat}
                onCancel={handleCancelSubtaskCreation}
                onSaveDraft={handleAddSubtask}
                onSave={handleAddSubtask}
                showDraftButton={false}
                autoFocus={true}
                mode="create"
              />
            )}
          </div>
          )}
        </div>

      </div>

      {/* Context Menu for Subtasks */}
      {contextMenu && (
        <div
          className="fixed shadow-xl py-2 px-2 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            borderRadius: '16px',
            background: '#1f1f1f',
            width: '180px',
            border: 'none'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
            onClick={() => handleEditSubtask(contextMenu.subtaskId)}
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
            onClick={() => handleDeleteSubtask(contextMenu.subtaskId)}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskWindowModal;
