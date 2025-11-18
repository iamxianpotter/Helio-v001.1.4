import React, { useState, useMemo } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IconToggle } from '@/components/ui/icon-toggle';
import { cn } from '@/lib/utils';

interface InlineLabelFilterProps {
  isActive: boolean;
  selectedLabels: string[];
  onToggle: (checked: boolean) => void;
  onSelect: (labels: string[]) => void;
}

interface LabelData {
  name: string;
  color: string;
}

const InlineLabelFilter: React.FC<InlineLabelFilterProps> = ({
  isActive,
  selectedLabels,
  onToggle,
  onSelect
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchInput, setSearchInput] = useState('');
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

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    if (!checked) {
      setExpanded(false);
      setSearchInput('');
    }
  };

  const toggleLabel = (label: string) => {
    if (selectedLabels.includes(label)) {
      onSelect(selectedLabels.filter(l => l !== label));
    } else {
      onSelect([...selectedLabels, label]);
    }
  };

  const clearAll = () => {
    onSelect([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">Label</span>
        <IconToggle
          icon={Tag}
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
            placeholder="Search label..."
            className="w-full bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none"
          />

          <div className="flex-1 overflow-auto space-y-2 max-h-[250px]">
            {availableLabels.length > 0 && filteredCustom.length > 0 && (
              <>
                <div className="text-xs text-gray-500 mb-2">Custom Labels</div>
                {filteredCustom.map((label) => (
                  <Button
                    key={label.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLabel(label.name)}
                    className={cn(
                      'w-full justify-start text-left bg-[#1b1b1b] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200',
                      selectedLabels.includes(label.name) && 'bg-[#2e2e2e] text-white'
                    )}
                  >
                    <Tag className={cn('h-4 w-4 mr-2', label.color)} />
                    {label.name}
                    {selectedLabels.includes(label.name) && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                  </Button>
                ))}
              </>
            )}

            {filteredPreset.length > 0 && (
              <>
                {availableLabels.length > 0 && filteredCustom.length > 0 && (
                  <div className="border-t border-[#414141] my-2"></div>
                )}
                <div className="text-xs text-gray-500 mb-2">Preset Labels</div>
                {filteredPreset.map((label) => (
                  <Button
                    key={label.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLabel(label.name)}
                    className={cn(
                      'w-full justify-start text-left bg-[#1b1b1b] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[15px] h-9 text-xs transition-all duration-200',
                      selectedLabels.includes(label.name) && 'bg-[#2e2e2e] text-white'
                    )}
                  >
                    <Tag className={cn('h-4 w-4 mr-2', label.color)} />
                    {label.name}
                    {selectedLabels.includes(label.name) && (
                      <span className="ml-auto text-green-400">✓</span>
                    )}
                  </Button>
                ))}
              </>
            )}

            {filteredCustom.length === 0 && filteredPreset.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                No labels found
              </div>
            )}
          </div>

          {selectedLabels.length > 0 && (
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

export default InlineLabelFilter;
