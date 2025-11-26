import React, { useState } from 'react';
import { Calendar, Flag, Bell, Repeat, Tag, ChevronRight, Edit, Trash2, Plus, ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Subtask {
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
  subtasks?: Subtask[];
}

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: string) => void;
  onEdit: (subtaskId: string) => void;
  onDelete: (subtaskId: string) => void;
  onContextMenu: (e: React.MouseEvent, subtaskId: string) => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
  expandedLabelsSubtaskId: string | null;
  onToggleLabels: (subtaskId: string) => void;
  onDragStart?: (e: React.DragEvent, subtaskId: string) => void;
  onDragOver?: (e: React.DragEvent, subtaskId: string) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, subtaskId: string) => void;
  onDragEnd?: () => void;
  draggedSubtaskId?: string | null;
  dragOverSubtaskId?: string | null;
  onAddSubsubtask?: (parentSubtaskId: string) => void;
  onToggleSubtasks?: (subtaskId: string) => void;
  expandedSubtasksIds?: Set<string>;
  depth?: number;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onEdit,
  onDelete,
  onContextMenu,
  getLabelColor,
  getPriorityStyle,
  expandedLabelsSubtaskId,
  onToggleLabels,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedSubtaskId,
  dragOverSubtaskId,
  onAddSubsubtask,
  onToggleSubtasks,
  expandedSubtasksIds = new Set(),
  depth = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const hasSubtasks = subtask.subtasks && subtask.subtasks.length > 0;
  const isExpanded = expandedSubtasksIds.has(subtask.id);

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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteConfirming(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(subtask.id);
    setIsDeleteConfirming(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirming(false);
  };

  return (
    <div
      className={`rounded-[12px] p-4 bg-transparent hover:bg-[#2a2a2a] transition-all relative ${
        draggedSubtaskId === subtask.id ? 'opacity-50' : ''
      } ${
        dragOverSubtaskId === subtask.id ? 'border border-blue-500' : ''
      }`}
      onContextMenu={(e) => onContextMenu(e, subtask.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsDeleteConfirming(false);
      }}
      draggable
      onDragStart={(e) => onDragStart?.(e, subtask.id)}
      onDragOver={(e) => onDragOver?.(e, subtask.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop?.(e, subtask.id)}
      onDragEnd={onDragEnd}
      style={{ cursor: draggedSubtaskId === subtask.id ? 'grabbing' : 'grab' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-4 h-4 border-2 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
            subtask.completed
              ? 'bg-white border-white'
              : getPriorityCheckboxColor(subtask.priority)
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(subtask.id);
          }}
        />
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className={`text-base font-semibold flex-1 truncate ${
                subtask.completed ? 'text-gray-400 line-through' : 'text-white'
              }`}>
                {subtask.title}
              </h3>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
              <p className="max-w-sm">{subtask.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Action buttons on hover */}
        {isHovered && (
          <div className="flex items-center gap-1 ml-auto">
            {!isDeleteConfirming ? (
              <>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(subtask.id);
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

      {subtask.description && (
        <div className="mb-3 ml-6">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-gray-300 cursor-help line-clamp-2">
                  {subtask.description}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="max-w-sm">{subtask.description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="ml-6 flex items-center gap-2 flex-wrap">
        {(subtask.dueDate || subtask.time) && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full text-xs text-gray-300 cursor-help">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {subtask.dueDate && subtask.time ? `${subtask.dueDate} ${subtask.time}` : subtask.dueDate || subtask.time}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="text-xs">
                  {subtask.dueDate && subtask.time ? `Due: ${subtask.dueDate} at ${subtask.time}` : `Due: ${subtask.dueDate || subtask.time}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {subtask.priority && (() => {
          const style = getPriorityStyle(subtask.priority);
          return (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${style.bg} ${style.text} cursor-help`}>
                    <Flag className={`h-3 w-3 ${style.text}`} />
                    <span>{subtask.priority}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                  <p className="text-xs">Priority: {subtask.priority}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })()}

        {subtask.reminder && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full cursor-help">
                  <Bell className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300">{subtask.reminder}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="text-xs">Reminder: {subtask.reminder}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {subtask.repeat && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full cursor-help">
                  <Repeat className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-300">Repeats</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                <p className="text-xs">Repeats: {subtask.repeat.replace(/-/g, ' ')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {subtask.labels && subtask.labels.length > 0 && (
          <div className="relative">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLabels(subtask.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#252527] border border-[#414141] rounded-full hover:border-[#525252] transition-all duration-200 cursor-pointer w-fit"
                  >
                    {subtask.labels.map((label, index) => (
                      <Tag
                        key={index}
                        className={`h-4 w-4 ${getLabelColor(label)} transition-all duration-200`}
                      />
                    ))}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="bg-[#1f1f1f] text-white rounded-xl border border-[#414141] z-50 p-2">
                  <div className="flex flex-col gap-2">
                    {subtask.labels.map((label, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Tag className={`h-3 w-3 ${getLabelColor(label)}`} />
                        <span className="text-xs">{label}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {expandedLabelsSubtaskId === subtask.id && (
              <div className="absolute top-full mt-1 left-0 bg-[#1f1f1f] border border-[#414141] rounded-[12px] p-3 z-50 shadow-xl whitespace-nowrap">
                <div className="flex flex-col gap-2">
                  {subtask.labels.map((label, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Tag className={`h-4 w-4 ${getLabelColor(label)}`} />
                      <span className="text-xs text-white">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nested Subtasks */}
      {hasSubtasks && (
        <div className="mt-2 ml-6">
          <button
            onClick={() => onToggleSubtasks?.(subtask.id)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors mb-2"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
            <span>{subtask.subtasks!.length} sub-task{subtask.subtasks!.length !== 1 ? 's' : ''}</span>
          </button>

          {isExpanded && (
            <div className="space-y-2 border-l border-[#414141] pl-4 ml-2">
              {subtask.subtasks!.map((subsubtask) => (
                <SubtaskItem
                  key={subsubtask.id}
                  subtask={subsubtask}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onContextMenu={onContextMenu}
                  getLabelColor={getLabelColor}
                  getPriorityStyle={getPriorityStyle}
                  expandedLabelsSubtaskId={expandedLabelsSubtaskId}
                  onToggleLabels={onToggleLabels}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  draggedSubtaskId={draggedSubtaskId}
                  dragOverSubtaskId={dragOverSubtaskId}
                  onAddSubsubtask={onAddSubsubtask}
                  onToggleSubtasks={onToggleSubtasks}
                  expandedSubtasksIds={expandedSubtasksIds}
                  depth={depth + 1}
                />
              ))}
              <button
                onClick={() => onAddSubsubtask?.(subtask.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                Add a subtask
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubtaskItem;
