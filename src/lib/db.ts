import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import type { Quiz, User } from './types';

// Singleton instance of the database
let db: Database | null = null;

const quizzesJsonPath = path.join(process.cwd(), 'data/quizzes.json');
const usersJsonPath = path.join(process.cwd(), 'data/users.json');

async function initializeDb(db: Database) {
    console.log('Initializing database schema...');
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            isAdmin BOOLEAN NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            quizId TEXT NOT NULL,
            text TEXT NOT NULL,
            options TEXT NOT NULL,
            correctAnswer TEXT NOT NULL,
            FOREIGN KEY (quizId) REFERENCES quizzes(id)
        );
    `);
    console.log('Schema initialized.');

    // Check if data is already seeded
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
        console.log('Database already seeded.');
        return;
    }

    console.log('Seeding database from JSON files...');

    // Seed users
    try {
        const usersData = await fs.readFile(usersJsonPath, 'utf-8');
        const users: User[] = JSON.parse(usersData);
        for (const user of users) {
            await db.run(
                'INSERT INTO users (id, name, email, password, isAdmin) VALUES (?, ?, ?, ?, ?)',
                user.id,
                user.name,
                user.email,
                user.password,
                user.isAdmin ? 1 : 0
            );
        }
        console.log('Users seeded.');
    } catch (error) {
        console.error('Could not read or seed users.json:', error);
    }
    
    // Seed quizzes
    try {
        const quizzesData = await fs.readFile(quizzesJsonPath, 'utf-8');
        const quizzes: Quiz[] = JSON.parse(quizzesData);
        for (const quiz of quizzes) {
            await db.run('INSERT INTO quizzes (id, title) VALUES (?, ?)', quiz.id, quiz.title);
            for (const question of quiz.questions) {
                await db.run(
                    'INSERT INTO questions (id, quizId, text, options, correctAnswer) VALUES (?, ?, ?, ?, ?)',
                    question.id,
                    quiz.id,
                    question.text,
                    JSON.stringify(question.options),
                    question.correctAnswer
                );
            }
        }
        console.log('Quizzes seeded.');
    } catch (error) {
        console.error('Could not read or seed quizzes.json:', error);
    }

}

export async function getDb() {
  if (db) {
    return db;
  }
  
  const dbPath = path.join(process.cwd(), 'data/cyberguardian.db');

  const newDb = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await initializeDb(newDb);

  db = newDb;
  return db;
}
