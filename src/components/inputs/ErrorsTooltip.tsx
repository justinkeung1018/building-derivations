import { CircleAlert } from "lucide-react";
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../shadcn/Tooltip";

interface ErrorsTooltipProps {
  errors: string[];
}

export function ErrorsTooltip({ errors }: ErrorsTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CircleAlert size={15} className="text-red-600" />
        </TooltipTrigger>
        <TooltipContent side="right" className="border border-red-400 bg-popover text-red-600">
          {errors.map((error) => (
            <div>{error}</div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
