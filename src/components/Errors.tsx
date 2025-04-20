import React from "react";
import { ErrorMap } from "@/lib/types/messagemap";
import { TableCell, TableRow } from "./shadcn/Table";
import { CircleAlert } from "lucide-react";

interface ErrorsProps {
  index: number;
  errors: ErrorMap;
}

export function Errors({ index, errors }: ErrorsProps) {
  if (!errors.has(index)) {
    return null;
  }
  return (
    <TableRow className="group-hover:bg-muted/50 border-0 mt-20">
      <TableCell className="pt-0" colSpan={4}>
        <div className="flex flex-col gap-y-1">
          {errors.get(index).map((message) => (
            <div className="flex items-center gap-x-2 text-red-600 font-bold">
              <CircleAlert size={20} />
              {message}
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}
