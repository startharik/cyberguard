'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { QuizResult } from '@/lib/types';
import { Card, CardTitle, CardDescription, CardHeader, CardContent } from '../ui/card';

export function ResultsChart({ results }: { results: QuizResult[] }) {
    
  const chartData = results.map(r => ({
    name: r.quizTitle,
    score: (r.score / r.totalQuestions) * 100,
  })).reverse(); // reverse to show oldest first

  return (
     <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
            <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
            />
            <Tooltip 
                cursor={{fill: 'hsl(var(--muted))'}}
                contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                }}
                labelStyle={{
                    color: 'hsl(var(--foreground))',
                    fontWeight: 'bold',
                }}
            />
            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
}
