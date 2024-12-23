import { Grade } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface GradeListProps {
  grades: Grade[];
}

export const GradeList = ({ grades }: GradeListProps) => {
  const sortedGrades = [...grades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Datum</TableHead>
            <TableHead className="w-[80px] text-right">Note</TableHead>
            <TableHead className="hidden sm:table-cell">Art</TableHead>
            <TableHead className="text-right">Gewichtung</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedGrades.map((grade) => (
            <TableRow key={grade.id}>
              <TableCell className="font-medium">
                {new Date(grade.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {grade.value}
                {grade.value <= 2 ? (
                  <ArrowUp className="inline ml-1 text-green-500" size={16} />
                ) : grade.value >= 5 ? (
                  <ArrowDown className="inline ml-1 text-red-500" size={16} />
                ) : null}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {grade.type === 'oral' ? 'Mündlich' : 'Schulaufgabe'}
              </TableCell>
              <TableCell className="text-right">{grade.weight}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};