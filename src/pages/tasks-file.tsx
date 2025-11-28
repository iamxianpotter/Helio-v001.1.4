import React, { useState } from 'react';
import TasksHeader from '@/components/tasks/TasksHeader';
import DateSelector from '@/components/tasks/DateSelector';
import PrioritySelector from '@/components/tasks/PrioritySelector';
import ReminderSelector from '@/components/tasks/ReminderSelector';
import LabelSelector from '@/components/tasks/LabelSelector';
import TaskItem from '@/components/tasks/TaskItem';
import TaskWindowModal from '@/components/tasks/TaskWindowModal';
import { Plus, ChevronRight, MoveVertical as MoreVertical, Calendar, Flag, Bell, Tag, Link, Edit, Trash2, Repeat } from 'lucide-react';
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
}

const flattenSubtasks = (subtasks: any[] = []): any[] => {
  const flattened: any[] = [];

  const flatten = (items: any[]) => {
    items.forEach(item => {
      const { subtasks: nestedSubtasks, ...rest } = item;
      flattened.push(rest);
      if (nestedSubtasks && nestedSubtasks.length > 0) {
        flatten(nestedSubtasks);
      }
    });
  };

  flatten(subtasks);
  return flattened;
};

const Tasks = () => {
  const [currentView, setCurrentView] = useState('list');
  const [currentTaskView, setCurrentTaskView] = useState<'drafts' | 'total' | 'completed' | 'pending' | 'deleted'>('total');
  const [isRotated, setIsRotated] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('kario-tasks');
    if (!savedTasks) return [];

    const parsedTasks = JSON.parse(savedTasks);
    const migratedTasks = parsedTasks.map((task: any) => {
      if (task.subtasks) {
        return {
          ...task,
          subtasks: flattenSubtasks(task.subtasks),
        };
      }
      return task;
    });

    localStorage.setItem('kario-tasks', JSON.stringify(migratedTasks));
    return migratedTasks;
  });
  const [deletedTasks, setDeletedTasks] = useState<Task[]>(() => {
    const savedDeletedTasks = localStorage.getItem('kario-deleted-tasks');
    return savedDeletedTasks ? JSON.parse(savedDeletedTasks) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSectionExpanded, setIsSectionExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<string>('');
  const [selectedReminder, setSelectedReminder] = useState<string | undefined>();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; taskId: string } | null>(null);
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
        1: { bg: 'bg-red-500/20', text: 'text-red-400' },
        2: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
        3: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
        4: { bg: 'bg-green-500/20', text: 'text-green-400' },
        5: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
        6: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
      };
      return styles[level as keyof typeof styles] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
    }
    return { bg: 'bg-gray-500/20', text: getPriorityColorFromStorage(priorityName) };
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
        isDraft: false
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
        isDraft: true
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
      const updatedTasks = tasks.map(task =>
        task.id === editingTaskId
          ? {
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
            }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
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
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
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

  const handleContextMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, taskId });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId);
    if (taskToDelete) {
      // Move task to deleted tasks
      setDeletedTasks(prev => [...prev, { ...taskToDelete, deletedAt: new Date().toISOString() } as any]);
      // Remove from active tasks
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
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

  const handleCloseModal = () => {
    setSelectedTaskForModal(null);
  };

  const handleEditTask = (taskId: string) => {
    const taskToEdit = tasks.find(t => t.id === taskId);
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
      const updatedTasks = tasks.map(task =>
        task.id === editingTaskId
          ? {
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
            }
          : task
      );
      setTasks(updatedTasks);
      localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
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

  const handleOpenTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskForModal(task);
    }
    setContextMenu(null);
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

  React.useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setExpandedLabelsTaskId(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
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

  const handleDrop = (e: React.DragEvent, dropTaskId: string) => {
    e.preventDefault();
    if (!draggedTaskId || draggedTaskId === dropTaskId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const draggedIndex = tasks.findIndex(task => task.id === draggedTaskId);
    const dropIndex = tasks.findIndex(task => task.id === dropTaskId);

    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(dropIndex, 0, draggedTask);

    setTasks(newTasks);
    localStorage.setItem('kario-tasks', JSON.stringify(newTasks));
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
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
    <div className="min-h-screen w-full bg-[#161618]">
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
      
      {/* LIST View Content */}
      {currentView === 'list' && (
        <div className="px-4 mt-4">
          <div className="ml-20">
            
            {/* Information text for deleted section */}
            {currentTaskView === 'deleted' && (
              <div className="max-w-[980px] mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded-lg">
                <p className="text-red-300 text-sm leading-relaxed">
                  Deleted tasks will be retained for a period of 7 days. After this time, they will be permanently deleted and cannot be recovered.
                </p>
              </div>
            )}
            
            {/* Case b & e: Tasks-By-Kairo Section */}
            <div className="max-w-[980px]">
              {/* Case f: Section heading with K icon that transforms to chevron on hover */}
              <div
                className="flex items-center gap-2 mb-4 cursor-pointer group relative bg-[#1b1b1b] border border-[#525252] rounded-[20px]"
                style={{ padding: '0.80rem' }}
                onClick={() => setIsSectionExpanded(!isSectionExpanded)}
              >
                {/* K icon (visible by default) */}
                <span className={`h-5 w-5 flex items-center justify-center text-gray-400 font-orbitron font-bold text-xl group-hover:opacity-0 transition-all duration-200`}>
                  K
                </span>
                {/* Chevron icon (visible on hover) */}
                <ChevronRight
                  className={`h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute ${
                    isSectionExpanded ? 'rotate-90' : 'rotate-0'
                  }`}
                />
                <h2 className="text-white text-xl font-semibold">Tasks Made By Kairo</h2>

                {/* Task count indicator - positioned right next to heading */}
                <div className="bg-[#242628] border border-[#414141] text-white font-orbitron font-bold px-3 py-1 rounded-[5px]">
                  {displayedTasks.length}
                </div>

                {/* Three-dot menu icon (visible on hover) */}
                <MoreVertical 
                  className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-auto"
                />
              </div>
            </div>
            
            {/* Expandable content - positioned below the main section */}
            {isSectionExpanded && (
              <div className="bg-transparent max-w-[980px]" style={{ marginBottom: '45px' }}>
                {/* Card-based task list */}
                <div className="space-y-3">
                  {sortSettings.creationDate ? (
                    getTasksByDateGroup(displayedTasks).map((group) => (
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
                            />
                          )
                        ))}
                      </div>
                    ))
                  ) : (
                    displayedTasks.map((task) => (
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
                  <Button
                    onClick={() => setIsAddingTask(true)}
                    variant="ghost"
                    className="w-full justify-start text-gray-400 hover:text-white hover:bg-[#2A2A2C] p-3 rounded-lg"
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Add a task
                  </Button>
                )}
              </div>
            )}
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
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-white transition-all text-sm my-1 rounded-xl hover:border hover:border-[#3b3a3a] hover:bg-[#1f1f1f]"
            onClick={() => handleOpenTask(contextMenu.taskId)}
          >
            <ChevronRight className="w-4 h-4" />
            <span>Open</span>
          </button>
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
        </div>
      )}

      <TaskWindowModal
        task={selectedTaskForModal}
        onClose={handleCloseModal}
        getLabelColor={getLabelColor}
        getPriorityStyle={getPriorityStyle}
        onTaskUpdate={(updatedTask) => {
          const updatedTasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
          setTasks(updatedTasks);
          localStorage.setItem('kario-tasks', JSON.stringify(updatedTasks));
        }}
        onNavigate={handleNavigateTask}
        allTasks={currentTaskView === 'deleted' ? deletedTasks : applyFiltersAndSort(tasks)}
        currentTaskIndex={selectedTaskForModal ? (currentTaskView === 'deleted' ? deletedTasks : applyFiltersAndSort(tasks)).findIndex(t => t.id === selectedTaskForModal.id) : -1}
        sectionName="Tasks Made By Kairo"
      />
    </div>
  );
};

export default Tasks;