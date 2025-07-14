import type { QuizResult } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CheckCircle, BarChart, Trophy } from 'lucide-react';

interface OverallStatsProps {
  results: QuizResult[];
}

export function OverallStats({ results }: OverallStatsProps) {
  const totalQuizzes = results.length;

  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const totalQuestions = results.reduce((acc, r) => acc + r.totalQuestions, 0);
  const averageScore =
    totalQuizzes > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  const bestScore =
    results.length > 0
      ? Math.max(
          ...results.map(r => Math.round((r.score / r.totalQuestions) * 100))
        )
      : 0;

  const stats = [
    {
      title: 'Total Quizzes Taken',
      value: totalQuizzes,
      icon: CheckCircle,
    },
    {
      title: 'Average Score',
      value: `${averageScore}%`,
      icon: BarChart,
    },
    {
      title: 'Best Score',
      value: `${bestScore}%`,
      icon: Trophy,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map(stat => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
