import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, X } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ReminderSelectorProps {
  selectedReminder?: string;
  onSelect: (reminder: string | undefined) => void;
  selectedDate?: Date;
  selectedTime?: string;
}

interface CustomReminderData {
  value: string;
  label: string;
}

const ReminderSelector: React.FC<ReminderSelectorProps> = ({ selectedReminder, onSelect, selectedDate, selectedTime }) => {
  const [open, setOpen] = useState(false);
  const [tempSelectedReminder, setTempSelectedReminder] = useState<string | undefined>(selectedReminder);
  const [customInput, setCustomInput] = useState('');
  const [parsedReminder, setParsedReminder] = useState<string | null>(null);
  const [recentCustomReminders, setRecentCustomReminders] = useState<CustomReminderData[]>(() => {
    const saved = localStorage.getItem('kario-custom-reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const parseReminderInput = (input: string): string | null => {
    if (!input.trim()) return null;

    const normalizedInput = input.toLowerCase().trim();

    // Check for exact time format (e.g., "3pm", "14:30", "3:30pm")
    const timePatterns = [
      /^(\d{1,2})[:|\ ](\d{1,2})\s*(am|pm)$/i,
      /^(\d{1,2})\s*(am|pm)$/i,
      /^(\d{1,2})[:|\ ](\d{1,2})$/i,
    ];

    for (const pattern of timePatterns) {
      const match = normalizedInput.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        let minutes = match[2] && !['am', 'pm'].includes(match[2].toLowerCase()) ? parseInt(match[2]) : 0;
        let period = match[3] || (match[2] && ['am', 'pm'].includes(match[2].toLowerCase()) ? match[2] : null);

        if (period && typeof period === 'string' && (period.toLowerCase() === 'am' || period.toLowerCase() === 'pm')) {
          if (period.toLowerCase() === 'pm' && hours !== 12) {
            hours += 12;
          } else if (period.toLowerCase() === 'am' && hours === 12) {
            hours = 0;
          }
        }

        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
          const time24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          return `at:${time24}`;
        }
      }
    }

    // Check if it contains "after"
    const isAfter = normalizedInput.includes('after');

    const patterns = [
      { regex: /(\d+)\s*minute/i, unit: 'minutes' },
      { regex: /(\d+)\s*min/i, unit: 'minutes' },
      { regex: /(\d+)\s*hour/i, unit: 'hours' },
      { regex: /(\d+)\s*hr/i, unit: 'hours' },
      { regex: /(\d+)\s*day/i, unit: 'days' },
      { regex: /(\d+)\s*week/i, unit: 'weeks' },
      { regex: /(\d+)\s*month/i, unit: 'months' },
      { regex: /(\d+)\s*second/i, unit: 'seconds' },
      { regex: /(\d+)\s*sec/i, unit: 'seconds' },
    ];

    for (const { regex, unit } of patterns) {
      const match = normalizedInput.match(regex);
      if (match) {
        const value = match[1];
        const prefix = isAfter ? '+' : '';
        return `${prefix}${value}${unit.charAt(0)}`;
      }
    }

    return null;
  };

  useEffect(() => {
    const parsed = parseReminderInput(customInput);
    setParsedReminder(parsed);
  }, [customInput]);

  const handleReminderSelect = (value: string) => {
    if (!selectedDate || !selectedTime) {
      return;
    }
    setTempSelectedReminder(value);
    onSelect(value);
    setOpen(false);
  };

  const handleApplyCustom = () => {
    if (parsedReminder && selectedDate && selectedTime) {
      const newCustomReminder: CustomReminderData = {
        value: parsedReminder,
        label: getDisplayLabel(parsedReminder)
      };

      const updatedRecents = [newCustomReminder, ...recentCustomReminders.filter(r => r.value !== parsedReminder)].slice(0, 10);
      setRecentCustomReminders(updatedRecents);
      localStorage.setItem('kario-custom-reminders', JSON.stringify(updatedRecents));

      setTempSelectedReminder(parsedReminder);
      onSelect(parsedReminder);
      setCustomInput('');
      setParsedReminder(null);
      setOpen(false);
    }
  };

  const handleClearReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempSelectedReminder(undefined);
    onSelect(undefined);
    setOpen(false);
  };

  const handleDeleteCustomReminder = (reminderValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedRecents = recentCustomReminders.filter(r => r.value !== reminderValue);
    setRecentCustomReminders(updatedRecents);
    localStorage.setItem('kario-custom-reminders', JSON.stringify(updatedRecents));
  };

  const getDisplayLabel = (value: string | undefined) => {
    if (!value) return 'Reminder';

    if (value === 'at-time') {
      return 'At time of task';
    }

    // Check for exact time format (at:HH:MM)
    if (value.startsWith('at:')) {
      const time24 = value.substring(3);
      const [hours24Str, minutes] = time24.split(':');
      const hours24 = parseInt(hours24Str);
      const displayHours = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
      const displayPeriod = hours24 >= 12 ? 'PM' : 'AM';
      return `At ${displayHours}:${minutes} ${displayPeriod}`;
    }

    // Check for "after" reminders (starts with +)
    const isAfter = value.startsWith('+');
    const cleanValue = isAfter ? value.substring(1) : value;

    const match = cleanValue.match(/^(\d+)([mhdws])/);
    if (match) {
      const num = match[1];
      const unit = match[2];
      const unitMap: Record<string, string> = {
        'm': 'min',
        'h': 'hour',
        'd': 'day',
        'w': 'week',
        's': 'sec',
      };
      const suffix = isAfter ? 'after' : 'before';
      return `${num} ${unitMap[unit]}${parseInt(num) > 1 ? 's' : ''} ${suffix}`;
    }

    return value;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent relative",
            tempSelectedReminder && "text-white border-[#252232] bg-[#1e1e1f] rounded-[8px]"
          )}
        >
          <Bell className={cn("h-4 w-4 mr-2 transition-all", tempSelectedReminder ? "text-white drop-shadow-lg" : "text-gray-400")} />
          {getDisplayLabel(tempSelectedReminder)}
          {tempSelectedReminder && (
            <X
              className="h-3 w-3 ml-2 hover:text-red-400"
              onClick={handleClearReminder}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-[#1b1b1b] border border-[#414141] rounded-[12px] overflow-hidden flex flex-col"
        align="start"
        side="right"
        sideOffset={8}
      >
        <div className="flex flex-col">
          <div className="p-3">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g., 1 day after, 3pm, 10 minutes before"
              className="w-full bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none"
              disabled={!selectedDate || !selectedTime}
            />
            {(!selectedDate || !selectedTime) && (
              <p className="text-xs text-gray-500 mt-1">
                {!selectedDate ? 'Please select a date first' : 'Please select a time first'}
              </p>
            )}
          </div>

          {parsedReminder && selectedDate && selectedTime && (
            <div className="px-3 pb-3">
              <Button
                onClick={handleApplyCustom}
                size="sm"
                className="w-full bg-[#252525] text-white hover:bg-[#2e2e2e] border border-[#414141] rounded-[10px] h-9 text-sm"
              >
                Apply: {getDisplayLabel(parsedReminder)}
              </Button>
            </div>
          )}

          {/* Recent Custom Reminders */}
          {recentCustomReminders.length > 0 && (
            <div className="px-3 pb-3 space-y-2">
              <div className="text-xs text-gray-500 mb-2">Recent Custom</div>
              {recentCustomReminders.map((customRem, index) => (
                <div key={index} className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReminderSelect(customRem.value)}
                    disabled={!selectedDate || !selectedTime}
                    className={cn(
                      "w-full justify-start text-left border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                      tempSelectedReminder === customRem.value
                        ? "bg-white text-black"
                        : "bg-[#252525] text-gray-300 hover:bg-white hover:text-black"
                    )}
                  >
                    <Bell className={cn("h-4 w-4 mr-2 transition-all", tempSelectedReminder === customRem.value ? "text-white drop-shadow-lg" : "text-gray-400")} />
                    {customRem.label}
                  </Button>
                  <button
                    onClick={(e) => handleDeleteCustomReminder(customRem.value, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-500/30 rounded-md"
                  >
                    <X className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-3">
            {recentCustomReminders.length > 0 && (
              <div className="text-xs text-gray-500 mb-2">Default Reminders</div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempSelectedReminder(undefined);
                  onSelect(undefined);
                  setOpen(false);
                }}
                className={cn(
                  "justify-center items-center text-center border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200",
                  !tempSelectedReminder
                    ? "bg-white text-black"
                    : "bg-[#252525] text-gray-300 hover:bg-white hover:text-black"
                )}
              >
                None
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReminderSelect('at-time')}
                disabled={!selectedDate || !selectedTime}
                className={cn(
                  "justify-center items-center text-center border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  tempSelectedReminder === 'at-time'
                    ? "bg-white text-black"
                    : "bg-[#252525] text-gray-300 hover:bg-white hover:text-black"
                )}
              >
                <Bell className={cn("h-4 w-4 mr-1 transition-all", tempSelectedReminder === 'at-time' ? "text-black drop-shadow-lg" : "text-gray-400")} />
                At time
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReminderSelect('10m')}
                disabled={!selectedDate || !selectedTime}
                className={cn(
                  "justify-center items-center text-center border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  tempSelectedReminder === '10m'
                    ? "bg-white text-black"
                    : "bg-[#252525] text-gray-300 hover:bg-white hover:text-black"
                )}
              >
                <Bell className={cn("h-4 w-4 mr-1 transition-all", tempSelectedReminder === '10m' ? "text-black drop-shadow-lg" : "text-gray-400")} />
                10 min
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReminderSelect('30m')}
                disabled={!selectedDate || !selectedTime}
                className={cn(
                  "justify-center items-center text-center border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  tempSelectedReminder === '30m'
                    ? "bg-white text-black"
                    : "bg-[#252525] text-gray-300 hover:bg-white hover:text-black"
                )}
              >
                <Bell className={cn("h-4 w-4 mr-1 transition-all", tempSelectedReminder === '30m' ? "text-black drop-shadow-lg" : "text-gray-400")} />
                30 min
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReminderSelect('1h')}
                disabled={!selectedDate || !selectedTime}
                className={cn(
                  "justify-center items-center text-center border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  tempSelectedReminder === '1h'
                    ? "bg-white text-black"
                    : "bg-[#252525] text-gray-300 hover:bg-white hover:text-black"
                )}
              >
                <Bell className={cn("h-4 w-4 mr-1 transition-all", tempSelectedReminder === '1h' ? "text-black drop-shadow-lg" : "text-gray-400")} />
                1 hour
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ReminderSelector;
