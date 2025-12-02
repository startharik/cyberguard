
import type { QuizResult } from '@/lib/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ResultsTableProps {
  results: QuizResult[];
  isAdminView?: boolean;
}

export function ResultsTable({ results, isAdminView = false }: ResultsTableProps) {
  const getBadgeVariant = (
    percentage: number
  ): 'default' | 'secondary' | 'destructive' => {
    if (percentage === 100) return 'default';
    if (percentage >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {isAdminView && <TableHead>User</TableHead>}
          <TableHead>Quiz Title</TableHead>
          <TableHead className="text-center">Score</TableHead>
          <TableHead className="text-center">Percentage</TableHead>
          <TableHead className="text-right">Date Completed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.length === 0 ? (
          <TableRow>
            <TableCell colSpan={isAdminView ? 5 : 4} className="h-24 text-center">
              No results to display.
            </TableCell>
          </TableRow>
        ) : (
          results.map(result => {
            const percentage = Math.round(
              (result.score / result.totalQuestions) * 100
            );
            return (
              <TableRow key={result.id}>
                {isAdminView && <TableCell className="font-medium">{result.userName}</TableCell>}
                <TableCell className="font-medium">{result.quizTitle}</TableCell>
                <TableCell className="text-center">
                  {result.score} / {result.totalQuestions}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getBadgeVariant(percentage)}>
                    {percentage}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {format(new Date(result.completedAt), 'MMM d, yyyy, h:mm a')}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
