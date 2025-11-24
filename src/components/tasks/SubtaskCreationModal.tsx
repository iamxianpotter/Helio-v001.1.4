import React, { useState } from 'react';
import { X, Calendar, Flag, Bell, Tag, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SubtaskCreationModalProps {
  onClose: () => void;
  onSubmit: (subtaskData: {
    title: string;
    description: string;
    priority: string;
    dueDate?: string;
    time?: string;
    reminder?: string;
    labels?: string[];
  }) => void;
  getLabelColor: (labelName: string) => string;
  getPriorityStyle: (priorityName: string) => { bg: string; text: string };
}

const SubtaskCreationModal: React.FC<SubtaskCreationModalProps> = ({
  onClose,
  onSubmit,
  getLabelColor,
  getPriorityStyle,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Priority 3');
  const [dueDate, setDueDate] = useState('');
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState('');
  const [labels, setLabels] = useState<string[]>([]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || undefined,
        time: time || undefined,
        reminder: reminder || undefined,
        labels: labels.length > 0 ? labels : undefined,
      });
      setTitle('');
      setDescription('');
      setPriority('Priority 3');
      setDueDate('');
      setTime('');
      setReminder('');
      setLabels([]);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1f1f1f] rounded-[20px] w-[600px] max-w-full h-auto max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-[#414141]">
          <h2 className="text-xl font-semibold text-white">Add a Subtask</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Title</label>
            <Input
              type="text"
              placeholder="Enter subtask title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#252527] border border-[#414141] text-white placeholder-gray-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Description</label>
            <textarea
              placeholder="Enter subtask description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#252527] border border-[#414141] text-white placeholder-gray-500 rounded-md p-3 text-sm resize-none h-24"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#252527] border border-[#414141] text-white rounded-md p-2 text-sm"
              >
                <option>Priority 1</option>
                <option>Priority 2</option>
                <option>Priority 3</option>
                <option>Priority 4</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#252527] border border-[#414141] text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-[#252527] border border-[#414141] text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Reminder
              </label>
              <Input
                type="text"
                placeholder="e.g., 1 hour before"
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="bg-[#252527] border border-[#414141] text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-[#414141] bg-[#161618]">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-[#414141] text-gray-400 hover:text-white hover:bg-[#252527]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Subtask
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubtaskCreationModal;
