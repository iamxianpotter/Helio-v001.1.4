import React, { useState, useMemo } from 'react';
import { AlertCircle, X, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconToggle } from '@/components/ui/icon-toggle';
import { cn } from '@/lib/utils';

interface InlinePriorityFilterProps {
  isActive: boolean;
  selectedPriorities: string[];
  onToggle: (checked: boolean) => void;
  onSelect: (priorities: string[]) => void;
}

interface CustomPriorityData {
  name: string;
  color: string;
}

const InlinePriorityFilter: React.FC<InlinePriorityFilterProps> = ({
  isActive,
  selectedPriorities,
  onToggle,
  onSelect
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [customPriorities, setCustomPriorities] = useState<CustomPriorityData[]>(() => {
    const saved = localStorage.getItem('kario-custom-priorities');
    return saved ? JSON.parse(saved) : [];
  });

  const presetPriorities = [
    { name: 'Priority 1', color: 'text-red-500' },
    { name: 'Priority 2', color: 'text-orange-500' },
    { name: 'Priority 3', color: 'text-yellow-500' },
    { name: 'Priority 4', color: 'text-green-500' },
    { name: 'Priority 5', color: 'text-blue-500' },
    { name: 'Priority 6', color: 'text-purple-500' }
  ];

  const filteredCustom = useMemo(() => {
    return customPriorities.filter(p =>
      p.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [customPriorities, searchInput]);

  const filteredPreset = useMemo(() => {
    return presetPriorities.filter(p =>
      p.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput]);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    if (!checked) {
      setExpanded(false);
      setSearchInput('');
    }
  };

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      onSelect(selectedPriorities.filter(p => p !== priority));
    } else {
      onSelect([...selectedPriorities, priority]);
    }
  };

  const clearAll = () => {
    onSelect([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">Priority</span>
        <IconToggle
          icon={AlertCircle}
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
            placeholder="Search priority..."
            className="w-full bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none"
          />

          <div className="flex-1 overflow-auto space-y-2 max-h-[250px]">
            {customPriorities.length > 0 && filteredCustom.length > 0 && (
              <>
                <div className="text-xs text-gray-500 mb-2">Custom</div>
                {filteredCustom.map((priority) => (
                  <Button
                    key={priority.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePriority(priority.name)}
                    className={cn(
                      'w-full justify-start text-left bg-[#1b1b1b] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200',
                      selectedPriorities.includes(priority.name) && 'bg-[#2e2e2e] text-white'
                    )}
                  >
                    <Flag className={cn('w-3 h-3 mr-2 flex-shrink-0', priority.color)} />
                    <span className="flex-1">{priority.name}</span>
                    {selectedPriorities.includes(priority.name) && (
                      <span className="text-green-400">✓</span>
                    )}
                  </Button>
                ))}
              </>
            )}

            {filteredPreset.length > 0 && (
              <>
                {customPriorities.length > 0 && filteredCustom.length > 0 && (
                  <div className="border-t border-[#414141] my-2"></div>
                )}
                <div className="text-xs text-gray-500 mb-2">Default</div>
                {filteredPreset.map((priority) => (
                  <Button
                    key={priority.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePriority(priority.name)}
                    className={cn(
                      'w-full justify-start text-left bg-[#1b1b1b] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200',
                      selectedPriorities.includes(priority.name) && 'bg-[#2e2e2e] text-white'
                    )}
                  >
                    <Flag className={cn('w-3 h-3 mr-2 flex-shrink-0', priority.color)} />
                    <span className="flex-1">{priority.name}</span>
                    {selectedPriorities.includes(priority.name) && (
                      <span className="text-green-400">✓</span>
                    )}
                  </Button>
                ))}
              </>
            )}

            {filteredCustom.length === 0 && filteredPreset.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No priorities found
              </div>
            )}
          </div>

          {selectedPriorities.length > 0 && (
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

export default InlinePriorityFilter;
