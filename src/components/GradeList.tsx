import { Grade } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GradeListProps {
  grades: Grade[];
}

export const GradeList = ({ grades }: GradeListProps) => {
  const sortedGrades = [...grades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Datum</TableHead>
          <TableHead>Note</TableHead>
          <TableHead>Art</TableHead>
          <TableHead>Gewichtung</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedGrades.map((grade) => (
          <TableRow key={grade.id}>
            <TableCell>{new Date(grade.date).toLocaleDateString()}</TableCell>
            <TableCell>{grade.value}</TableCell>
            <TableCell>{grade.type === 'oral' ? 'Mündlich' : 'Schulaufgabe'}</TableCell>
            <TableCell>{grade.weight}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};