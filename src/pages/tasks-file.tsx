import React, { useState } from 'react';
import { useSidebarContext } from '../contexts/SidebarContext';
import TasksHeader from '@/components/tasks/TasksHeader';
import DateSelector from '@/components/tasks/DateSelector';
import PrioritySelector from '@/components/tasks/PrioritySelector';
import ReminderSelector from '@/components/tasks/ReminderSelector';
import LabelSelector from '@/components/tasks/LabelSelector';
import TaskItem from '@/components/tasks/TaskItem';
import TaskWindowModal from '@/components/tasks/TaskWindowModal';
import LabelDrawer from '@/components/tasks/LabelDrawer';
import MarqueeSelection from '@/components/ui/MarqueeSelection';
import {
  Plus,
  ChevronRight,
  MoreVertical,
  Calendar,
  Flag,
  Bell,
  Tag,
  Link,
  Edit,
  Trash2,
  Repeat,
  Bot,
  SquareStack,
  XSquare,
  Archive,
  ArchiveRestore,
  SendToBack,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  sectionId?: string;
}

interface Section {
  id: string;
  name: string;
  isExpanded: boolean;
  createdAt: string;
  isDefault: boolean;
}

const updateTaskRecursively = (
  tasks: Task[],
  taskId: string,
  updateFn: (task: Task) => Task
): { updatedTasks: Task[]; success: boolean } => {
  let success = false;
  const updatedTasks = tasks.map((task) => {
    if (task.id === taskId) {
      success = true;
      return updateFn(task);
    }
    if (task.subtasks) {
      const result = updateTaskRecursively(task.subtasks, taskId, updateFn);
      if (result.success) {
        success = true;
        return { ...task, subtasks: result.updatedTasks };
      }
    }
    return task;
  });
  return { updatedTasks, success };
};

const Tasks = () => {
  const [currentView, setCurrentView] = useState('list');
  const [currentTaskView, setCurrentTaskView] = useState<'drafts' | 'total' | 'completed' | 'pending' | 'deleted'>('total');
  const [isRotated, setIsRotated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('kario-tasks');
    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);
    return parsedTasks;
  });
  const [deletedTasks, setDeletedTasks] = useState<Task[]>(() => {
    const savedDeletedTasks = localStorage.getItem('kario-deleted-tasks');
    return savedDeletedTasks ? JSON.parse(savedDeletedTasks) : [];
  });
  const [sections, setSections] = useState<Section[]>(() => {
    const savedSections = localStorage.getItem('kario-sections');
    if (savedSections) {
      return JSON.parse(savedSections);
    }
    const defaultSection: Section = {
      id: 'default-section',
      name: 'Tasks Made By Kairo',
      isExpanded: true,
      createdAt: new Date().toISOString(),
      isDefault: true,
    };
    return [defaultSection];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSectionExpanded, setIsSectionExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedReminder, setSelectedReminder] = useState<string | undefined>();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; taskId: string; isSubtaskInList?: boolean } | null>(
    null
  );
  const [pageContextMenu, setPageContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [expandedLabelsTaskId, setExpandedLabelsTaskId] = useState<string | null>(null);
  const [selectedRepeat, setSelectedRepeat] = useState<string>('');
  const [filterSettings, setFilterSettings] = useState(() => {
    const saved = localStorage.getItem('kario-filter-settings');
    return saved ? JSON.parse(saved) : { date: false, priority: false, label: false };
  });
  const [sortSettings, setSortSettings] = useState(() => {
    const saved = localStorage.getItem('kario-sort-settings');
    return saved ? JSON.parse(saved) : { completionStatus: false, creationDate: true, pages: false, chats: false };
  });
  const [filterValues, setFilterValues] = useState(() => {
    const saved = localStorage.getItem('kario-filter-values');
    return saved ? JSON.parse(saved) : { date: '', priorities: [], labels: [] };
  });
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<Task | null>(null);
  const [selectedLabelForDrawer, setSelectedLabelForDrawer] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isSubtaskOpened, setIsSubtaskOpened] = useState(false);
  const [parentTaskId, setParentTaskId] = useState('');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const [sectionMenuPosition, setSectionMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const marqueeRef = React.useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const [marquee, setMarquee] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [isAddingSectionOpen, setIsAddingSectionOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  React.useEffect(() => {
    localStorage.setItem('kario-sections', JSON.stringify(sections));
  }, [sections]);

  const handleToggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedTaskIds([]);
    setPageContextMenu(null);
  };

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSectionMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSectionMenuPosition({ x: rect.left, y: rect.bottom + 5 });
    setSectionMenuOpen(true);
  };
  
  const handleMoveToDrafts = () => {
    const updatedTasks = tasks.map(task => 
      displayedTasks.some(dt => dt.id === task.id) ? { ...task, isDraft: true } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
    setSectionMenuOpen(false);
  };

  const handleDeleteAll = () => {
    const tasksToDelete = displayedTasks;
    const remainingTasks = tasks.filter(task => !tasksToDelete.some(dt => dt.id === task.id));
    
    setTasks(remainingTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(remainingTasks));
    
    const deleted = tasks.filter(task => tasksToDelete.some(dt => dt.id === task.id));
    setDeletedTasks(prev => [...prev, ...deleted.map(t => ({...t, deletedAt: new Date().toISOString() } as any))]);
    
    setSectionMenuOpen(false);
  };

  const handleBulkMoveToDrafts = () => {
    const updatedTasks = tasks.map(task =>
      selectedTaskIds.includes(task.id) ? { ...task, isDraft: true } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
    setSelectMode(false);
    setSelectedTaskIds([]);
  };

  const handleBulkMoveToTasks = () => {
    const updatedTasks = tasks.map(task =>
      selectedTaskIds.includes(task.id) ? { ...task, isDraft: false } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
    setSelectMode(false);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = () => {
    const tasksToDelete = tasks.filter(task => selectedTaskIds.includes(task.id));
    const remainingTasks = tasks.filter(task => !selectedTaskIds.includes(task.id));
    
    setTasks(remainingTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(remainingTasks));
    
    setDeletedTasks(prev => [...prev, ...tasksToDelete.map(t => ({...t, deletedAt: new Date().toISOString() } as any))]);
    
    setSelectMode(false);
    setSelectedTaskIds([]);
  };

  const handleBulkRestore = () => {
    const tasksToRestore = deletedTasks.filter(task => selectedTaskIds.includes(task.id));
    const remainingDeletedTasks = deletedTasks.filter(task => !selectedTaskIds.includes(task.id));

    const restoredTasks = tasksToRestore.map(t => {
      const { deletedAt, ...restored } = t as any;
      return restored;
    });

    setTasks(prev => [...prev, ...restoredTasks]);
    setDeletedTasks(remainingDeletedTasks);
    
    setSelectMode(false);
    setSelectedTaskIds([]);
  };

  const handleBulkMoveToDraftsFromDeleted = () => {
    const tasksToMove = deletedTasks.filter(task => selectedTaskIds.includes(task.id));
    const remainingDeletedTasks = deletedTasks.filter(task => !selectedTaskIds.includes(task.id));

    const movedTasks = tasksToMove.map(t => {
      const { deletedAt, ...restored } = t as any;
      return { ...restored, isDraft: true };
    });

    setTasks(prev => [...prev, ...movedTasks]);
    setDeletedTasks(remainingDeletedTasks);
    
    setSelectMode(false);
    setSelectedTaskIds([]);
  };

  // Save deleted tasks to localStorage
  React.useEffect(() => {
    localStorage.setItem('kario-deleted-tasks', JSON.stringify(deletedTasks));
  }, [deletedTasks]);

  // Calculate task statistics
  const totalTasks = tasks.filter(task => !task.isDraft).length;
  const completedTasks = tasks.filter(task => task.completed && !task.isDraft).length;
  const pendingTasks = tasks.filter(task => !task.completed && !task.isDraft).length;
  const draftTasks = tasks.filter(task => task.isDraft).length;

  const getPriorityColorFromStorage = (priorityName: string) => {
    const saved = localStorage.getItem('kario-custom-priorities');
    if (saved) {
      const customPriorities = JSON.parse(saved);
      const found = customPriorities.find((p: { name: string; color: string }) => p.name === priorityName);
      if (found) {
        return found.color;
      }
    }
    return 'text-gray-400';
  };

  const getPriorityStyle = (priorityName: string) => {
    if (priorityName.startsWith('Priority ')) {
      const level = parseInt(priorityName.replace('Priority ', ''));
      const styles = {
        1: { bg: 'bg-red-500', text: 'text-red-400' },
        2: { bg: 'bg-orange-500', text: 'text-orange-400' },
        3: { bg: 'bg-yellow-500', text: 'text-yellow-400' },
        4: { bg: 'bg-green-500', text: 'text-green-400' },
        5: { bg: 'bg-blue-500', text: 'text-blue-400' },
        6: { bg: 'bg-purple-500', text: 'text-purple-400' },
      };
      return styles[level as keyof typeof styles] || { bg: 'bg-gray-500', text: 'text-gray-400' };
    }
    
    const textColor = getPriorityColorFromStorage(priorityName);
    
    const colorMap: { [key: string]: string } = {
        'text-red-500': 'bg-red-500',
        'text-orange-500': 'bg-orange-500',
        'text-yellow-500': 'bg-yellow-500',
        'text-green-500': 'bg-green-500',
        'text-blue-500': 'bg-blue-500',
        'text-cyan-500': 'bg-cyan-500',
        'text-emerald-500': 'bg-emerald-500',
        'text-teal-500': 'bg-teal-500',
        'text-sky-500': 'bg-sky-500',
        'text-amber-500': 'bg-amber-500',
        'text-lime-500': 'bg-lime-500',
        'text-pink-500': 'bg-pink-500',
        'text-rose-500': 'bg-rose-500',
        'text-fuchsia-500': 'bg-fuchsia-500',
        'text-slate-400': 'bg-slate-400',
        'text-gray-400': 'bg-gray-400',
        'text-zinc-400': 'bg-zinc-400',
        'text-stone-400': 'bg-stone-400',
        'text-red-600': 'bg-red-600',
        'text-orange-600': 'bg-orange-600',
        'text-lime-600': 'bg-lime-600',
        'text-emerald-600': 'bg-emerald-600',
        'text-indigo-500': 'bg-indigo-500',
        'text-violet-500': 'bg-violet-500',
    };

    const bgColor = colorMap[textColor] || 'bg-gray-500';

    return { bg: bgColor, text: textColor };
  };

  const getLabelColor = (labelName: string): string => {
    const saved = localStorage.getItem('kario-labels');
    if (saved) {
      const customLabels = JSON.parse(saved);
      const found = customLabels.find((l: { name: string; color: string }) => l.name === labelName);
      if (found) return found.color;
    }

    const presetLabels: { name: string; color: string }[] = [
      { name: '#ByKairo', color: 'text-blue-500' },
      { name: '#School', color: 'text-green-500' },
      { name: '#Work', color: 'text-orange-500' },
      { name: '#Personal', color: 'text-pink-500' },
      { name: '#Urgent', color: 'text-red-500' },
      { name: '#Shopping', color: 'text-cyan-500' },
      { name: '#Health', color: 'text-emerald-500' },
      { name: '#Finance', color: 'text-amber-500' },
      { name: '#Family', color: 'text-rose-500' },
      { name: '#Projects', color: 'text-teal-500' },
    ];
    const preset = presetLabels.find(l => l.name === labelName);
    return preset?.color || 'text-gray-400';
  };

  const handleCreateTask = () => {
    setIsRotated(!isRotated);
    setIsAddingTask(true);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const currentDate = new Date();
      const defaultSectionId = sections.find(s => s.isDefault)?.id || 'default-section';
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        creationDate: currentDate.toLocaleDateString(),
        dueDate: selectedDate ? selectedDate.toLocaleDateString() : undefined,
        time: selectedTime ? selectedTime : undefined,
        priority: selectedPriority,
        description: newTaskDescription.trim(),
        reminder: selectedReminder,
        labels: selectedLabels,
        repeat: selectedRepeat || undefined,
        isDraft: false,
        sectionId: defaultSectionId
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedPriority('');
      setSelectedReminder(undefined);
      setSelectedLabels([]);
      setSelectedRepeat('');
      setIsAddingTask(false);
    }
  };

  const handleSaveDraft = () => {
    if (newTaskTitle.trim()) {
      const currentDate = new Date();
      const defaultSectionId = sections.find(s => s.isDefault)?.id || 'default-section';
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        creationDate: currentDate.toLocaleDateString(),
        dueDate: selectedDate ? selectedDate.toLocaleDateString() : undefined,
        time: selectedTime ? selectedTime : undefined,
        priority: selectedPriority,
        description: newTaskDescription.trim(),
        reminder: selectedReminder,
        labels: selectedLabels,
        repeat: selectedRepeat || undefined,
        isDraft: true,
        sectionId: defaultSectionId
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedPriority('');
      setSelectedReminder(undefined);
      setSelectedLabels([]);
      setSelectedRepeat('');
      setIsAddingTask(false);
    }
  };

  const handleSaveDraftEdit = () => {
    if (editTitle.trim() && editingTaskId) {
      const result = updateTaskRecursively(tasks, editingTaskId, (task) => ({
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDate ? editDate.toLocaleDateString() : task.dueDate,
        time: selectedTime || task.time,
        reminder: selectedReminder,
        labels: selectedLabels,
        repeat: selectedRepeat || undefined,
        isDraft: true
      }));

      if(result.success) {
        setTasks(result.updatedTasks);
        localStorage.setItem('kario-tasks', JSON.stringify(result.updatedTasks));
      }
      
      setEditingTaskId(null);
      setEditTitle('');
      setEditDescription('');
      setEditPriority('');
      setEditDate(undefined);
      setSelectedTime('');
      setSelectedReminder(undefined);
      setSelectedLabels([]);
      setSelectedRepeat('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    const toggleRecursively = (tasks: Task[], isCompleted: boolean): Task[] => {
      return tasks.map(task => ({
        ...task,
        completed: isCompleted,
        subtasks: task.subtasks ? toggleRecursively(task.subtasks, isCompleted) : [],
      }));
    };

    const updateTasks = (tasks: Task[]): Task[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          const newCompletedStatus = !task.completed;
          return {
            ...task,
            completed: newCompletedStatus,
            subtasks: task.subtasks ? toggleRecursively(task.subtasks, newCompletedStatus) : [],
          };
        }
        if (task.subtasks) {
          return { ...task, subtasks: updateTasks(task.subtasks) };
        }
        return task;
      });
    };

    const updatedTasks = updateTasks(tasks);
    setTasks(updatedTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
    }
  };

  const handleContextMenu = (e: React.MouseEvent, taskId: string, isSubtaskInList = false) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 180;
    const menuHeight = 160; // Estimated height
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 5;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 5;
    }

    setPageContextMenu(null);
    setContextMenu({ x, y, taskId, isSubtaskInList });
  };

  const handlePageContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    const menuWidth = 180;
    const menuHeight = 160; // Estimated height
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 5;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 5;
    }

    setContextMenu(null);
    setPageContextMenu({ x, y });
  };

  const handleDeleteTask = (taskId: string) => {
    let deletedTask: Task | null = null;
    
    const findTask = (tasks: Task[], id: string): Task | null => {
        for (const task of tasks) {
            if (task.id === id) return task;
            if (task.subtasks) {
                const found = findTask(task.subtasks, id);
                if (found) return found;
            }
        }
        return null;
    }
    
    const taskToDelete = findTask(tasks, taskId);

    const removeRecursively = (taskList: Task[]): Task[] => {
        return taskList
            .filter(task => task.id !== taskId)
            .map(task => {
                if (task.subtasks) {
                    return { ...task, subtasks: removeRecursively(task.subtasks) };
                }
                return task;
            });
    };

    if (taskToDelete) {
        const updatedTasks = removeRecursively(tasks);
        setTasks(updatedTasks);
        localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        setDeletedTasks(prev => [...prev, { ...taskToDelete, deletedAt: new Date().toISOString() } as any]);
    }
    
    setContextMenu(null);
  };

  const handleRestoreTask = (taskId: string) => {
    const taskToRestore = deletedTasks.find(task => task.id === taskId);
    if (taskToRestore) {
      const { deletedAt, ...restoredTask } = taskToRestore as any;
      setTasks(prev => [...prev, restoredTask]);
      setDeletedTasks(prev => prev.filter(task => task.id !== taskId));
      localStorage.setItem('kario-tasks', JSON.stringify([...tasks, restoredTask]));
    }
  };

  const handleMoveToDraftsFromDeleted = (taskId: string) => {
    const taskToMove = deletedTasks.find(task => task.id === taskId);
    if (taskToMove) {
      const { deletedAt, ...restoredTask } = taskToMove as any;
      setTasks(prev => [...prev, { ...restoredTask, isDraft: true }]);
      setDeletedTasks(prev => prev.filter(task => task.id !== taskId));
      localStorage.setItem('kario-tasks', JSON.stringify([...tasks, { ...restoredTask, isDraft: true }]));
    }
  };

  const handleCloseModal = () => {
    setSelectedTaskForModal(null);
    setIsSubtaskOpened(false);
    setParentTaskId('');
  };

  const handleEditTask = (taskId: string) => {
    const findTaskRecursively = (tasks: Task[], taskId: string): Task | null => {
      for (const task of tasks) {
        if (task.id === taskId) {
          return task;
        }
        if (task.subtasks) {
          const found = findTaskRecursively(task.subtasks, taskId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    const taskToEdit = findTaskRecursively(tasks, taskId);
    if (taskToEdit) {
      setEditingTaskId(taskId);
      setEditTitle(taskToEdit.title);
      setEditDescription(taskToEdit.description);
      setEditPriority(taskToEdit.priority);

      // Safely parse the date string
      let parsedDate: Date | undefined = undefined;
      if (taskToEdit.dueDate) {
        const parts = taskToEdit.dueDate.split('/');
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
      setEditDate(parsedDate);
      
      setSelectedTime(taskToEdit.time || '');
      setSelectedReminder(taskToEdit.reminder);
      setSelectedLabels(taskToEdit.labels || []);
      setSelectedRepeat(taskToEdit.repeat || '');
    }
    setContextMenu(null);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editingTaskId) {
      const result = updateTaskRecursively(tasks, editingTaskId, (task) => ({
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority,
        dueDate: editDate ? editDate.toLocaleDateString() : task.dueDate,
        time: selectedTime || task.time,
        reminder: selectedReminder,
        labels: selectedLabels,
        repeat: selectedRepeat || undefined,
        isDraft: !editDate && !editDescription.trim() // Update draft status
      }));

      if(result.success) {
        setTasks(result.updatedTasks);
        localStorage.setItem('kario-tasks', JSON.stringify(result.updatedTasks));
      }

      setEditingTaskId(null);
      setEditTitle('');
      setEditDescription('');
      setEditPriority('');
      setEditDate(undefined);
      setSelectedTime('');
      setSelectedReminder(undefined);
      setSelectedLabels([]);
      setSelectedRepeat('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTitle('');
    setEditDescription('');
    setEditPriority('');
    setEditDate(undefined);
    setSelectedTime('');
    setSelectedReminder(undefined);
    setSelectedLabels([]);
    setSelectedRepeat('');
  };

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      const newSection: Section = {
        id: Date.now().toString(),
        name: newSectionName.trim(),
        isExpanded: true,
        createdAt: new Date().toISOString(),
        isDefault: false,
      };
      setSections([...sections, newSection]);
      setNewSectionName('');
      setIsAddingSectionOpen(false);
      setPageContextMenu(null);
      setSectionMenuOpen(false);
    }
  };

  const handleEditSection = (sectionId: string) => {
    if (editingSectionName.trim()) {
      setSections(sections.map(section =>
        section.id === sectionId ? { ...section, name: editingSectionName.trim() } : section
      ));
      setEditingSectionId(null);
      setEditingSectionName('');
      setSectionMenuOpen(false);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    const tasksInSection = tasks.filter(t => t.sectionId === sectionId);
    const defaultSectionId = sections.find(s => s.isDefault)?.id || 'default-section';

    const updatedTasks = tasksInSection.map(task => ({
      ...task,
      sectionId: defaultSectionId
    }));

    const finalTasks = tasks.map(task =>
      updatedTasks.some(ut => ut.id === task.id) ? updatedTasks.find(ut => ut.id === task.id)! : task
    );

    setTasks(finalTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(finalTasks));
    setSections(sections.filter(s => s.id !== sectionId));
    setSectionMenuOpen(false);
  };

  const handleToggleSection = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, isExpanded: !section.isExpanded } : section
    ));
  };

  const handleOpenTask = (taskId: string, parentId: string | null = null) => {
    const findTaskRecursively = (tasks: Task[], taskId: string): Task | null => {
      for (const task of tasks) {
        if (task.id === taskId) {
          return task;
        }
        if (task.subtasks) {
          const found = findTaskRecursively(task.subtasks, taskId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };
    const task = findTaskRecursively(tasks, taskId);
    if (task) {
      setSelectedTaskForModal(task);
      if (parentId) {
        setIsSubtaskOpened(true);
        setParentTaskId(parentId);
      } else {
        setIsSubtaskOpened(false);
        setParentTaskId('');
      }
    }
    setContextMenu(null);
  };

  const handleOpenTaskFromDrawer = (taskId: string) => {
    handleOpenTask(taskId);
    setSelectedLabelForDrawer(null);
  };

  const handleLabelClickFromDrawer = (labelName: string) => {
    setSelectedLabelForDrawer(labelName);
  };

  const handleLabelClickFromModal = (labelName: string) => {
    setSelectedTaskForModal(null);
    setSelectedLabelForDrawer(labelName);
  };

  const handleOpenSubtaskAsTask = (subtask: any, parentId?: string) => {
    const subtaskAsTask: Task = {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
      creationDate: subtask.creationDate,
      dueDate: subtask.dueDate,
      time: subtask.time,
      priority: subtask.priority,
      description: subtask.description,
      reminder: subtask.reminder,
      labels: subtask.labels,
      repeat: subtask.repeat,
      subtasks: subtask.subtasks
    };
    setSelectedTaskForModal(subtaskAsTask);
    setIsSubtaskOpened(true);
    setParentTaskId(parentId || '');
  };

  const handleNavigateTask = (direction: 'up' | 'down') => {
    if (!selectedTaskForModal) return;

    const displayedTasks = currentTaskView === 'deleted' ? deletedTasks : applyFiltersAndSort(tasks);
    const currentIndex = displayedTasks.findIndex(t => t.id === selectedTaskForModal.id);

    if (direction === 'up' && currentIndex > 0) {
      setSelectedTaskForModal(displayedTasks[currentIndex - 1]);
    } else if (direction === 'down' && currentIndex < displayedTasks.length - 1) {
      setSelectedTaskForModal(displayedTasks[currentIndex + 1]);
    }
  };

  const [draggedTaskParentId, setDraggedTaskParentId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setPageContextMenu(null);
      setExpandedLabelsTaskId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string, parentId: string | null) => {
    setDraggedTaskId(taskId);
    setDraggedTaskParentId(parentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, taskId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTaskId(taskId);
  };

  const handleDragLeave = () => {
    setDragOverTaskId(null);
  };

  const handleDrop = (e: React.DragEvent, dropTaskId: string, dropTaskParentId: string | null) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === dropTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      setDraggedTaskParentId(null);
      return;
    }

    // Only handle reordering within the same list for now
    if (draggedTaskParentId !== dropTaskParentId) {
        console.warn("Moving tasks between different lists is not supported yet.");
        setDraggedTaskId(null);
        setDragOverTaskId(null);
        setDraggedTaskParentId(null);
        return;
    }

    let newTasks = [...tasks];

    if (draggedTaskParentId === null) {
        // Top-level reorder
        const draggedIndex = tasks.findIndex(task => task.id === draggedTaskId);
        const dropIndex = tasks.findIndex(task => task.id === dropTaskId);
        if (draggedIndex === -1 || dropIndex === -1) return;
        const [draggedTask] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(dropIndex, 0, draggedTask);
    } else {
        // Subtask reorder
        const reorderSubtasks = (taskList: Task[]): Task[] => {
            return taskList.map(task => {
                if (task.id === draggedTaskParentId) {
                    const subtasks = task.subtasks || [];
                    const draggedIndex = subtasks.findIndex(st => st.id === draggedTaskId);
                    const dropIndex = subtasks.findIndex(st => st.id === dropTaskId);
                    if (draggedIndex > -1 && dropIndex > -1) {
                        const newSubtasks = [...subtasks];
                        const [draggedSubtask] = newSubtasks.splice(draggedIndex, 1);
                        newSubtasks.splice(dropIndex, 0, draggedSubtask);
                        return { ...task, subtasks: newSubtasks };
                    }
                }
                if (task.subtasks) {
                    return { ...task, subtasks: reorderSubtasks(task.subtasks) };
                }
                return task;
            });
        };
        newTasks = reorderSubtasks(tasks);
    }

    setTasks(newTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(newTasks));
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDraggedTaskParentId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDraggedTaskParentId(null);
  };

  const applyFiltersAndSort = (tasksToFilter: Task[]): Task[] => {
    let filtered = [...tasksToFilter];

    // Apply view-based filtering first
    if (currentTaskView === 'drafts') {
      filtered = filtered.filter(task => task.isDraft);
    } else if (currentTaskView === 'completed') {
      filtered = filtered.filter(task => task.completed && !task.isDraft);
    } else if (currentTaskView === 'pending') {
      filtered = filtered.filter(task => !task.completed && !task.isDraft);
    } else if (currentTaskView === 'total') {
      filtered = filtered.filter(task => !task.isDraft);
    }
    // 'deleted' is handled separately

    // Helper function to parse DD/MM/YYYY format
    const parseDate = (dateString: string): Date => {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // DD/MM/YYYY format
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return new Date(dateString);
    };

    // Date filtering with presets
    if (filterSettings.date && filterValues.date && filterValues.date !== 'All' && filterValues.date !== '') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = parseDate(task.dueDate);
        taskDate.setHours(0, 0, 0, 0);
        
        switch (filterValues.date) {
          case 'Today': {
            return taskDate.getTime() === today.getTime();
          }
          case 'This week': {
            const startOfWeek = new Date(today);
            const dayOfWeek = today.getDay();
            startOfWeek.setDate(today.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return taskDate.getTime() >= startOfWeek.getTime() && taskDate.getTime() <= endOfWeek.getTime();
          }
          case 'Next 7 days': {
            const next7Days = new Date(today);
            next7Days.setDate(today.getDate() + 7);
            next7Days.setHours(23, 59, 59, 999);
            return taskDate.getTime() >= today.getTime() && taskDate.getTime() <= next7Days.getTime();
          }
          case 'This month': {
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);
            return taskDate.getTime() >= startOfMonth.getTime() && taskDate.getTime() <= endOfMonth.getTime();
          }
          case 'Next 30 days': {
            const next30Days = new Date(today);
            next30Days.setDate(today.getDate() + 30);
            next30Days.setHours(23, 59, 59, 999);
            return taskDate.getTime() >= today.getTime() && taskDate.getTime() <= next30Days.getTime();
          }
          default:
            return true;
        }
      });
    }

    if (filterSettings.priority && filterValues.priorities && filterValues.priorities.length > 0) {
      filtered = filtered.filter(task => filterValues.priorities.includes(task.priority));
    }

    if (filterSettings.label && filterValues.labels && filterValues.labels.length > 0) {
      filtered = filtered.filter(task =>
        task.labels && task.labels.some(label => filterValues.labels.includes(label))
      );
    }

    // Sorting - combine both if needed
    if (sortSettings.completionStatus || sortSettings.creationDate) {
      filtered.sort((a, b) => {
        // First sort by completion status if enabled
        if (sortSettings.completionStatus) {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
        }
        
        // Then sort by creation date if enabled (within the same completion status group)
        if (sortSettings.creationDate) {
          const dateA = parseDate(a.creationDate).getTime();
          const dateB = parseDate(b.creationDate).getTime();
          return dateB - dateA;
        }
        
        return 0;
      });
    }

    return filtered;
  };

  const getTasksByDateGroup = (tasksToGroup: Task[]): { date: string; tasks: Task[] }[] => {
    const grouped: { [key: string]: Task[] } = {};

    tasksToGroup.forEach(task => {
      const date = task.creationDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(task);
    });

    return Object.entries(grouped)
      .map(([date, tasks]) => ({ date, tasks }))
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
  };

  // Get tasks to display based on current view
  const displayedTasks = currentTaskView === 'deleted' ? deletedTasks : applyFiltersAndSort(tasks);

  return (
    <div className="min-h-screen w-full bg-[#161618] flex flex-col">
      {marquee && <MarqueeSelection x={marquee.x} y={marquee.y} width={marquee.width} height={marquee.height} />}
      <TasksHeader
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        pendingTasks={pendingTasks}
        draftTasks={draftTasks}
        deletedTasks={deletedTasks.length}
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentTaskView={currentTaskView}
        setCurrentTaskView={setCurrentTaskView}
        onCreateTask={handleCreateTask}
        isRotated={isRotated}
        filterSettings={filterSettings}
        setFilterSettings={(settings) => {
          setFilterSettings(settings);
          localStorage.setItem('kario-filter-settings', JSON.stringify(settings));
        }}
        sortSettings={sortSettings}
        setSortSettings={(settings) => {
          setSortSettings(settings);
          localStorage.setItem('kario-sort-settings', JSON.stringify(settings));
        }}
        filterValues={filterValues}
        setFilterValues={(values) => {
          setFilterValues(values);
          localStorage.setItem('kario-filter-values', JSON.stringify(values));
        }}
      />
      
      {selectMode && selectedTaskIds.length > 0 && (
        <div
          className="fixed shadow-xl py-2 px-2 z-50 rounded-[16px] bg-[#1f1f1f] w-[180px] border-none"
          style={{
            top: '50%',
            right: '5%',
            transform: 'translateY(-50%)',
          }}
        >
          {currentTaskView === 'deleted' ? (
            <>
              <button
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-green-500 transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                onClick={handleBulkRestore}
              >
                <div className="flex items-center gap-3">
                  <ArchiveRestore className="w-4 h-4" />
                  <span>Restore in Tasks</span>
                </div>
                <span className="text-xs text-gray-400">{selectedTaskIds.length}</span>
              </button>
              <button
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-purple-500 transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                onClick={handleBulkMoveToDraftsFromDeleted}
              >
                <div className="flex items-center gap-3">
                  <Archive className="w-4 h-4" />
                  <span>Move to Drafts</span>
                </div>
                <span className="text-xs text-gray-400">{selectedTaskIds.length}</span>
              </button>
            </>
          ) : currentTaskView === 'drafts' ? (
            <button
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
              onClick={handleBulkMoveToTasks}
            >
              <div className="flex items-center gap-3">
                <ArchiveRestore className="w-4 h-4" />
                <span>Move to Tasks</span>
              </div>
              <span className="text-xs text-gray-400">{selectedTaskIds.length}</span>
            </button>
          ) : (
            <button
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
              onClick={handleBulkMoveToDrafts}
            >
              <div className="flex items-center gap-3">
                <Archive className="w-4 h-4" />
                <span>Move to Drafts</span>
              </div>
              <span className="text-xs text-gray-400">{selectedTaskIds.length}</span>
            </button>
          )}
          {currentTaskView !== 'deleted' && (
            <button
              className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-red-500 transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
              onClick={handleBulkDelete}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected</span>
              </div>
              <span className="text-xs text-gray-400">{selectedTaskIds.length}</span>
            </button>
          )}
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
            onClick={handleToggleSelectMode}
          >
            <XSquare className="w-4 h-4" />
            <span>Exit Select Mode</span>
          </button>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
          >
            <Bot className="w-4 h-4" />
            <span className="font-orbitron">Kairo</span>
          </button>
        </div>
      )}
      
      {/* LIST View Content */}
      {currentView === 'list' && (
        <div
          className={`px-4 mt-4 flex-grow ${selectMode ? 'user-select-none' : ''}`}
          onContextMenu={handlePageContextMenu}
          onMouseDown={(e) => {
            if (selectMode) {
              e.preventDefault();
              e.stopPropagation();
              setMarqueeStart({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseMove={(e) => {
            if (selectMode && marqueeStart) {
              e.preventDefault();
              const x = Math.min(e.clientX, marqueeStart.x);
              const y = Math.min(e.clientY, marqueeStart.y);
              const width = Math.abs(e.clientX - marqueeStart.x);
              const height = Math.abs(e.clientY - marqueeStart.y);
              marqueeRef.current = { x, y, width, height };
              requestAnimationFrame(() => {
                if (marqueeRef.current) {
                  setMarquee(marqueeRef.current);
                  const marquee = marqueeRef.current;
                  const taskElements = document.querySelectorAll('[data-task-id]');
                  const selectedIds = Array.from(taskElements)
                    .filter((el) => {
                      const rect = el.getBoundingClientRect();
                      return (
                        rect.left < marquee.x + marquee.width &&
                        rect.right > marquee.x &&
                        rect.top < marquee.y + marquee.height &&
                        rect.bottom > marquee.y
                      );
                    })
                    .map((el) => el.getAttribute('data-task-id'))
                    .filter((id) => id !== null) as string[];
                  setSelectedTaskIds(selectedIds);
                }
              });
            }
          }}
          onMouseUp={() => {
            setMarqueeStart(null);
            setMarquee(null);
            marqueeRef.current = null;
          }}
        >
          <div className="ml-20">

            {/* Information text for deleted section */}
            {currentTaskView === 'deleted' && (
              <div className="max-w-[980px] mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
                <p className="text-red-300 text-sm leading-relaxed">
                  Deleted tasks will be retained for a period of 7 days. After this time, they will be permanently deleted and cannot be recovered.
                </p>
              </div>
            )}

            {isAddingSectionOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setIsAddingSectionOpen(false)}>
                <div className="bg-[#1f1f1f] border border-[#414141] rounded-[16px] p-6 w-96" onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-white text-lg font-semibold mb-4">Create New Section</h2>
                  <Input
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSection();
                      if (e.key === 'Escape') setIsAddingSectionOpen(false);
                    }}
                    placeholder="Section name"
                    className="w-full bg-[#252527] border border-[#414141] text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-4 py-2 rounded-[8px] mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => setIsAddingSectionOpen(false)}
                      variant="ghost"
                      className="border border-[#414141] text-gray-300 hover:bg-[#252527]"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSection}
                      disabled={!newSectionName.trim()}
                      className="bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {sections.map((section) => (
            <div className="max-w-[980px] mb-8" key={section.id}>
              {editingSectionId === section.id ? (
                <div className="flex items-center gap-2 mb-4 bg-[#1b1b1b] border border-[#525252] rounded-[20px] px-4 py-3">
                  <Input
                    value={editingSectionName}
                    onChange={(e) => setEditingSectionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSection(section.id);
                      if (e.key === 'Escape') {
                        setEditingSectionId(null);
                        setEditingSectionName('');
                      }
                    }}
                    className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-0 py-1 text-xl font-semibold"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleEditSection(section.id)}
                    disabled={!editingSectionName.trim()}
                    className="bg-white text-black hover:bg-gray-200 disabled:opacity-50"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingSectionId(null);
                      setEditingSectionName('');
                    }}
                    variant="ghost"
                    className="border border-[#414141] text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 mb-4 cursor-pointer group relative bg-[#1b1b1b] border border-[#525252] rounded-[20px]"
                  style={{ padding: '0.80rem' }}
                  onClick={() => handleToggleSection(section.id)}
                >
                  {/* K icon (visible by default for default section) */}
                  {section.isDefault && (
                    <span className={`h-5 w-5 flex items-center justify-center text-gray-400 font-orbitron font-bold text-xl group-hover:opacity-0 transition-all duration-200`}>
                      K
                    </span>
                  )}
                  {/* Chevron icon (visible on hover) */}
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 ${section.isDefault ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-all duration-200 ${
                      section.isExpanded ? 'rotate-90' : 'rotate-0'
                    }`}
                  />
                  <h2 className="text-white text-xl font-semibold">{section.name}</h2>

                  {/* Task count indicator - positioned right next to heading */}
                  <div className="bg-[#242628] border border-[#414141] text-white font-orbitron font-bold px-3 py-1 rounded-[5px]">
                    {currentTaskView === 'deleted' ? deletedTasks.length : applyFiltersAndSort(tasks.filter(t => t.sectionId === section.id || (!t.sectionId && section.isDefault))).length}
                  </div>

                  {/* Three-dot menu icon (visible on hover) */}
                  <MoreVertical
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSectionMenuPosition({ x: rect.left, y: rect.bottom + 5 });
                      setSectionMenuOpen(true);
                    }}
                    className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-auto cursor-pointer"
                  />
                </div>
              )}
              {sectionMenuOpen && sectionMenuPosition && (
                <div
                  className="fixed shadow-xl py-2 px-2 z-50 rounded-[16px] bg-[#1f1f1f] w-[180px] border-none"
                  style={{ left: sectionMenuPosition.x, top: sectionMenuPosition.y }}
                  onMouseLeave={() => setSectionMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setSectionMenuOpen(false);
                      setIsAddingSectionOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Section</span>
                  </button>
                  {!section.isDefault && (
                    <>
                      <button
                        onClick={() => {
                          setEditingSectionId(section.id);
                          setEditingSectionName(section.name);
                          setSectionMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteSection(section.id);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-red-500 transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  {section.isDefault && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            disabled
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl opacity-50 cursor-not-allowed"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#1f1f1f] text-white border-[#414141]">
                          <p>Can't edit this section :)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {selectMode ? (
                    <button
                      onClick={() => { handleToggleSelectMode(); setSectionMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                    >
                      <XSquare className="w-4 h-4" />
                      <span>Exit Select Mode</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { handleToggleSelectMode(); setSectionMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                    >
                      <SquareStack className="w-4 h-4" />
                      <span>Select</span>
                    </button>
                  )}
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                  >
                    <Bot className="w-4 h-4" />
                    <span className="font-orbitron">Kairo</span>
                  </button>
                </div>
              )}

            {/* Expandable content - positioned below the main section */}
            {section.isExpanded && (
              <div className="bg-transparent max-w-[980px]" style={{ marginBottom: '45px' }}>
                {(() => {
                  const sectionTasks = currentTaskView === 'deleted'
                    ? deletedTasks
                    : applyFiltersAndSort(tasks.filter(t => t.sectionId === section.id || (!t.sectionId && section.isDefault)));
                  return (
                    <>
                {/* Card-based task list */}
                <div className="space-y-3">
                  {sortSettings.creationDate ? (
                    getTasksByDateGroup(sectionTasks).map((group) => (
                      <div key={group.date}>
                        <div className="px-4 py-2 mt-4 mb-2">
                          <h3 className="text-gray-400 text-sm font-semibold">{group.date}</h3>
                        </div>
                        {group.tasks.map((task) => (
                          editingTaskId === task.id ? (
                            <div key={task.id} className="p-4 bg-transparent border border-[#525252] rounded-[20px] min-h-[160px] relative z-10 overflow-visible mt-4">
                              {/* Section 1: Title */}
                              <div className="mb-2">
                                <Input
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  placeholder="Task name"
                                  className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-0 py-1 text-base font-semibold"
                                  autoFocus
                                />
                              </div>

                              {/* Section 2: Description */}
                              <div className="mb-4">
                                <textarea
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  placeholder="Description"
                                  className="w-full bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-0 px-0 py-1 resize-none min-h-[60px] text-sm"
                                />
                              </div>

                              {/* Separator Line */}
                              <div className="border-t border-[#414141] mb-4"></div>

                              {/* Section 3: Bottom Section with Action Buttons and Main Buttons */}
                              <div className="flex flex-wrap justify-between items-center gap-2 relative z-20">
                                {/* Action Buttons in Middle (with border) */}
                                <div className="border border-[#414141] rounded-[20px] p-2 flex flex-wrap gap-2 relative z-30 bg-[#1b1b1b]">
                                  <DateSelector
                                    selectedDate={editDate}
                                    onSelect={setEditDate}
                                    onTimeSelect={setSelectedTime}
                                    selectedRepeat={selectedRepeat}
                                    onRepeatSelect={setSelectedRepeat}
                                  />
                                  <PrioritySelector
                                    selectedPriority={editPriority}
                                    onSelect={setEditPriority}
                                  />
                                  <ReminderSelector
                                    selectedReminder={selectedReminder}
                                    onSelect={setSelectedReminder}
                                    selectedDate={editDate}
                                    selectedTime={selectedTime}
                                  />
                                  <LabelSelector
                                    selectedLabels={selectedLabels}
                                    onSelect={setSelectedLabels}
                                  />
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                                    <Link className="h-4 w-4 mr-2" />
                                    Link
                                  </Button>
                                </div>

                                {/* Main Action Buttons on Right */}
                                <div className="flex gap-2 flex-shrink-0">
                                  <Button
                                    onClick={handleCancelEdit}
                                    variant="ghost"
                                    size="sm"
                                    className="border border-[#690707] rounded-[10px] bg-[#391e1e] text-[crimson] hover:bg-[#391e1e] hover:text-[crimson]"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleSaveDraftEdit}
                                    disabled={!editTitle.trim()}
                                    variant="ghost"
                                    size="sm"
                                    className={`border border-[#5f5c74] rounded-[10px] text-[#dedede] transition-all ${
                                      editTitle.trim()
                                        ? 'bg-[#13132f] hover:bg-[#13132f] hover:text-[#dedede]'
                                        : 'bg-[#0d0d1a] opacity-50 cursor-not-allowed'
                                    }`}
                                  >
                                    Draft
                                  </Button>
                                  <Button
                                    onClick={handleSaveEdit}
                                    size="sm"
                                    disabled={!editTitle.trim()}
                                    className={`border rounded-[14px] transition-all ${
                                      editTitle.trim()
                                        ? 'border-[#252232] bg-white text-[#252232] hover:bg-white hover:text-[#252232]'
                                        : 'border-[#3a3a3a] bg-[#2a2a2a] text-[#5a5a5a] cursor-not-allowed'
                                    }`}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                                                    ) : (
                                                      <TaskItem
                                                        key={task.id}
                                                        task={task}
                                                        parentId={null}
                                                        draggedTaskId={draggedTaskId}
                                                        dragOverTaskId={dragOverTaskId}
                                                        expandedLabelsTaskId={expandedLabelsTaskId}
                                                        onContextMenu={handleContextMenu}
                                                        onDragStart={handleDragStart}
                                                        onDragOver={handleDragOver}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={handleDrop}
                                                        onDragEnd={handleDragEnd}
                                                        onToggle={handleToggleTask}
                                                        onToggleLabels={(taskId) => setExpandedLabelsTaskId(expandedLabelsTaskId === taskId ? null : taskId)}
                                                        onOpenTask={handleOpenTask}
                                                        onEditTask={handleEditTask}
                                                        onDeleteTask={currentTaskView === 'deleted' ? handleRestoreTask : handleDeleteTask}
                                                        getLabelColor={getLabelColor}
                                                        getPriorityStyle={getPriorityStyle}
                                                        isDeleted={currentTaskView === 'deleted'}
                                                        onLabelClick={(label) => {
                                                          setSelectedLabelForDrawer(label);
                                                        }}
                                                        expandedTaskId={expandedTaskId}
                                                        onToggleExpand={(taskId) => setExpandedTaskId(expandedTaskId === taskId ? null : taskId)}
                                                        selectMode={selectMode}
                                                        selected={selectedTaskIds.includes(task.id)}
                                                        onSelect={handleTaskSelect}
                                                      />
                                                    )
                        ))}
                      </div>
                    ))
                  ) : (
                    sectionTasks.map((task) => (
                      editingTaskId === task.id ? (
                        <div key={task.id} className="p-4 bg-transparent border border-[#525252] rounded-[20px] min-h-[160px] relative z-10 overflow-visible mt-4">
                          {/* Section 1: Title */}
                          <div className="mb-2">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Task name"
                              className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-0 py-1 text-base font-semibold"
                              autoFocus
                            />
                          </div>

                          {/* Section 2: Description */}
                          <div className="mb-4">
                            <textarea
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Description"
                              className="w-full bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-0 px-0 py-1 resize-none min-h-[60px] text-sm"
                            />
                          </div>

                          {/* Separator Line */}
                          <div className="border-t border-[#414141] mb-4"></div>

                          {/* Section 3: Bottom Section with Action Buttons and Main Buttons */}
                          <div className="flex flex-wrap justify-between items-center gap-2 relative z-20">
                            {/* Action Buttons in Middle (with border) */}
                            <div className="border border-[#414141] rounded-[20px] p-2 flex flex-wrap gap-2 relative z-30 bg-[#1b1b1b]">
                              <DateSelector
                                selectedDate={editDate}
                                onSelect={setEditDate}
                                onTimeSelect={setSelectedTime}
                                selectedRepeat={selectedRepeat}
                                onRepeatSelect={setSelectedRepeat}
                              />
                              <PrioritySelector
                                selectedPriority={editPriority}
                                onSelect={setEditPriority}
                              />
                              <ReminderSelector
                                selectedReminder={selectedReminder}
                                onSelect={setSelectedReminder}
                                selectedDate={editDate}
                                selectedTime={selectedTime}
                              />
                              <LabelSelector
                                selectedLabels={selectedLabels}
                                onSelect={setSelectedLabels}
                              />
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                                <Link className="h-4 w-4 mr-2" />
                                Link
                              </Button>
                            </div>

                            {/* Main Action Buttons on Right */}
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                onClick={handleCancelEdit}
                                variant="ghost"
                                size="sm"
                                className="border border-[#690707] rounded-[10px] bg-[#391e1e] text-[crimson] hover:bg-[#391e1e] hover:text-[crimson]"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveDraftEdit}
                                disabled={!editTitle.trim()}
                                variant="ghost"
                                size="sm"
                                className={`border border-[#5f5c74] rounded-[10px] text-[#dedede] transition-all ${
                                  editTitle.trim()
                                    ? 'bg-[#13132f] hover:bg-[#13132f] hover:text-[#dedede]'
                                    : 'bg-[#0d0d1a] opacity-50 cursor-not-allowed'
                                }`}
                              >
                                Draft
                              </Button>
                              <Button
                                onClick={handleSaveEdit}
                                size="sm"
                                disabled={!editTitle.trim()}
                                className={`border rounded-[14px] transition-all ${
                                  editTitle.trim()
                                    ? 'border-[#252232] bg-white text-[#252232] hover:bg-white hover:text-[#252232]'
                                    : 'border-[#3a3a3a] bg-[#2a2a2a] text-[#5a5a5a] cursor-not-allowed'
                                }`}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <TaskItem
                          key={task.id}
                          task={task}
                          parentId={null}
                          draggedTaskId={draggedTaskId}
                          dragOverTaskId={dragOverTaskId}
                          expandedLabelsTaskId={expandedLabelsTaskId}
                          onContextMenu={handleContextMenu}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
                          onToggle={handleToggleTask}
                          onToggleLabels={(taskId) => setExpandedLabelsTaskId(expandedLabelsTaskId === taskId ? null : taskId)}
                            onOpenTask={handleOpenTask}
                            onEditTask={handleEditTask}
                            onDeleteTask={currentTaskView === 'deleted' ? handleRestoreTask : handleDeleteTask}
                            getLabelColor={getLabelColor}
                            getPriorityStyle={getPriorityStyle}
                            isDeleted={currentTaskView === 'deleted'}
                            onLabelClick={(label) => {
                              setSelectedLabelForDrawer(label);
                            }}
                            expandedTaskId={expandedTaskId}
                            onToggleExpand={(taskId) => setExpandedTaskId(expandedTaskId === taskId ? null : taskId)}
                            selectMode={selectMode}
                            selected={selectedTaskIds.includes(task.id)}
                            onSelect={handleTaskSelect}
                          />
                      )
                    ))
                  )}
                </div>
              
                {/* Add New Task Input */}
                {isAddingTask && (
                  <div className="p-4 bg-transparent border border-[#525252] rounded-[20px] min-h-[160px] relative z-10 overflow-visible mt-4">
                    {/* Section 1: Title */}
                    <div className="mb-2">
                      <Input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Task title"
                        className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base font-semibold"
                        autoFocus
                      />
                    </div>

                    {/* Section 2: Description */}
                    <div className="mb-2">
                      <textarea
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Description"
                        className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 p-0 resize-none min-h-[40px] outline-none text-sm"
                      />
                    </div>

                    {/* Separator Line */}
                    <div className="border-t border-[#414141] mb-4"></div>

                    {/* Section 3: Bottom Section with Action Buttons and Main Buttons */}
                    <div className="flex flex-wrap justify-between items-center gap-2 relative z-20">
                      {/* Action Buttons in Middle (with border) */}
                      <div className="border border-[#414141] rounded-[20px] p-2 flex flex-wrap gap-2 relative z-30 bg-[#1b1b1b]">
                        <DateSelector
                          selectedDate={selectedDate}
                          onSelect={setSelectedDate}
                          onTimeSelect={setSelectedTime}
                          selectedRepeat={selectedRepeat}
                          onRepeatSelect={setSelectedRepeat}
                        />
                        <PrioritySelector
                          selectedPriority={selectedPriority}
                          onSelect={setSelectedPriority}
                        />
                        <ReminderSelector
                          selectedReminder={selectedReminder}
                          onSelect={setSelectedReminder}
                          selectedDate={selectedDate}
                          selectedTime={selectedTime}
                        />
                        <LabelSelector
                          selectedLabels={selectedLabels}
                          onSelect={setSelectedLabels}
                        />
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                          <Link className="h-4 w-4 mr-2" />
                          Link
                        </Button>
                      </div>

                      {/* Main Action Buttons on Right */}
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => {
                            setIsAddingTask(false);
                            setNewTaskTitle('');
                            setNewTaskDescription('');
                          }}
                          variant="ghost"
                          size="sm"
                          className="border border-[#690707] rounded-[10px] bg-[#391e1e] text-[crimson] hover:bg-[#391e1e] hover:text-[crimson]"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveDraft}
                          disabled={!newTaskTitle.trim()}
                          variant="ghost"
                          size="sm"
                          className={`border border-[#5f5c74] rounded-[10px] text-[#dedede] transition-all ${
                            newTaskTitle.trim()
                              ? 'bg-[#13132f] hover:bg-[#13132f] hover:text-[#dedede]'
                              : 'bg-[#0d0d1a] opacity-50 cursor-not-allowed'
                          }`}
                        >
                          Draft
                        </Button>
                        <Button
                          onClick={handleAddTask}
                          size="sm"
                          disabled={!newTaskTitle.trim()}
                          className={`border rounded-[14px] transition-all ${
                            newTaskTitle.trim()
                              ? 'border-[#252232] bg-white text-[#252232] hover:bg-white hover:text-[#252232]'
                              : 'border-[#3a3a3a] bg-[#2a2a2a] text-[#5a5a5a] cursor-not-allowed'
                          }`}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Add Task Button */}
                {!isAddingTask && (
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={() => setIsAddingTask(true)}
                      className="flex items-center gap-2 px-6 py-3 rounded-[20px] bg-[#f5f5f3] text-black hover:bg-white transition-colors duration-200"
                    >
                      <Plus className="h-5 w-5" />
                      New task
                    </Button>
                  </div>
                )}
                    </>
                  );
                })()}
              </div>
            )}
            </div>
            ))}
          </div>
        </div>
      )}

            {/* Context Menu */}

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
                {currentTaskView === 'deleted' ? (
                  <>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                      onClick={() => handleRestoreTask(contextMenu.taskId)}
                    >
                      <span>Restore in Tasks</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                      onClick={() => handleMoveToDraftsFromDeleted(contextMenu.taskId)}
                    >
                      <span>Move to Drafts</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                      onClick={() => handleOpenTask(contextMenu.taskId, null)}
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>Open</span>
                    </button>
                    {!contextMenu.isSubtaskInList && (
                      <>
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                          onClick={() => handleEditTask(contextMenu.taskId)}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                          onClick={() => handleDeleteTask(contextMenu.taskId)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

      

            {/* Page Context Menu */}

            {pageContextMenu && (
              <div
                className="fixed shadow-xl py-2 px-2 z-50"
                style={{
                  left: `${pageContextMenu.x}px`,
                  top: `${pageContextMenu.y}px`,
                  borderRadius: '16px',
                  background: '#1f1f1f',
                  width: '180px',
                  border: 'none'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setPageContextMenu(null);
                    setIsAddingSectionOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
                {selectMode ? (
                  <button
                    onClick={handleToggleSelectMode}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                  >
                    <XSquare className="w-4 h-4" />
                    <span>Exit Select Mode</span>
                  </button>
                ) : (
                  <button
                    onClick={handleToggleSelectMode}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                  >
                    <SquareStack className="w-4 h-4" />
                    <span>Select</span>
                  </button>
                )}
                <button
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
                >
                  <Bot className="w-4 h-4" />
                  <span className="font-orbitron">Kairo</span>
                </button>
              </div>
            )}

      

      

            <TaskWindowModal

              task={selectedTaskForModal}

              onClose={handleCloseModal}

              getLabelColor={getLabelColor}

                            getPriorityStyle={getPriorityStyle}

                            onTaskUpdate={(updatedTask) => {

                              const result = updateTaskRecursively(tasks, updatedTask.id, () => updatedTask);

                              if (result.success) {

                                setTasks(result.updatedTasks);

                                localStorage.setItem('kario-tasks', JSON.stringify(result.updatedTasks));

                              }

                            }}

                            onNavigate={handleNavigateTask}

                            allTasks={currentTaskView === 'deleted' ? deletedTasks : applyFiltersAndSort(tasks)}

                            currentTaskIndex={selectedTaskForModal ? (currentTaskView === 'deleted' ? deletedTasks : applyFiltersAndSort(tasks)).findIndex(t => t.id === selectedTaskForModal.id) : -1}

                            sectionName="Tasks Made By Kairo"

                            onOpenSubtaskAsTask={(subtask) => handleOpenSubtaskAsTask(subtask, selectedTaskForModal?.id)}

                            isSubtaskOpened={isSubtaskOpened}

                            parentTaskId={parentTaskId}

                            onLabelClick={handleLabelClickFromModal}

                          />

      <LabelDrawer
        isOpen={selectedLabelForDrawer !== null}
        label={selectedLabelForDrawer}
        tasks={selectedLabelForDrawer ? tasks.filter(t => t.labels?.includes(selectedLabelForDrawer)) : []}
        onClose={() => setSelectedLabelForDrawer(null)}
        draggedTaskId={draggedTaskId}
        dragOverTaskId={dragOverTaskId}
        expandedLabelsTaskId={expandedLabelsTaskId}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onToggle={handleToggleTask}
        onToggleLabels={(taskId) => setExpandedLabelsTaskId(expandedLabelsTaskId === taskId ? null : taskId)}
        onOpenTask={handleOpenTaskFromDrawer}
        onEditTask={handleEditTask}
        onDeleteTask={handleDeleteTask}
        onLabelClick={handleLabelClickFromDrawer}
        getLabelColor={getLabelColor}
        getPriorityStyle={getPriorityStyle}
        editingTaskId={editingTaskId}
        editTitle={editTitle}
        editDescription={editDescription}
        editPriority={editPriority}
        editDate={editDate}
        selectedTime={selectedTime}
        selectedReminder={selectedReminder}
        selectedLabels={selectedLabels}
        selectedRepeat={selectedRepeat}
        onSetEditTitle={setEditTitle}
        onSetEditDescription={setEditDescription}
        onSetEditPriority={setEditPriority}
        onSetEditDate={setEditDate}
        onSetSelectedTime={setSelectedTime}
        onSetSelectedReminder={setSelectedReminder}
        onSetSelectedLabels={setSelectedLabels}
        onSetSelectedRepeat={setSelectedRepeat}
        onSaveEdit={handleSaveEdit}
        onSaveDraftEdit={handleSaveDraftEdit}
        onCancelEdit={handleCancelEdit}
        expandedTaskId={expandedTaskId}
        onToggleExpand={(taskId) => setExpandedTaskId(expandedTaskId === taskId ? null : taskId)}
      />
    </div>
  );
};

export default Tasks;
