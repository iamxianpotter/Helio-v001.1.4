import React, { useState, useEffect } from 'react';
import { type DateRange } from 'react-day-picker';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { format, isWithinInterval, addMonths } from 'date-fns';

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

  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split(',').map(d => {
        const parsed = new Date(d.trim());
        parsed.setHours(0, 0, 0, 0);
        return parsed;
      });

      if (parts.length === 1) {
        setDateRange({ from: parts[0], to: parts[0] });
      } else if (parts.length === 2) {
        const sorted = parts.sort((a, b) => a.getTime() - b.getTime());
        setDateRange({ from: sorted[0], to: sorted[1] });
      }
    } else {
      setDateRange(undefined);
    }
  }, [selectedDate]);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const oneMonthAhead = addMonths(today, 1);

  const isDateInRange = (date: Date): boolean => {
    return isWithinInterval(date, { start: today, end: oneMonthAhead });
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setDateRange(undefined);
      onSelect('');
      return;
    }

    const from = new Date(range.from);
    from.setHours(0, 0, 0, 0);

    if (!isDateInRange(from)) return;

    if (!range.to) {
      setDateRange({ from, to: from });
      onSelect(format(from, 'yyyy-MM-dd'));
    } else {
      const to = new Date(range.to);
      to.setHours(0, 0, 0, 0);

      if (!isDateInRange(to)) return;

      const sorted = from.getTime() <= to.getTime()
        ? { from, to }
        : { from: to, to: from };

      setDateRange(sorted);
      onSelect(`${format(sorted.from, 'yyyy-MM-dd')},${format(sorted.to, 'yyyy-MM-dd')}`);
    }
  };

  const clearDate = () => {
    setDateRange(undefined);
    onSelect('');
  };

  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
    : '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">Date</span>
        <IconToggle
          icon={Calendar}
          checked={isActive}
          onCheckedChange={handleToggle}
        />
      </div>

      {isActive && (
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-2">
          <div className="flex justify-center">
            <CalendarComponent
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateInRange(date)}
              className="rounded-[8px]"
            />
          </div>

          <div className="text-xs text-gray-400 text-center">
            {dateRangeText ? dateRangeText : 'Select a date range'}
          </div>

          {dateRange?.from && dateRange?.to && (
            <Button
              onClick={clearDate}
              variant="ghost"
              size="sm"
              className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-[#414141] rounded-[8px] text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineDateFilter;
