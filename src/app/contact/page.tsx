
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function ContactPage() {
  return (
    <PublicLayout>
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                         <Mail className="mx-auto h-12 w-12 text-primary mb-4" />
                        <CardTitle className="text-3xl font-headline">Contact Us</CardTitle>
                        <CardDescription>Have a question or feedback? We'd love to hear from you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" placeholder="Your Name" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Your Email Address" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Your message..." rows={6} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        {/* In a real app, this would be a form with an action */}
                        <Button className="w-full" onClick={() => alert('Thank you for your message! (This is a demo)')}>Send Message</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    </PublicLayout>
  );
}
