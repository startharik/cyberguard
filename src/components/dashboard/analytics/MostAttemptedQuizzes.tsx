
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AttemptedQuizStat } from '@/lib/types';
import { HelpCircle } from 'lucide-react';

interface MostAttemptedQuizzesProps {
  data: AttemptedQuizStat[];
}

export function MostAttemptedQuizzes({ data }: MostAttemptedQuizzesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Most Attempted Quizzes</CardTitle>
        <CardDescription>
          The top 5 quizzes taken by users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="title"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar
                  dataKey="attempts"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                  label={{ position: 'right', fill: 'hsl(var(--foreground))' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                <HelpCircle className="h-10 w-10 mb-4" />
                <p>No quiz attempt data available yet.</p>
                <p className="text-xs">Take some quizzes to see this chart populate.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
