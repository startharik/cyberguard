
'use server';

import { getDb } from '@/lib/db';
import type { ChatMessage } from '@/lib/types';

export async function getChatHistory(userId: string): Promise<ChatMessage[]> {
    try {
        const db = await getDb();
        const messages = await db.all<ChatMessage[]>(
            'SELECT sender, text, createdAt FROM chat_messages WHERE userId = ? ORDER BY createdAt ASC',
            userId
        );
        return messages;
    } catch (error) {
        console.error('Could not retrieve chat history:', error);
        return [];
    }
}

export async function saveChatMessage(message: ChatMessage): Promise<void> {
    try {
        const db = await getDb();
        await db.run(
            'INSERT INTO chat_messages (id, userId, sender, text, createdAt) VALUES (?, ?, ?, ?, ?)',
            crypto.randomUUID(),
            message.userId,
            message.sender,
            message.text,
            message.createdAt
        );
    } catch (error) {
        console.error('Could not save chat message:', error);
        // We don't throw here to avoid interrupting the chat flow on the client
    }
}
