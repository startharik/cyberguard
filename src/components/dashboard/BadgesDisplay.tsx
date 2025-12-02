
'use client';

import type { Badge } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Fish, Shield, Flame, Feather, Target, KeyRound, Users, Wifi, Bug, BookCheck, Zap } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const iconMap: { [key: string]: React.ElementType } = {
    Fish: Fish,
    Flame: Flame,
    Feather: Feather,
    Target: Target,
    KeyRound: KeyRound,
    Users: Users,
    Wifi: Wifi,
    Bug: Bug,
    BookCheck: BookCheck,
    Zap: Zap,
    Default: Shield,
};

export function BadgesDisplay({ badges }: { badges: Badge[] }) {
    if (badges.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Award /> Your Badges
                    </CardTitle>
                    <CardDescription>
                        Complete quizzes and challenges to earn badges.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Your badge collection is empty for now.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    <Award /> Your Badges
                </CardTitle>
                <CardDescription>
                    Your collection of achievements. Keep up the great work!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="flex flex-wrap gap-4">
                        {badges.map(badge => {
                            const Icon = iconMap[badge.iconName] || iconMap.Default;
                            return (
                                <Tooltip key={badge.id}>
                                    <TooltipTrigger asChild>
                                        <div className="flex flex-col items-center gap-2 cursor-pointer w-20 text-center">
                                            <div className="w-16 h-16 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-600 border-2 border-yellow-500">
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <span className="text-xs font-medium leading-tight">{badge.name}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{badge.name}</p>
                                        <p>{badge.description}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Earned on: {new Date(badge.earnedAt!).toLocaleDateString()}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    );
}
