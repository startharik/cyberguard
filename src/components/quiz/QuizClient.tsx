'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Quiz, Question, User, Difficulty } from '@/lib/types';
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
import { saveQuizResult } from '@/lib/actions/quiz.actions';

type AnswerStatus = 'unanswered' | 'correct' | 'incorrect';

// Fisher-Yates shuffle algorithm
function shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array];

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
    }

    return newArray;
}

const difficultyOrder: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export function QuizClient({ quiz, user }: { quiz: Quiz, user: User }) {
  const router = useRouter();

  // Quiz state
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Easy');
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Answer state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('unanswered');
  
  // Performance tracking
  const [score, setScore] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);
  const [incorrectlyAnsweredIds, setIncorrectlyAnsweredIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableQuestions = useMemo(() => {
    const answeredIds = new Set(answeredQuestions.map(q => q.id));
    return shuffle(quiz.questions.filter(q => !answeredIds.has(q.id)));
  }, [quiz.questions, answeredQuestions]);

  // Select the next question based on difficulty
  useEffect(() => {
    if (answeredQuestions.length === quiz.questions.length) return;

    let nextQuestion: Question | undefined;
    
    // Try to find a question of the current difficulty
    nextQuestion = availableQuestions.find(q => q.difficulty === currentDifficulty);
    
    // If not found, try to find one of a different difficulty
    if (!nextQuestion) {
        for (const difficulty of difficultyOrder) {
            nextQuestion = availableQuestions.find(q => q.difficulty === difficulty);
            if (nextQuestion) break;
        }
    }

    setCurrentQuestion(nextQuestion || null);
    setAnswerStatus('unanswered');
    setSelectedAnswer(null);
  }, [availableQuestions, currentDifficulty, answeredQuestions.length, quiz.questions.length]);


  const handleOptionSelect = (option: string) => {
    if (answerStatus !== 'unanswered') return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setAnswerStatus('correct');
      setConsecutiveCorrect(prev => prev + 1);
      setConsecutiveIncorrect(0);
    } else {
      setAnswerStatus('incorrect');
      setIncorrectlyAnsweredIds(prev => [...prev, currentQuestion.id]);
      setConsecutiveIncorrect(prev => prev + 1);
      setConsecutiveCorrect(0);
    }
  };

  const handleNextQuestion = async () => {
     if (!currentQuestion) return;

    // Update difficulty based on performance
    const currentIndex = difficultyOrder.indexOf(currentDifficulty);
    if (consecutiveCorrect >= 2 && currentIndex < difficultyOrder.length - 1) {
        setCurrentDifficulty(difficultyOrder[currentIndex + 1]);
        setConsecutiveCorrect(0);
    } else if (consecutiveIncorrect >= 2 && currentIndex > 0) {
        setCurrentDifficulty(difficultyOrder[currentIndex - 1]);
        setConsecutiveIncorrect(0);
    }

    setAnsweredQuestions(prev => [...prev, currentQuestion]);

    if (answeredQuestions.length + 1 === quiz.questions.length) {
        setIsSubmitting(true);
        await saveQuizResult(quiz.id, score, quiz.questions.length, incorrectlyAnsweredIds);
        const incorrectIdsParam = JSON.stringify(incorrectlyAnsweredIds);
        router.push(`/quiz/results?quizId=${quiz.id}&score=${score}&total=${quiz.questions.length}&incorrectQuestionIds=${encodeURIComponent(incorrectIdsParam)}`);
    }
  };

  if (!currentQuestion) {
      // This can happen briefly or if there are no questions
      return <div>Loading quiz...</div>;
  }
  
  const isLastQuestion = answeredQuestions.length === quiz.questions.length - 1;

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
          <CardDescription>
            Question {answeredQuestions.length + 1} of {quiz.questions.length}
          </CardDescription>
          <Progress value={((answeredQuestions.length + 1) / quiz.questions.length) * 100} className="mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg font-medium">{currentQuestion.text}</p>
          <RadioGroup
            value={selectedAnswer || ''}
            onValueChange={handleOptionSelect}
            disabled={answerStatus !== 'unanswered'}
          >
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              let optionClass = '';
              if (answerStatus !== 'unanswered' && isSelected) {
                  optionClass = answerStatus === 'correct' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
              } else if (answerStatus !== 'unanswered' && option === currentQuestion.correctAnswer) {
                  optionClass = 'bg-green-100 border-green-300';
              }
              return (
                <Label
                  key={index}
                  htmlFor={`option-${index}`}
                  className={`flex items-center space-x-3 rounded-md border p-4 transition-all ${optionClass} ${answerStatus !== 'unanswered' ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50'}`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <span>{option}</span>
                   {answerStatus !== 'unanswered' && (
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
          {answerStatus !== 'unanswered' ? (
             <Button onClick={handleNextQuestion} disabled={isSubmitting}>
              {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background mr-2"></div>}
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          ) : (
            <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer}>
              Submit Answer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
