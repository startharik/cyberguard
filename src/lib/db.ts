
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import type { Quiz, User, Badge } from './types';

// Singleton instance of the database
let db: Database | null = null;

const quizzesJsonPath = path.join(process.cwd(), 'data/quizzes.json');
const usersJsonPath = path.join(process.cwd(), 'data/users.json');
const badgesJsonPath = path.join(process.cwd(), 'data/badges.json');


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
            title TEXT NOT NULL,
            prerequisiteQuizId TEXT,
            prerequisiteScore INTEGER,
            FOREIGN KEY (prerequisiteQuizId) REFERENCES quizzes(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            quizId TEXT NOT NULL,
            text TEXT NOT NULL,
            options TEXT NOT NULL,
            correctAnswer TEXT NOT NULL,
            difficulty TEXT NOT NULL DEFAULT 'Easy',
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS quiz_results (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            quizId TEXT NOT NULL,
            score INTEGER NOT NULL,
            totalQuestions INTEGER NOT NULL,
            completedAt DATETIME NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS quiz_feedback (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            quizId TEXT NOT NULL,
            feedback TEXT NOT NULL,
            submittedAt DATETIME NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS badges (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            iconName TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS user_badges (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            badgeId TEXT NOT NULL,
            earnedAt DATETIME NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (badgeId) REFERENCES badges(id) ON DELETE CASCADE,
            UNIQUE(userId, badgeId)
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
            await db.run(
              'INSERT INTO quizzes (id, title, prerequisiteQuizId, prerequisiteScore) VALUES (?, ?, ?, ?)',
              quiz.id,
              quiz.title,
              quiz.prerequisiteQuizId,
              quiz.prerequisiteScore
            );
            for (const question of quiz.questions) {
                await db.run(
                    'INSERT INTO questions (id, quizId, text, options, correctAnswer, difficulty) VALUES (?, ?, ?, ?, ?, ?)',
                    question.id,
                    quiz.id,
                    question.text,
                    JSON.stringify(question.options),
                    question.correctAnswer,
                    question.difficulty || 'Easy' // Default to Easy if not provided
                );
            }
        }
        console.log('Quizzes seeded.');
    } catch (error) {
        console.error('Could not read or seed quizzes.json:', error);
    }

     // Seed badges
     try {
        const badgesData = await fs.readFile(badgesJsonPath, 'utf-8');
        const badges: Badge[] = JSON.parse(badgesData);
        for (const badge of badges) {
            await db.run(
                'INSERT INTO badges (id, name, description, iconName) VALUES (?, ?, ?, ?)',
                badge.id,
                badge.name,
                badge.description,
                badge.iconName
            );
        }
        console.log('Badges seeded.');
    } catch (error) {
        console.error('Could not read or seed badges.json:', error);
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
  
  await newDb.run('PRAGMA foreign_keys = ON');

  await initializeDb(newDb);

  db = newDb;
  return db;
}
