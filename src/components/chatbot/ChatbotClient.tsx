
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askCybersecurityQuestion } from '@/ai/flows/cyberguardian-chatbot';
import type { User } from '@/lib/types';
import { Bot, Send, User as UserIcon, MessageSquareQuestion } from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const suggestedQuestions = [
    'What is phishing?',
    'How do I create a strong password?',
    'What is malware?',
    'Explain two-factor authentication.',
];

async function chatAction(prevState: { messages: Message[] }, formData: FormData): Promise<{ messages: Message[] }> {
    const question = formData.get('question') as string;
    if (!question) return prevState;

    const newMessages: Message[] = [...prevState.messages, { sender: 'user', text: question }];
    
    try {
        const result = await askCybersecurityQuestion({ question });
        return { messages: [...newMessages, { sender: 'ai', text: result.answer }]};
    } catch (error) {
        console.error(error);
        return { messages: [...newMessages, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]};
    }
}

function ChatSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div> : <Send className="h-4 w-4" />}
      <span className="sr-only">Send</span>
    </Button>
  );
}

function SuggestedQuestions({ onQuestionSelect }: { onQuestionSelect: (question: string) => void }) {
    return (
        <div className="text-center text-muted-foreground pt-8">
             <Bot className="mx-auto h-12 w-12 mb-4" />
             <p className="mb-6 font-medium">Ask me anything about cybersecurity! Or try one of these:</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                 {suggestedQuestions.map((q, i) => (
                     <Button 
                        key={i} 
                        variant="outline" 
                        className="h-auto justify-start text-left whitespace-normal"
                        onClick={() => onQuestionSelect(q)}
                     >
                        <MessageSquareQuestion className="mr-2 h-4 w-4 shrink-0" />
                        {q}
                     </Button>
                 ))}
             </div>
        </div>
    );
}

export function ChatbotClient({ user }: { user: User }) {
  const [state, formAction] = useActionState(chatAction, { messages: [] });
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [state.messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  const handleSuggestedQuestion = (question: string) => {
    if (inputRef.current) {
        inputRef.current.value = question;
        formRef.current?.requestSubmit();
    }
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <Bot />
            AI Cybersecurity Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {state.messages.length === 0 && (
                <SuggestedQuestions onQuestionSelect={handleSuggestedQuestion} />
            )}
            {state.messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'ai' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                  </Avatar>
                )}
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                 {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form
          ref={formRef}
          action={async (formData) => {
            await formAction(formData);
            formRef.current?.reset();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input 
            ref={inputRef}
            id="question" 
            name="question" 
            placeholder="Type your question..." 
            className="flex-1" 
            autoComplete="off" 
          />
          <ChatSubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
