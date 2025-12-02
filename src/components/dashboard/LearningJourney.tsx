
import type { QuizResult } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Book, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningJourneyProps {
  results: QuizResult[];
}

const levels = {
  Beginner: {
    icon: GraduationCap,
    nextLevel: 'Intermediate',
    threshold: 60,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    description: 'You are just getting started! Keep taking quizzes to build your foundational knowledge.',
  },
  Intermediate: {
    icon: Book,
    nextLevel: 'Advanced',
    threshold: 90,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    description: 'You have a solid understanding of the basics. Keep challenging yourself to reach the next level.',
  },
  Advanced: {
    icon: BrainCircuit,
    nextLevel: null,
    threshold: 100,
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    description: 'You have a strong grasp of cybersecurity concepts. Keep up the great work!',
  },
};

export function LearningJourney({ results }: LearningJourneyProps) {
  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const totalQuestions = results.reduce((acc, r) => acc + r.totalQuestions, 0);
  const averageScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  let currentLevel: keyof typeof levels;
  if (averageScore < levels.Beginner.threshold) {
    currentLevel = 'Beginner';
  } else if (averageScore < levels.Intermediate.threshold) {
    currentLevel = 'Intermediate';
  } else {
    currentLevel = 'Advanced';
  }

  const levelInfo = levels[currentLevel];
  const Icon = levelInfo.icon;
  const progressToNextLevel = levelInfo.nextLevel
    ? Math.min(Math.round((averageScore / levelInfo.threshold) * 100), 100)
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Your Learning Journey</CardTitle>
        <CardDescription>
            This reflects your current skill level based on your average quiz performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Icon className={cn('h-12 w-12', levelInfo.color)} />
          <div>
            <h3 className="text-xl font-bold font-headline">{currentLevel}</h3>
            <p className="text-sm text-muted-foreground">{levelInfo.description}</p>
          </div>
        </div>
        {levelInfo.nextLevel ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground">Progress to {levelInfo.nextLevel}</span>
              <span className={levelInfo.color}>{progressToNextLevel}%</span>
            </div>
            <Progress value={progressToNextLevel} className={cn('h-2', levelInfo.bgColor)} />
          </div>
        ) : (
            <div className="text-center text-sm font-semibold text-green-600 bg-green-500/10 p-3 rounded-md">
                You have reached the highest level. Congratulations!
            </div>
        )}
      </CardContent>
    </Card>
  );
}
