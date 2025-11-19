import React, { useState } from 'react';
import { type DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { format } from 'date-fns';

interface InlineDateFilterProps {
  isActive: boolean;
  selectedDate: string;
  onToggle: (checked: boolean) => void;
  onSelect: (date: string) => void;
}

const InlineDateFilter: React.FC<InlineDateFilterProps> = ({
  isActive,
  selectedDate,
  onToggle,
  onSelect
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    if (!checked) {
      setDateRange(undefined);
      onSelect('');
    }
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      const dateString = `${format(range.from, 'yyyy-MM-dd')}_${format(range.to, 'yyyy-MM-dd')}`;
      onSelect(dateString);
    } else if (range?.from) {
      onSelect(format(range.from, 'yyyy-MM-dd'));
    } else {
      onSelect('');
    }
  };

  const clearSelection = () => {
    setDateRange(undefined);
    onSelect('');
  };

  const displayText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
    : dateRange?.from
    ? format(dateRange.from, 'MMM dd')
    : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">Date</span>
        <IconToggle
          icon={CalendarIcon}
          checked={isActive}
          onCheckedChange={handleToggle}
        />
      </div>

      {isActive && (
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-3">
          {displayText && (
            <div className="flex items-center justify-between text-sm text-gray-300 pb-2 border-b border-[#414141]">
              <span>{displayText}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            className="rounded-lg pointer-events-auto"
          />
        </div>
      )}
    </div>
  );
};

export default InlineDateFilter;
