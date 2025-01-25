import { Grade } from '@/types';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, MoreHorizontal, Pencil, Trash2, MessageSquare, ArrowUpDown } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps {
  grades: Grade[];
  onEdit: (gradeId: string) => void;
  onDelete: (gradeId: string) => void;
  isDemo?: boolean;
  onDemoAction: () => void;
}

export const DataTable = ({ 
  grades, 
  onEdit, 
  onDelete, 
  isDemo = false,
  onDemoAction 
}: DataTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Grade; direction: 'ascending' | 'descending' }>({
    key: 'date',
    direction: 'descending',
  });

  const sortedGrades = [...grades].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: keyof Grade) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">
            <Button variant="ghost" onClick={() => handleSort('date')}>
              Datum
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="w-[80px] text-right">
            <Button variant="ghost" onClick={() => handleSort('value')}>
              Note
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>
            <Button variant="ghost" onClick={() => handleSort('type')}>
              Art
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-right">
            <Button variant="ghost" onClick={() => handleSort('weight')}>
              Gewichtung
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead>Notizen</TableHead>
          <TableHead className="w-[50px]">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedGrades.map((grade) => (
          <TableRow key={grade.id}>
            <TableCell className="font-medium">
              {new Date(grade.date).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right whitespace-nowrap">
              {grade.value}
              {grade.value <= 2 ? (
                <ArrowUp className="inline ml-1 text-green-500" size={16} />
              ) : grade.value >= 5 ? (
                <ArrowDown className="inline ml-1 text-red-500" size={16} />
              ) : null}
            </TableCell>
            <TableCell>
              {grade.type === 'oral' ? 'Mündlich' : 'Schulaufgabe'}
            </TableCell>
            <TableCell className="text-right">{grade.weight}</TableCell>
            <TableCell>
              {grade.notes && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm truncate max-w-[200px]">{grade.notes}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{grade.notes}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      if (isDemo) {
                        onDemoAction();
                        return;
                      }
                      onEdit(grade.id);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      if (isDemo) {
                        onDemoAction();
                        return;
                      }
                      onDelete(grade.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                    Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
