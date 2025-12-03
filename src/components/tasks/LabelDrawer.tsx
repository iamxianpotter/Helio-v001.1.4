import React, { useState } from 'react';
import { X } from 'lucide-react';
import TaskItem from './TaskItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DateSelector from './DateSelector';
import PrioritySelector from './PrioritySelector';
import ReminderSelector from './ReminderSelector';
import LabelSelector from './LabelSelector';
import { Link } from 'lucide-react';

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
  editingTaskId?: string | null;
  editTitle?: string;
  editDescription?: string;
  editPriority?: string;
  editDate?: Date | undefined;
  selectedTime?: string;
  selectedReminder?: string | undefined;
  selectedLabels?: string[];
  selectedRepeat?: string;
  onSetEditTitle?: (title: string) => void;
  onSetEditDescription?: (desc: string) => void;
  onSetEditPriority?: (priority: string) => void;
  onSetEditDate?: (date: Date | undefined) => void;
  onSetSelectedTime?: (time: string) => void;
  onSetSelectedReminder?: (reminder: string | undefined) => void;
  onSetSelectedLabels?: (labels: string[]) => void;
  onSetSelectedRepeat?: (repeat: string) => void;
  onSaveEdit?: () => void;
  onSaveDraftEdit?: () => void;
  onCancelEdit?: () => void;
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
  editingTaskId,
  editTitle = '',
  editDescription = '',
  editPriority = '',
  editDate,
  selectedTime = '',
  selectedReminder,
  selectedLabels = [],
  selectedRepeat = '',
  onSetEditTitle,
  onSetEditDescription,
  onSetEditPriority,
  onSetEditDate,
  onSetSelectedTime,
  onSetSelectedReminder,
  onSetSelectedLabels,
  onSetSelectedRepeat,
  onSaveEdit,
  onSaveDraftEdit,
  onCancelEdit,
}) => {
  const [drawerWidth, setDrawerWidth] = useState(editingTaskId ? 700 : 450);
  const [isResizing, setIsResizing] = useState(false);

  React.useEffect(() => {
    if (editingTaskId) {
      setDrawerWidth(700);
    } else {
      setDrawerWidth(450);
    }
  }, [editingTaskId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
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
          className={`absolute left-0 top-0 bottom-0 w-1 bg-transparent cursor-col-resize transition-all duration-200 hover:w-1.5 hover:bg-gradient-to-b hover:from-blue-500/50 hover:via-blue-500/30 hover:to-blue-500/50 group`}
          onMouseDown={handleMouseDown}
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
                  <span className={`h-5 w-5 flex items-center justify-center font-orbitron font-bold text-xl ${getLabelColor(label)}`}>
                    #
                  </span>
                  <h2 className={`text-white text-xl font-semibold truncate ${getLabelColor(label)}`}>
                    {label}
                  </h2>
                  <div className={`bg-[#242628] border border-[#414141] font-orbitron font-bold px-3 py-1 rounded-[5px] ml-auto ${getLabelColor(label)}`}>
                    {tasks.length}
                  </div>
                </div>

                <div className="space-y-3">
                  {tasks.map((task) => (
                    editingTaskId === task.id && onSetEditTitle && onSetEditDescription ? (
                      <div key={task.id} className="p-4 bg-transparent border border-[#525252] rounded-[20px] min-h-[160px] relative z-10 overflow-visible">
                        <div className="mb-2">
                          <Input
                            value={editTitle}
                            onChange={(e) => onSetEditTitle(e.target.value)}
                            placeholder="Task name"
                            className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 px-0 py-1 text-base font-semibold"
                            autoFocus
                          />
                        </div>

                        <div className="mb-4">
                          <textarea
                            value={editDescription}
                            onChange={(e) => onSetEditDescription(e.target.value)}
                            placeholder="Description"
                            className="w-full bg-transparent border-none text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-0 px-0 py-1 resize-none min-h-[60px] text-sm"
                          />
                        </div>

                        <div className="border-t border-[#414141] mb-4"></div>

                        <div className="flex flex-wrap justify-between items-center gap-2 relative z-20">
                          <div className="border border-[#414141] rounded-[20px] p-2 flex flex-wrap gap-2 relative z-30 bg-[#1b1b1b]">
                            <DateSelector
                              selectedDate={editDate}
                              onSelect={onSetEditDate || (() => {})}
                              onTimeSelect={onSetSelectedTime || (() => {})}
                              selectedRepeat={selectedRepeat}
                              onRepeatSelect={onSetSelectedRepeat || (() => {})}
                            />
                            <PrioritySelector
                              selectedPriority={editPriority}
                              onSelect={onSetEditPriority || (() => {})}
                            />
                            <ReminderSelector
                              selectedReminder={selectedReminder}
                              onSelect={onSetSelectedReminder || (() => {})}
                              selectedDate={editDate}
                              selectedTime={selectedTime}
                            />
                            <LabelSelector
                              selectedLabels={selectedLabels}
                              onSelect={onSetSelectedLabels || (() => {})}
                            />
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
                              <Link className="h-4 w-4 mr-2" />
                              Link
                            </Button>
                          </div>

                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={onCancelEdit}
                              variant="ghost"
                              size="sm"
                              className="border border-[#690707] rounded-[10px] bg-[#391e1e] text-[crimson] hover:bg-[#391e1e] hover:text-[crimson]"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={onSaveDraftEdit}
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
                              onClick={onSaveEdit}
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
                    )
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
