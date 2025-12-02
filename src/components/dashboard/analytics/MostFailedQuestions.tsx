
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { FailedQuestionStat } from '@/lib/types';
import { HelpCircle } from 'lucide-react';
  
interface MostFailedQuestionsProps {
    data: FailedQuestionStat[];
}
  
export function MostFailedQuestions({ data }: MostFailedQuestionsProps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Most Failed Questions</CardTitle>
          <CardDescription>
            Top questions users are getting wrong.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ol className="space-y-4">
              {data.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground font-bold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium leading-snug">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.failCount} incorrect attempts</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                <HelpCircle className="h-10 w-10 mb-4" />
                <p>No data on failed questions yet.</p>
                <p className="text-xs">This will update as users complete quizzes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
}
