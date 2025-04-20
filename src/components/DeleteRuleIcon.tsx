import React from "react";
import { X } from "lucide-react";

interface DeleteRuleIconProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export function DeleteRuleIcon({ onClick }: DeleteRuleIconProps) {
  return (
    <div className="rounded-full bg-gray-300 transition-colors cursor-pointer hover:bg-red-600 p-0.5" onClick={onClick}>
      <X className="text-white" size={15} strokeWidth={3} />
    </div>
  );
}
