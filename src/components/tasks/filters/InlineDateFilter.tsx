import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconToggle } from '@/components/ui/icon-toggle';
import { cn } from '@/lib/utils';

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
  const datePresets = [
    'All',
    'Today',
    'This week',
    'Next 7 days',
    'This month',
    'Next 30 days',
  ];

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  const togglePreset = (preset: string) => {
    if (selectedDate === preset) {
      onSelect('');
    } else {
      onSelect(preset);
    }
  };

  const clearAll = () => {
    onSelect('');
  };

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
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-3">
          <div className="flex-1 overflow-auto max-h-[250px]">
            <div className="grid grid-cols-2 gap-2">
              {datePresets.map((preset) => (
                <Button
                  key={preset}
                  onClick={() => togglePreset(preset)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-center text-center bg-[#1b1b1b] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs font-normal transition-all duration-200',
                    selectedDate === preset && 'bg-white text-black hover:bg-white hover:text-black'
                  )}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={clearAll}
            variant="ghost"
            size="sm"
            className="w-full text-gray-400 hover:text-white hover:bg-[#2e2e2e] border border-[#414141] rounded-[8px] text-xs font-normal"
          >
            No date
          </Button>
        </div>
      )}
    </div>
  );
};

export default InlineDateFilter;
