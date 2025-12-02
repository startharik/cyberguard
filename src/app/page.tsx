
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Bot, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const features = [
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with dynamic quizzes on topics like phishing, password security, and more.',
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Chatbot',
    description: 'Get instant, easy-to-understand answers to your cybersecurity questions from our friendly AI assistant.',
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-primary" />,
    title: 'Track Your Progress',
    description: 'Monitor your quiz scores and performance over time on your personal dashboard to see how you improve.',
  },
];

export default function HomePage() {
  return (
    <PublicLayout>
        {/* Hero Section */}
        <section className="text-center py-20 md:py-32">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight mb-4">
                    Master Cybersecurity with Confidence
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                    CyberGuardian is an AI-powered platform that makes learning about digital security simple, interactive, and engaging.
                </p>
                <div className="flex justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="/register">Get Started for Free</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/about">Learn More</Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/40">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Choose CyberGuardian?</h2>
                    <p className="text-lg text-muted-foreground mt-2">Everything you need to level up your security skills.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index}>
                            <CardHeader className="items-center text-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-4">
                                    {feature.icon}
                                </div>
                                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    </PublicLayout>
  );
}
