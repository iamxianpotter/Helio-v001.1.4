import React, { useState } from 'react';
import { Calendar, Flag, Bell, Repeat, Tag, ChevronRight, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import SubtaskItem from './SubtaskItem';

interface TaskItemProps {
  task: {
    id: string;
    title: string;
    completed: boolean;
    description: string;
    dueDate?: string;
    time?: string;
    priority: string;
    reminder?: string;
    labels?: string[];
    repeat?: string;
    isDraft?: boolean;
    subtasks?: any[];
  };
  parentId: string | null;
  draggedTaskId: string | null;
  dragOverTaskId: string | null;
  expandedLabelsTaskId: string | null;
  onContextMenu: (e: React.MouseEvent, taskId: string) => void;
  onDragStart: (e: React.DragEvent, taskId: string, parentId: string | null) => void;
  onDragOver: (e: React.DragEvent, taskId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, taskId: string, parentId: string | null) => void;
  onDragEnd: () => void;
  onToggle: (taskId: string) => void;
  onToggleLabels: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
  isDeleted?: boolean;
  onLabelClick?: (label: string) => void;
  expandedTaskId?: string | null;
  onToggleExpand?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  parentId,
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
  isDeleted = false,
  onLabelClick,
  expandedTaskId,
  onToggleExpand,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const getCompletedSubtasksCount = () => {
    if (!task.subtasks) return 0;
    const countCompleted = (subtasks: any[]): number => {
      return subtasks.reduce((count, st) => {
        return count + (st.completed ? 1 : 0) + (st.subtasks ? countCompleted(st.subtasks) : 0);
      }, 0);
    };
    return countCompleted(task.subtasks);
  };

  const getTotalSubtasksCount = () => {
    if (!task.subtasks) return 0;
    const countAll = (subtasks: any[]): number => {
      return subtasks.reduce((count, st) => {
        return count + 1 + (st.subtasks ? countAll(st.subtasks) : 0);
      }, 0);
    };
    return countAll(task.subtasks);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirming(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id);
    setIsDeleteConfirming(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirming(false);
  };

  const getPriorityCheckboxColor = (priority: string) => {
    const priorityStyle = getPriorityStyle(priority);
    if (priority.startsWith('Priority ')) {
      const level = parseInt(priority.replace('Priority ', ''));
      const colorMap = {
        1: 'border-red-500 hover:border-red-400',
        2: 'border-orange-500 hover:border-orange-400',
        3: 'border-yellow-500 hover:border-yellow-400',
        4: 'border-green-500 hover:border-green-400',
        5: 'border-blue-500 hover:border-blue-400',
        6: 'border-purple-500 hover:border-purple-400',
      };
      return colorMap[level as keyof typeof colorMap] || 'border-gray-400 hover:border-gray-300';
    }
    const customPrioritiesJson = localStorage.getItem('kario-custom-priorities');
    if (customPrioritiesJson) {
      const customPriorities = JSON.parse(customPrioritiesJson);
      const customPriority = customPriorities.find((p: { name: string; color: string }) => p.name === priority);
      if (customPriority) {
        const colorTextClass = customPriority.color;
        const colorMap: { [key: string]: string } = {
          'text-red-500': 'border-red-500 hover:border-red-400',
          'text-orange-500': 'border-orange-500 hover:border-orange-400',
          'text-yellow-500': 'border-yellow-500 hover:border-yellow-400',
          'text-green-500': 'border-green-500 hover:border-green-400',
          'text-blue-500': 'border-blue-500 hover:border-blue-400',
          'text-cyan-500': 'border-cyan-500 hover:border-cyan-400',
          'text-emerald-500': 'border-emerald-500 hover:border-emerald-400',
          'text-teal-500': 'border-teal-500 hover:border-teal-400',
          'text-sky-500': 'border-sky-500 hover:border-sky-400',
          'text-amber-500': 'border-amber-500 hover:border-amber-400',
          'text-lime-500': 'border-lime-500 hover:border-lime-400',
          'text-pink-500': 'border-pink-500 hover:border-pink-400',
          'text-rose-500': 'border-rose-500 hover:border-rose-400',
          'text-fuchsia-500': 'border-fuchsia-500 hover:border-fuchsia-400',
          'text-slate-400': 'border-slate-400 hover:border-slate-300',
          'text-gray-400': 'border-gray-400 hover:border-gray-300',
          'text-zinc-400': 'border-zinc-400 hover:border-zinc-300',
          'text-stone-400': 'border-stone-400 hover:border-stone-300',
          'text-red-600': 'border-red-600 hover:border-red-500',
          'text-orange-600': 'border-orange-600 hover:border-orange-500',
          'text-lime-600': 'border-lime-600 hover:border-lime-500',
          'text-emerald-600': 'border-emerald-600 hover:border-emerald-500',
          'text-indigo-500': 'border-indigo-500 hover:border-indigo-400',
          'text-violet-500': 'border-violet-500 hover:border-violet-400',
        };
        return colorMap[colorTextClass] || 'border-gray-400 hover:border-gray-300';
      }
    }
    const colorClassFromStyle = priorityStyle.text;
    const colorMap: { [key: string]: string } = {
      'text-red-500': 'border-red-500 hover:border-red-400',
      'text-orange-500': 'border-orange-500 hover:border-orange-400',
      'text-yellow-500': 'border-yellow-500 hover:border-yellow-400',
      'text-green-500': 'border-green-500 hover:border-green-400',
      'text-blue-500': 'border-blue-500 hover:border-blue-400',
      'text-cyan-500': 'border-cyan-500 hover:border-cyan-400',
      'text-emerald-500': 'border-emerald-500 hover:border-emerald-400',
      'text-teal-500': 'border-teal-500 hover:border-teal-400',
      'text-sky-500': 'border-sky-500 hover:border-sky-400',
      'text-amber-500': 'border-amber-500 hover:border-amber-400',
      'text-lime-500': 'border-lime-500 hover:border-lime-400',
      'text-pink-500': 'border-pink-500 hover:border-pink-400',
      'text-rose-500': 'border-rose-500 hover:border-rose-400',
      'text-fuchsia-500': 'border-fuchsia-500 hover:border-fuchsia-400',
      'text-slate-400': 'border-slate-400 hover:border-slate-300',
      'text-gray-400': 'border-gray-400 hover:border-gray-300',
      'text-zinc-400': 'border-zinc-400 hover:border-zinc-300',
      'text-stone-400': 'border-stone-400 hover:border-stone-300',
    };
    return colorMap[colorClassFromStyle] || 'border-gray-400 hover:border-gray-300';
  };

  const getPriorityFlagColor = (priority: string) => {
    if (priority.startsWith('Priority ')) {
      const level = parseInt(priority.replace('Priority ', ''));
      const colorMap = {
        1: 'text-red-500',
        2: 'text-orange-500',
        3: 'text-yellow-500',
        4: 'text-green-500',
        5: 'text-blue-500',
        6: 'text-purple-500',
      };
      return colorMap[level as keyof typeof colorMap] || 'text-gray-400';
    }
    const customPrioritiesJson = localStorage.getItem('kario-custom-priorities');
    if (customPrioritiesJson) {
      const customPriorities = JSON.parse(customPrioritiesJson);
      const customPriority = customPriorities.find((p: { name: string; color: string }) => p.name === priority);
      if (customPriority) {
        return customPriority.color;
      }
    }
    const style = getPriorityStyle(priority);
    return style.text || 'text-gray-400';
  };

  return (
    <div
      key={task.id}
      className={`rounded-[12px] p-4 bg-transparent hover:bg-[#1f1f1f] transition-all relative ${
        draggedTaskId === task.id ? 'opacity-50' : ''
      } ${
        dragOverTaskId === task.id ? 'border border-blue-500' : ''
      }`}
      onContextMenu={(e) => onContextMenu(e, task.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDeleteConfirming(false);
      }}
      draggable
      onDragStart={(e) => onDragStart(e, task.id, parentId)}
      onDragOver={(e) => onDragOver(e, task.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, task.id, parentId)}
      onDragEnd={onDragEnd}
      style={{ cursor: draggedTaskId === task.id ? 'grabbing' : 'grab' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1">
          {hasSubtasks && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.(task.id);
              }}
              className="p-0 text-gray-400 hover:text-white transition-all flex-shrink-0"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  expandedTaskId === task.id ? 'rotate-90' : 'rotate-0'
                }`}
              />
            </button>
          )}
        </div>
        <div
          className={`w-4 h-4 border-2 rounded-full transition-colors flex-shrink-0 ${
            isDeleted || task.isDraft ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          } ${
            task.completed
              ? `bg-white border-white`
              : getPriorityCheckboxColor(task.priority)
          }`}
          onClick={(e) => {
            if (!isDeleted && !task.isDraft) {
              e.stopPropagation();
              onToggle(task.id);
            }
          }}
        />
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className={`text-base font-semibold flex-1 truncate ${
                task.completed ? 'text-gray-400 line-through' : 'text-white'
              }`}>
                {task.title}
              </h3>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
              <p className="max-w-sm">{task.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {hasSubtasks && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="px-2 py-0.5 bg-[#252527] border border-[#414141] rounded-full text-xs text-gray-300 flex-shrink-0">
                  {getCompletedSubtasksCount()}/{getTotalSubtasksCount()}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="text-xs">{getCompletedSubtasksCount()} of {getTotalSubtasksCount()} subtasks completed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <span className="px-2 py-0.5 bg-[#252527] border border-[#414141] rounded-full text-xs text-white font-orbitron font-bold">K</span>

        {/* Action buttons on hover */}
        {isHovered && (
          <div className="flex items-center gap-1 ml-auto">
            {!isDeleteConfirming ? (
              <>
                {isDeleted ? (
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTask(task.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/30 transition-all text-xs font-medium"
                        >
                          Restore
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                        <p className="text-xs">Restore Task</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTask(task.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-all"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                          <p className="text-xs">Open</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              onEditTask(task.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                          <p className="text-xs">Edit</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={handleDeleteClick}
                            className="p-1.5 rounded-lg hover:bg-[#2a2a2a] text-gray-400 hover:text-white transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                          <p className="text-xs">Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
              </>
            ) : (
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-xs font-medium"
              >
                Confirm Delete
              </button>
            )}
          </div>
        )}
      </div>

      {task.description && (
        <div className="mb-3 ml-6 flex items-start">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-300 cursor-help line-clamp-2">
                  {task.description}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="max-w-sm">{task.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="ml-6 flex items-center gap-2 flex-wrap mt-2">
        {(task.dueDate || task.time) && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full text-xs text-gray-300 cursor-help">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {task.dueDate && task.time ? `${task.dueDate} ${task.time}` : task.dueDate || task.time}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="text-xs">
                  {task.dueDate && task.time ? `Due: ${task.dueDate} at ${task.time}` : `Due: ${task.dueDate || task.time}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {task.priority && (() => {
          const style = getPriorityStyle(task.priority);
          const flagColor = getPriorityFlagColor(task.priority);
          const getColorHex = (colorClass: string): string => {
            const colorMap: { [key: string]: string } = {
              'text-red-500': '#ef4444',
              'text-orange-500': '#f97316',
              'text-yellow-500': '#eab308',
              'text-green-500': '#22c55e',
              'text-blue-500': '#3b82f6',
              'text-cyan-500': '#06b6d4',
              'text-emerald-500': '#10b981',
              'text-teal-500': '#14b8a6',
              'text-sky-500': '#0ea5e9',
              'text-amber-500': '#f59e0b',
              'text-lime-500': '#84cc16',
              'text-pink-500': '#ec4899',
              'text-rose-500': '#f43f5e',
              'text-fuchsia-500': '#d946ef',
              'text-slate-400': '#cbd5e1',
              'text-gray-400': '#9ca3af',
              'text-zinc-400': '#a1a5ab',
              'text-stone-400': '#a8a29e',
              'text-purple-500': '#a855f7'
            };
            return colorMap[colorClass] || '#9ca3af';
          };
          return (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 bg-transparent cursor-help border`}
                    style={{
                      borderColor: getColorHex(flagColor),
                      color: getColorHex(flagColor)
                    }}
                  >
                    <Flag className={`h-3 w-3`} style={{ color: getColorHex(flagColor) }} />
                    <span className="inline-block max-w-[120px] truncate">{task.priority}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                  <p className="text-xs">Priority: {task.priority}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })()}

        {task.reminder && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full cursor-help">
                  <Bell className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300">{task.reminder}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="text-xs">Reminder: {task.reminder}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {task.repeat && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full cursor-help">
                  <Repeat className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300">Repeats</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="text-xs">Repeats: {task.repeat.replace(/-/g, ' ')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {task.labels && task.labels.length > 0 && (
          <div className="relative">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLabels(task.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full hover:border-[#525252] transition-all duration-200 cursor-pointer w-fit"
                  >
                    {task.labels.map((label, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLabelClick?.(label);
                        }}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <Tag
                          className={`h-4 w-4 ${getLabelColor(label)} transition-all duration-200`}
                        />
                      </button>
                    ))}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border border-[#414141] z-50 p-2">
                  <div className="flex flex-col gap-2">
                    {task.labels.map((label, index) => (
                      <button
                        key={index}
                        onClick={() => onLabelClick?.(label)}
                        className="flex items-center gap-2 hover:opacity-70 transition-opacity text-left"
                      >
                        <Tag className={`h-3 w-3 ${getLabelColor(label)}`} />
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {expandedLabelsTaskId === task.id && (
              <div className="absolute top-full mt-1 left-0 bg-[#1f1f1f] border border-[#414141] rounded-[12px] p-3 z-50 shadow-xl whitespace-nowrap">
                <div className="flex flex-col gap-2">
                  {task.labels.map((label, index) => (
                    <button
                      key={index}
                      onClick={() => onLabelClick?.(label)}
                      className="flex items-center gap-2 text-white hover:opacity-70 transition-opacity text-left"
                    >
                      <Tag className={`h-4 w-4 ${getLabelColor(label)}`} />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {expandedTaskId === task.id && hasSubtasks && (
        <div className="mt-2 space-y-1 ml-6">
          {task.subtasks!.map((subtask) => (
            <SubtaskItem
              key={subtask.id}
              subtask={subtask}
              parentId={task.id}
              onToggle={onToggle}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onContextMenu={onContextMenu}
              getLabelColor={getLabelColor}
              getPriorityStyle={getPriorityStyle}
              expandedLabelsSubtaskId={expandedLabelsTaskId}
              onToggleLabels={onToggleLabels}
              onOpen={onOpenTask}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              draggedTaskId={draggedTaskId}
              dragOverTaskId={dragOverTaskId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
