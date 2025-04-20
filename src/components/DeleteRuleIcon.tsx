import React from "react";
import { X } from "lucide-react";

interface DeleteIconProps {
  onClick: React.MouseEventHandler<HTMLDivElement>;
}

export function DeleteIcon({ onClick }: DeleteIconProps) {
  return (
    <div
      className="rounded-full bg-gray-300 transition-colors cursor-pointer hover:bg-red-600 flex items-center justify-center h-5 w-5"
      onClick={onClick}
    >
      <X className="text-white" size={15} strokeWidth={3} />
    </div>
  );
}
