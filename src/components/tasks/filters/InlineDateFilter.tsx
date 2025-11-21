import React, { useState, useMemo } from 'react';
import { Calendar, X } from 'lucide-react';
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
  const [searchInput, setSearchInput] = useState('');

  const datePresets = [
    'Today',
    'Tomorrow',
    '1 day',
    '2 days',
    '3 days',
    '1 week',
    '2 weeks',
    '1 month',
  ];

  const filteredPresets = useMemo(() => {
    if (!searchInput.trim()) return datePresets;
    const search = searchInput.toLowerCase();
    return datePresets.filter(preset => 
      preset.toLowerCase().includes(search)
    );
  }, [searchInput]);

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
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search date presets..."
            className="w-full bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none"
          />

          <div className="flex-1 overflow-auto max-h-[250px]">
            <div className="grid grid-cols-2 gap-2">
              {filteredPresets.map((preset) => (
                <Button
                  key={preset}
                  onClick={() => togglePreset(preset)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'w-full justify-center text-center bg-[#1b1b1b] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200',
                    selectedDate === preset && 'bg-white text-black hover:bg-white/90'
                  )}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <Button
              onClick={clearAll}
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
