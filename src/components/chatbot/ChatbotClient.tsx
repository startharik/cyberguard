
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { askCybersecurityQuestion } from '@/ai/flows/cyberguardian-chatbot';
import type { User, ChatMessage } from '@/lib/types';
import { Bot, Send, MessageSquareQuote, Settings } from 'lucide-react';
import { saveChatMessage } from '@/lib/actions/chat.actions';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Personality = 'Friendly' | 'Formal' | 'Technical';

const suggestedQuestions = [
    'What is phishing?',
    'How do I create a strong password?',
    'What is malware?',
    'Explain two-factor authentication.',
];

async function chatAction(
    prevState: { messages: ChatMessage[], userId: string, personality: Personality }, 
    formData: FormData
): Promise<{ messages: ChatMessage[], userId: string, personality: Personality }> {
    const question = formData.get('question') as string;
    const personality = formData.get('personality') as Personality;

    if (!question) return { ...prevState, personality };

    const userMessage: ChatMessage = {
        userId: prevState.userId,
        sender: 'user',
        text: question,
        createdAt: new Date().toISOString()
    };

    const newMessages: ChatMessage[] = [...prevState.messages, userMessage];
    
    // Save user message optimisticallly
    saveChatMessage(userMessage);

    try {
        const result = await askCybersecurityQuestion({ question, personality });
        const aiMessage: ChatMessage = {
            userId: prevState.userId,
            sender: 'ai',
            text: result.answer,
            createdAt: new Date().toISOString()
        };
        // Save AI message
        saveChatMessage(aiMessage);
        return { ...prevState, messages: [...newMessages, aiMessage], personality };
    } catch (error) {
        console.error(error);
        const errorMessage: ChatMessage = {
            userId: prevState.userId,
            sender: 'ai',
            text: 'Sorry, I encountered an error. Please try again.',
            createdAt: new Date().toISOString()
        };
        return { ...prevState, messages: [...newMessages, errorMessage], personality };
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
                        <MessageSquareQuote className="mr-2 h-4 w-4 shrink-0" />
                        {q}
                     </Button>
                 ))}
             </div>
        </div>
    );
}

export function ChatbotClient({ user, initialMessages }: { user: User, initialMessages: ChatMessage[] }) {
  const [personality, setPersonality] = useState<Personality>('Friendly');
  const [state, formAction] = useActionState(chatAction, { messages: initialMessages, userId: user.id, personality });

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
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline flex items-center gap-2">
                <Bot />
                AI Cybersecurity Assistant
            </CardTitle>
            <CardDescription>Current personality: {personality}</CardDescription>
        </div>
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
                 <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Personality</h4>
                        <p className="text-sm text-muted-foreground">
                            Set the tone of the AI assistant.
                        </p>
                    </div>
                    <RadioGroup value={personality} onValueChange={(v: Personality) => setPersonality(v)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Friendly" id="p-friendly" />
                            <Label htmlFor="p-friendly">Friendly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Formal" id="p-formal" />
                            <Label htmlFor="p-formal">Formal</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Technical" id="p-technical" />
                            <Label htmlFor="p-technical">Technical</Label>
                        </div>
                    </RadioGroup>
                </div>
            </PopoverContent>
        </Popover>
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
            formData.append('personality', personality);
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
