import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, Flag } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PriorityFilterPopoverProps {
  selectedPriorities: string[];
  onSelect: (priorities: string[]) => void;
}

interface CustomPriorityData {
  name: string;
  color: string;
}

const PriorityFilterPopover: React.FC<PriorityFilterPopoverProps> = ({ selectedPriorities, onSelect }) => {
  const [open, setOpen] = useState(false);
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent",
            selectedPriorities.length > 0 && "text-white border-[#252232] bg-[#1e1e1f] rounded-[8px]"
          )}
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          {selectedPriorities.length > 0 ? `${selectedPriorities.length} Priority` : 'Priority'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-[#1b1b1b] border border-[#414141] rounded-[12px] overflow-hidden flex flex-col"
        align="start"
        side="bottom"
        sideOffset={8}
        data-nested={true}
      >
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search priority..."
              className="flex-1 bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none w-full"
            />
          </div>

          {/* Priority List */}
          <div className="flex-1 overflow-auto px-3 pb-3 max-h-[300px]">
            {/* Custom Priorities */}
            {customPriorities.length > 0 && filteredCustom.length > 0 && (
              <>
                <div className="text-xs text-gray-500 mb-2">Custom</div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredCustom.map((priority) => (
                    <TooltipProvider key={priority.name} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePriority(priority.name)}
                            className={cn(
                              "w-full justify-center text-center border border-[#414141] rounded-[15px] h-9 text-xs flex items-center gap-1 transition-all duration-200",
                              selectedPriorities.includes(priority.name)
                                ? 'bg-white text-black'
                                : 'bg-[#252525] text-gray-300 hover:bg-white hover:text-black'
                            )}
                          >
                            <Flag className={cn("h-4 w-4 transition-all flex-shrink-0", priority.color)} />
                            <span className="truncate min-w-0">{priority.name}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{priority.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </>
            )}

            {/* Preset Priorities */}
            {filteredPreset.length > 0 && (
              <>
                {customPriorities.length > 0 && filteredCustom.length > 0 && (
                  <div className="border-t border-[#414141] my-2"></div>
                )}
                <div className="text-xs text-gray-500 mb-2">Default</div>
                <div className="space-y-2">
                  {filteredPreset.map((priority) => (
                    <TooltipProvider key={priority.name} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePriority(priority.name)}
                            className={cn(
                              "w-full justify-start text-left bg-[#252525] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200",
                              selectedPriorities.includes(priority.name) && "bg-[#2e2e2e] text-white"
                            )}
                          >
                            <Flag className={cn("w-3 h-3 mr-2 flex-shrink-0", priority.color)} />
                            <span className="truncate">{priority.name}</span>
                            {selectedPriorities.includes(priority.name) && (
                              <span className="ml-auto text-green-400">✓</span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{priority.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </>
            )}

            {filteredCustom.length === 0 && filteredPreset.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No priorities found
              </div>
            )}
          </div>

          {/* Clear Button */}
          {selectedPriorities.length > 0 && (
            <div className="p-3 border-t border-[#414141]">
              <Button
                onClick={clearAll}
                variant="ghost"
                size="sm"
                className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-[#414141] rounded-[8px] text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PriorityFilterPopover;