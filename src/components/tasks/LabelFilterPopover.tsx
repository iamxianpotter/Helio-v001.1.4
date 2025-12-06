import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tag, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LabelFilterPopoverProps {
  selectedLabels: string[];
  onSelect: (labels: string[]) => void;
}

interface LabelData {
  name: string;
  color: string;
}

const LabelFilterPopover: React.FC<LabelFilterPopoverProps> = ({ selectedLabels, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tempSelectedLabels, setTempSelectedLabels] = useState<string[]>(selectedLabels);
  const [availableLabels, setAvailableLabels] = useState<LabelData[]>(() => {
    const saved = localStorage.getItem('kario-labels');
    return saved ? JSON.parse(saved) : [];
  });

  const presetLabels: LabelData[] = [
    { name: '#ByKairo', color: 'text-blue-500' },
    { name: '#School', color: 'text-green-500' },
    { name: '#Work', color: 'text-orange-500' },
    { name: '#Personal', color: 'text-pink-500' },
    { name: '#Urgent', color: 'text-red-500' },
    { name: '#Shopping', color: 'text-cyan-500' },
    { name: '#Health', color: 'text-emerald-500' },
    { name: '#Finance', color: 'text-amber-500' },
    { name: '#Family', color: 'text-rose-500' },
    { name: '#Projects', color: 'text-teal-500' },
  ];

  const filteredCustom = useMemo(() => {
    return availableLabels.filter(l =>
      l.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [availableLabels, searchInput]);

  const filteredPreset = useMemo(() => {
    return presetLabels.filter(l =>
      l.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput]);

  const toggleLabel = (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label];
    setTempSelectedLabels(newLabels);
    setShowConfirmation(true);
  };

  const handleConfirmLabels = () => {
    onSelect(tempSelectedLabels);
    setShowConfirmation(false);
    setOpen(false);
  };

  const clearAll = () => {
    onSelect([]);
  };

  const getRandomSaveMessage = () => {
    const messages = [
      'save?',
      'looks good?',
      'confirm?',
      'this one?',
      'lock it in?',
      'keep this?',
      'done?',
      'all set?'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getLabelColor = (labelName: string): string => {
    const custom = availableLabels.find(l => l.name === labelName);
    if (custom) return custom.color;

    const preset = presetLabels.find(l => l.name === labelName);
    return preset?.color || 'text-gray-400';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-gray-400 hover:text-white hover:border hover:border-[#252232] hover:bg-[#1e1e1f] hover:rounded-[8px] px-3 py-1 h-8 whitespace-nowrap transition-all duration-200 border border-transparent",
            selectedLabels.length > 0 && "text-white border-[#252232] bg-[#1e1e1f] rounded-[8px]"
          )}
        >
          <Tag className="h-4 w-4 mr-2" />
          {selectedLabels.length > 0 ? `${selectedLabels.length} Label` : 'Label'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-[#1b1b1b] border border-[#414141] rounded-[12px] overflow-hidden flex flex-col"
        align="start"
        side="right"
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
              placeholder="Search label..."
              className="flex-1 bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none w-full"
            />
          </div>

          {/* Labels List */}
          <div className="flex-1 overflow-auto px-3 pb-3 max-h-[300px]">
            {/* Custom Labels */}
            {availableLabels.length > 0 && filteredCustom.length > 0 && (
              <>
                <div className="text-xs text-gray-500 mb-2">Custom Labels</div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredCustom.map((label) => (
                    <TooltipProvider key={label.name} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLabel(label.name)}
                            className={cn(
                              "w-full justify-center text-center border border-[#414141] rounded-[15px] h-9 text-xs flex items-center gap-1 transition-all duration-200",
                              selectedLabels.includes(label.name)
                                ? 'bg-white text-black'
                                : 'bg-[#252525] text-gray-300 hover:bg-white hover:text-black'
                            )}
                          >
                            <Tag className={cn("h-4 w-4 flex-shrink-0", label.color)} />
                            <span className="truncate">{label.name}</span>
                            {selectedLabels.includes(label.name) && (
                              <span className="text-green-500 ml-1">✓</span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{label.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </>
            )}

            {/* Preset Labels */}
            {filteredPreset.length > 0 && (
              <>
                {availableLabels.length > 0 && filteredCustom.length > 0 && (
                  <div className="border-t border-[#414141] my-2"></div>
                )}
                <div className="text-xs text-gray-500 mb-2">Preset Labels</div>
                <div className="space-y-2">
                  {filteredPreset.map((label) => (
                    <TooltipProvider key={label.name} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLabel(label.name)}
                            className={cn(
                              "w-full justify-start text-left bg-[#252525] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200",
                              selectedLabels.includes(label.name) && "bg-[#2e2e2e] text-white"
                            )}
                          >
                            <Tag className={cn("h-4 w-4 mr-2", label.color)} />
                            <span className="flex-1 truncate min-w-0">{label.name}</span>
                            {selectedLabels.includes(label.name) && (
                              <span className="ml-auto text-green-400">✓</span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{label.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </>
            )}

            {filteredCustom.length === 0 && filteredPreset.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No labels found
              </div>
            )}
          </div>

          {/* Confirmation */}
          {showConfirmation && (
            <div className="p-3 text-center border-t border-[#414141]">
              <button
                onClick={handleConfirmLabels}
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200 cursor-pointer underline decoration-dotted underline-offset-4 italic"
                style={{
                  fontFamily: 'monospace',
                  imageRendering: 'pixelated',
                  textRendering: 'optimizeSpeed'
                }}
              >
                {getRandomSaveMessage()}
              </button>
            </div>
          )}

          {/* Clear Button */}
          {selectedLabels.length > 0 && !showConfirmation && (
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

export default LabelFilterPopover;