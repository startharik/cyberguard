
import { Users, FileText, BarChart3, MessageSquare } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface AdminStatsProps {
    stats: {
        users: number;
        quizzes: number;
        results: number;
        feedback: number;
    };
}

export function AdminStats({ stats }: AdminStatsProps) {
    const statItems = [
        {
            title: 'Total Users',
            value: stats.users,
            icon: Users,
        },
        {
            title: 'Total Quizzes',
            value: stats.quizzes,
            icon: FileText,
        },
        {
            title: 'Total Quizzes Taken',
            value: stats.results,
            icon: BarChart3,
        },
        {
            title: 'Total Feedback',
            value: stats.feedback,
            icon: MessageSquare,
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statItems.map(stat => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
