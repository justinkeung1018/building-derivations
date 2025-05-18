import { CircleAlert } from "lucide-react";
import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/Tooltip";

interface ErrorsTooltipProps {
  errors: string[];
  "data-cy": string;
}

export function ErrorsTooltip({ errors, "data-cy": dataCy }: ErrorsTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CircleAlert size={15} className="text-red-600" data-cy={dataCy} />
      </TooltipTrigger>
      <TooltipContent side="right" className="border border-red-400 bg-popover text-red-600">
        {errors.map((error) => (
          <div>{error}</div>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}
