
'use server';

import { z } from 'zod';
import { getDb } from '@/lib/db';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(10, 'Message must be at least 10 characters long.'),
});

export async function submitContactMessage(prevState: any, formData: FormData) {
  const validatedFields = contactSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, message } = validatedFields.data;

  try {
    const db = await getDb();
    await db.run(
      'INSERT INTO contact_messages (id, name, email, message, submittedAt) VALUES (?, ?, ?, ?, ?)',
      crypto.randomUUID(),
      name,
      email,
      message,
      new Date().toISOString()
    );
    return { success: true, message: 'Thank you for your message! We will get back to you soon.' };
  } catch (error) {
    console.error('Failed to save contact message:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }
}
