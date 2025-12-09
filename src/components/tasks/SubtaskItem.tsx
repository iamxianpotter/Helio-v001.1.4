import React, { useState } from 'react';
import { Calendar, Flag, Bell, Repeat, Tag, ChevronRight, Edit, Trash2, ChevronDown, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  parentId: string | null;
  onToggle: (subtaskId: string) => void;
  onEdit: (subtaskId: string) => void;
  onDelete: (subtaskId: string) => void;
  onContextMenu: (e: React.MouseEvent, subtaskId: string) => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
  expandedLabelsSubtaskId: string | null;
  onToggleLabels: (subtaskId: string) => void;
  onDragStart?: (e: React.DragEvent, subtaskId: string, parentId: string | null) => void;
  onDragOver?: (e: React.DragEvent, subtaskId: string) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, subtaskId: string, parentId: string | null) => void;
  onDragEnd?: () => void;
  draggedTaskId?: string | null;
  dragOverTaskId?: string | null;
  onOpen?: (subtaskId: string, parentId?: string | null) => void;
  onAddNestedSubtask?: (parentSubtaskId: string) => void;
  onUpdateNestedSubtask?: (parentSubtaskId: string, updatedSubtask: Subtask) => void;
  onDeleteNestedSubtask?: (parentSubtaskId: string, nestedSubtaskId: string) => void;
  depth?: number;
  isTaskOpen?: boolean;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  parentId,
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
  draggedTaskId,
  dragOverTaskId,
  onOpen,
  onAddNestedSubtask,
  onUpdateNestedSubtask,
  onDeleteNestedSubtask,
  depth = 0,
  isTaskOpen,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isNestedExpanded, setIsNestedExpanded] = useState(false);
  const hasNestedSubtasks = subtask.subtasks && subtask.subtasks.length > 0;

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

  const priorityStyle = getPriorityStyle(subtask.priority);

  return (
    <div>
      <div
        className={`rounded-[12px] p-4 bg-transparent hover:bg-[#2a2a2a] transition-all relative ${
          draggedTaskId === subtask.id ? 'opacity-50' : ''
        } ${
          dragOverTaskId === subtask.id ? 'border border-blue-500' : ''
        }`}
        onContextMenu={(e) => onContextMenu(e, subtask.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsDeleteConfirming(false);
        }}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart?.(e, subtask.id, parentId);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDragOver?.(e, subtask.id);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          onDragLeave?.();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDrop?.(e, subtask.id, parentId);
        }}
        onDragEnd={(e) => {
          e.stopPropagation();
          onDragEnd?.();
        }}
        style={{ cursor: draggedTaskId === subtask.id ? 'grabbing' : 'grab', marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 flex items-center gap-2 mt-1">
            {hasNestedSubtasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNestedExpanded(!isNestedExpanded);
                }}
                className="p-0 text-gray-400 hover:text-white transition-all flex-shrink-0"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isNestedExpanded ? 'rotate-0' : '-rotate-90'}`}
                />
              </button>
            )}
            <div
              className={`w-4 h-4 border-2 rounded-full transition-colors flex-shrink-0 cursor-pointer ${
                subtask.completed
                  ? `${priorityStyle.bg} ${priorityStyle.text.replace('text', 'border')}`
                  : getPriorityCheckboxColor(subtask.priority)
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(subtask.id);
              }}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
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

              {hasNestedSubtasks && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-gray-400 bg-[#252527] px-2 py-1 rounded-full flex-shrink-0">
                        {subtask.subtasks!.length}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-[#1f1f1f] text-white rounded-xl border-0 z-50">
                      <p className="text-xs">{subtask.subtasks!.length} nested task{subtask.subtasks!.length !== 1 ? 's' : ''}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

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

                                              onOpen?.(subtask.id, parentId);

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

              

                                    {isTaskOpen && (

                                      <>

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

                                                onMouseDown={(e) => {

                                                  e.stopPropagation();

                                                  e.preventDefault();

                                                }}

                                                onClick={(e) => {

                                                  e.stopPropagation();

                                                  e.preventDefault();

                                                  handleDeleteClick(e);

                                                }}

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

                          

                          {subtask.description && (

                            <div className="mt-1">

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

              

                          <div className="flex items-center gap-2 flex-wrap mt-2">

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

                              const flagColor = getPriorityFlagColor(subtask.priority);

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

                                        <span className="inline-block max-w-[120px] truncate">{subtask.priority}</span>

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

                        </div>

                      </div>

                    </div>

              

                    {isNestedExpanded && hasNestedSubtasks && (

                      <div className="mt-2 space-y-1">

                        {subtask.subtasks!.map((nestedSubtask) => (

                          <SubtaskItem

                            key={nestedSubtask.id}

                            subtask={nestedSubtask}

                            parentId={subtask.id}

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

                            draggedTaskId={draggedTaskId}

                            dragOverTaskId={dragOverTaskId}

                            onOpen={onOpen}

                            onAddNestedSubtask={onAddNestedSubtask}

                            onUpdateNestedSubtask={onUpdateNestedSubtask}

                            onDeleteNestedSubtask={onDeleteNestedSubtask}

                            depth={depth + 1}

              			  isTaskOpen={isTaskOpen}

                          />

                        ))}

                      </div>

                    )}

                  </div>

                );

              };

              

              export default SubtaskItem;

