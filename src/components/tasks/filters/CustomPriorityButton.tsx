import React from 'react';
import { cn } from "@/lib/utils";
import { Flag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CustomPriorityButtonProps {
  priority: { name: string; color: string };
  isSelected: boolean;
  onClick: () => void;
}

export const CustomPriorityButton: React.FC<CustomPriorityButtonProps> = ({ priority, isSelected, onClick }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={onClick}
            className={cn(
              "w-full h-9 px-2 text-xs rounded-[15px] border border-[#414141] flex items-center justify-center gap-1 cursor-pointer transition-all duration-200",
              isSelected
                ? 'bg-white text-black'
                : 'bg-[#252525] text-gray-300 hover:bg-white hover:text-black'
            )}
          >
            <Flag className={cn("h-4 w-4 transition-all flex-shrink-0", priority.color)} />
            <span className="truncate">{priority.name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{priority.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
