import React from 'react';
import { Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateSelector from '@/components/tasks/DateSelector';
import PrioritySelector from '@/components/tasks/PrioritySelector';
import ReminderSelector from '@/components/tasks/ReminderSelector';
import LabelSelector from '@/components/tasks/LabelSelector';

interface TaskCreationFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  selectedDate?: Date;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
  selectedPriority: string;
  onPrioritySelect: (priority: string) => void;
  selectedReminder?: string;
  onReminderSelect: (reminder: string | undefined) => void;
  selectedLabels: string[];
  onLabelsSelect: (labels: string[]) => void;
  selectedRepeat?: string;
  onRepeatSelect: (repeat: string) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSave: () => void;
  showDraftButton?: boolean;
  autoFocus?: boolean;
  mode?: 'create' | 'edit';
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  selectedPriority,
  onPrioritySelect,
  selectedReminder,
  onReminderSelect,
  selectedLabels,
  onLabelsSelect,
  selectedRepeat = '',
  onRepeatSelect,
  onCancel,
  onSaveDraft,
  onSave,
  showDraftButton = false,
  autoFocus = true,
  mode = 'create',
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="p-4 bg-transparent border border-[#525252] rounded-[20px] min-h-[160px] relative z-10 overflow-visible">
      <div className="mb-2">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={mode === 'edit' ? 'Task name' : 'Task title'}
          className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base font-semibold"
          autoFocus={autoFocus}
        />
      </div>

      <div className="mb-2">
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Description"
          className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 p-0 resize-none min-h-[40px] outline-none text-sm"
        />
      </div>

      <div className="border-t border-[#414141] mb-4"></div>

      <div className="flex flex-wrap justify-between items-center gap-2 relative z-20">
        <div className="border border-[#414141] rounded-[20px] p-2 flex flex-wrap gap-2 relative z-30 bg-[#1b1b1b]">
          <DateSelector
            selectedDate={selectedDate}
            onSelect={onDateSelect}
            onTimeSelect={onTimeSelect}
            selectedRepeat={selectedRepeat}
            onRepeatSelect={onRepeatSelect}
          />
          <PrioritySelector
            selectedPriority={selectedPriority}
            onSelect={onPrioritySelect}
          />
          <ReminderSelector
            selectedReminder={selectedReminder}
            onSelect={onReminderSelect}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
          <LabelSelector
            selectedLabels={selectedLabels}
            onSelect={onLabelsSelect}
          />
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent">
            <Link className="h-4 w-4 mr-2" />
            Link
          </Button>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            className="border border-[#690707] rounded-[10px] bg-[#391e1e] text-[crimson] hover:bg-[#391e1e] hover:text-[crimson]"
          >
            Cancel
          </Button>
          {showDraftButton && (
            <Button
              onClick={onSaveDraft}
              disabled={!title.trim()}
              variant="ghost"
              size="sm"
              className={`border border-[#5f5c74] rounded-[10px] text-[#dedede] transition-all ${
                title.trim()
                  ? 'bg-[#13132f] hover:bg-[#13132f] hover:text-[#dedede]'
                  : 'bg-[#0d0d1a] opacity-50 cursor-not-allowed'
              }`}
            >
              Draft
            </Button>
          )}
          <Button
            onClick={onSave}
            size="sm"
            disabled={!title.trim()}
            className={`border rounded-[14px] transition-all ${
              title.trim()
                ? 'border-[#252232] bg-white text-[#252232] hover:bg-white hover:text-[#252232]'
                : 'border-[#3a3a3a] bg-[#2a2a2a] text-[#5a5a5a] cursor-not-allowed'
            }`}
          >
            {mode === 'edit' ? 'Save' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskCreationForm;
