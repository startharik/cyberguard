'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz, Question } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Check, X } from 'lucide-react';

type AnswerStatus = 'unanswered' | 'correct' | 'incorrect';

export function QuizClient({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [answerStatus, setAnswerStatus] = useState<Record<string, AnswerStatus>>({});
  const [score, setScore] = useState(0);

  const currentQuestion: Question = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleOptionSelect = (option: string) => {
    if (answerStatus[currentQuestion.id]) return; // Already answered
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleSubmitAnswer = () => {
    const selectedOption = selectedAnswers[currentQuestion.id];
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      setAnswerStatus(prev => ({...prev, [currentQuestion.id]: 'correct'}));
    } else {
      setAnswerStatus(prev => ({...prev, [currentQuestion.id]: 'incorrect'}));
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      router.push(`/quiz/results?score=${score}&total=${quiz.questions.length}`);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const status = answerStatus[currentQuestion.id];

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </CardDescription>
          <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium">{currentQuestion.text}</p>
          <RadioGroup
            value={selectedAnswers[currentQuestion.id] || ''}
            onValueChange={handleOptionSelect}
            disabled={!!status}
          >
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option;
              let optionClass = '';
              if (status && isSelected) {
                  optionClass = status === 'correct' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
              } else if (status && option === currentQuestion.correctAnswer) {
                  optionClass = 'bg-green-100 border-green-300';
              }
              return (
                <Label
                  key={index}
                  htmlFor={`option-${index}`}
                  className={`flex items-center space-x-3 rounded-md border p-4 transition-all ${optionClass} ${!!status ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <span>{option}</span>
                   {status && (
                    <span className="ml-auto">
                        {option === currentQuestion.correctAnswer && <Check className="h-5 w-5 text-green-600" />}
                        {isSelected && option !== currentQuestion.correctAnswer && <X className="h-5 w-5 text-red-600" />}
                    </span>
                   )}
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end">
          {status ? (
             <Button onClick={handleNextQuestion}>
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswers[currentQuestion.id]}>
              Submit Answer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
