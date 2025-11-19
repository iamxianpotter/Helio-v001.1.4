import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar, X } from 'lucide-react';
import { format, addMonths, isAfter, startOfDay } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { IconToggle } from "@/components/ui/icon-toggle";

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
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  
  const parseSelectedDate = (): DateRange | undefined => {
    if (!selectedDate) return undefined;
    const dates = selectedDate.split(',');
    if (dates.length === 2) {
      return { from: new Date(dates[0]), to: new Date(dates[1]) };
    }
    const single = new Date(dates[0]);
    return { from: single, to: single };
  };

  const [dateRange, setDateRange] = useState<DateRange | undefined>(parseSelectedDate());

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      if (range.to && range.from.getTime() !== range.to.getTime()) {
        const dateString = `${format(range.from, "yyyy-MM-dd")},${format(range.to, "yyyy-MM-dd")}`;
        onSelect(dateString);
      } else {
        onSelect(format(range.from, "yyyy-MM-dd"));
      }
    }
  };

  const clearDate = () => {
    setDateRange(undefined);
    onSelect('');
  };

  const formatDisplayDate = () => {
    if (!selectedDate) return "Select Date";
    const dates = selectedDate.split(',');
    if (dates.length === 2) {
      return `${format(new Date(dates[0]), "MMM dd")} - ${format(new Date(dates[1]), "MMM dd")}`;
    }
    return format(new Date(dates[0]), "MMM dd, yyyy");
  };

  const tomorrow = addMonths(startOfDay(new Date()), 0);
  const oneMonthFromNow = addMonths(tomorrow, 1);

  const isSingleDay = dateRange?.from && dateRange?.to && 
    dateRange.from.getTime() === dateRange.to.getTime();

  return (
    <div className="flex items-start gap-3">
      <IconToggle
        checked={isActive}
        onCheckedChange={onToggle}
        icon={Calendar}
        className="mt-1"
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                disabled={!isActive}
                className={cn(
                  "text-gray-400 hover:text-white hover:border hover:border-border hover:bg-muted px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent",
                  selectedDate && isActive && "text-white border-border bg-muted"
                )}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {formatDisplayDate()}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-background border border-border rounded-xl overflow-hidden"
              align="start"
              side="bottom"
              sideOffset={8}
              data-nested={true}
            >
              <div className="p-4">
                <DayPicker
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  disabled={(date) => isAfter(date, oneMonthFromNow) || isAfter(startOfDay(new Date()), date)}
                  className="pointer-events-auto"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4",
                    caption: "flex justify-center pt-1 relative items-center mb-4",
                    caption_label: "text-sm font-medium text-foreground",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 text-foreground/70 hover:text-foreground",
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse",
                    head_row: "flex mb-2",
                    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-xs",
                    row: "flex w-full",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                      "h-9 w-9"
                    ),
                    day: cn(
                      "h-9 w-9 p-0 font-normal text-foreground hover:bg-accent hover:text-accent-foreground",
                      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm transition-colors",
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      "disabled:pointer-events-none disabled:opacity-50"
                    ),
                    day_selected: cn(
                      "!bg-white !text-black font-medium",
                      "hover:!bg-white hover:!text-black focus:!bg-white focus:!text-black"
                    ),
                    day_today: "bg-accent text-accent-foreground font-semibold",
                    day_outside: "text-muted-foreground opacity-50",
                    day_disabled: "text-muted-foreground opacity-50",
                    day_range_middle: cn(
                      "!bg-white !text-black !rounded-none",
                      "hover:!bg-white hover:!text-black"
                    ),
                    day_range_start: isSingleDay 
                      ? "!rounded-full !bg-white !text-black"
                      : "!rounded-l-full !rounded-r-none !bg-white !text-black",
                    day_range_end: isSingleDay
                      ? "!rounded-full !bg-white !text-black"
                      : "!rounded-r-full !rounded-l-none !bg-white !text-black",
                    day_hidden: "invisible",
                  }}
                />
              </div>

              {selectedDate && (
                <div className="p-3 border-t border-border">
                  <Button
                    onClick={clearDate}
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border rounded-lg text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear Selection
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-xs text-gray-500">
          Filter tasks by due date
        </p>
      </div>
    </div>
  );
};

export default InlineDateFilter;
