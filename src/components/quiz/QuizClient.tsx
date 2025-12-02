
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

  // We only want to shuffle the questions once per quiz attempt.
  const questions = useMemo(() => {
    // Review quizzes can be long, so let's cap them at 10 for a practice session
    if (quiz.id.startsWith('review-') && quiz.questions.length > 10) {
        return shuffle(quiz.questions).slice(0, 10);
    }
    return shuffle(quiz.questions);
  }, [quiz.id, quiz.questions]);

  // Quiz state
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('Easy');
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  
  // Answer state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>('unanswered');
  
  // Performance tracking
  const [score, setScore] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);
  const [incorrectlyAnsweredIds, setIncorrectlyAnsweredIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Select the next question based on difficulty
  useEffect(() => {
    if (answeredQuestions.length === questions.length) return;

    let nextQuestionIndex = -1;
    const answeredIds = new Set(answeredQuestions.map(q => q.id));

    // Try to find a question of the current difficulty
    nextQuestionIndex = questions.findIndex(q => !answeredIds.has(q.id) && q.difficulty === currentDifficulty);
    
    // If not found, try to find one of a different difficulty
    if (nextQuestionIndex === -1) {
        for (const difficulty of difficultyOrder) {
            nextQuestionIndex = questions.findIndex(q => !answeredIds.has(q.id) && q.difficulty === difficulty);
            if (nextQuestionIndex !== -1) break;
        }
    }

    // Fallback to any available question
    if (nextQuestionIndex === -1) {
        nextQuestionIndex = questions.findIndex(q => !answeredIds.has(q.id));
    }

    setCurrentQuestionIndex(nextQuestionIndex);
    setAnswerStatus('unanswered');
    setSelectedAnswer(null);
  }, [answeredQuestions, currentDifficulty, questions]);


  const handleOptionSelect = (option: string) => {
    if (answerStatus !== 'unanswered') return;
    setSelectedAnswer(option);
  };
  
  const currentQuestion = currentQuestionIndex !== -1 ? questions[currentQuestionIndex] : null;

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
      // For review quizzes, we don't need to track incorrect answers again.
      if (!quiz.id.startsWith('review-')) {
        setIncorrectlyAnsweredIds(prev => [...new Set([...prev, currentQuestion.id])]);
      }
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

    const newAnsweredQuestions = [...answeredQuestions, currentQuestion];
    setAnsweredQuestions(newAnsweredQuestions);

    if (newAnsweredQuestions.length === questions.length) {
        setIsSubmitting(true);
        // Recalculate score at the end to be safe, especially for review quizzes.
        const finalScore = newAnsweredQuestions.filter(q => !incorrectlyAnsweredIds.includes(q.id)).length;
        
        await saveQuizResult(quiz.id, score, questions.length, incorrectlyAnsweredIds);

        const incorrectIdsParam = JSON.stringify(incorrectlyAnsweredIds);
        const queryParams = new URLSearchParams({
            quizId: quiz.id,
            quizTitle: quiz.title,
            score: score.toString(),
            total: questions.length.toString(),
            incorrectQuestionIds: incorrectIdsParam,
        });

        router.push(`/quiz/results?${queryParams.toString()}`);
    }
  };

  if (!currentQuestion) {
      // This can happen briefly or if there are no questions
      return <div>Loading quiz...</div>;
  }
  
  const isLastQuestion = answeredQuestions.length === questions.length - 1;

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
          <CardDescription>
            Question {answeredQuestions.length + 1} of {questions.length}
          </CardDescription>
          <Progress value={((answeredQuestions.length) / questions.length) * 100} className="mt-2" />
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
