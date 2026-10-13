import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';
import { projectRoot } from './config.js';

const scrypt = promisify(scryptCallback);
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const PASSWORD_BYTES = 64;

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function constantTimeEqual(first, second) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

export function createAccountDatabase(
  filename = process.env.APP_DATABASE_PATH || resolve(projectRoot, 'data', 'accounts.sqlite')
) {
  if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });
  const database = new DatabaseSync(filename);
  database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      display_name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      csrf_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user_id ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS assessments (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      profile_json TEXT NOT NULL,
      results_json TEXT NOT NULL,
      completed_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS assessment_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question_ids_json TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS attempts_user_id ON assessment_attempts(user_id);
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS conversations_user_id_updated
      ON conversations(user_id, updated_at DESC);
    CREATE TABLE IF NOT EXISTS messages (
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      citations_json TEXT NOT NULL,
      PRIMARY KEY(conversation_id, position)
    );
  `);
  return database;
}

export function createAccountStore(database, { now = Date.now } = {}) {
  const publicUser = (user) => ({
    id: user.id,
    email: user.email,
    displayName: user.display_name
  });

  async function createAccountSession(user) {
    const token = randomBytes(32).toString('base64url');
    const csrfToken = randomBytes(32).toString('base64url');
    const expiresAt = now() + SESSION_LIFETIME_MS;
    database.prepare(`
      INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(hashToken(token), user.id, csrfToken, expiresAt);
    return { token, csrfToken, expiresAt };
  }

  return {
    async register({ email, displayName, password }) {
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      const normalizedName = typeof displayName === 'string' ? displayName.trim() : '';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
        throw new Error('Enter a valid email address.');
      }
      const hasControlCharacters = [...normalizedName].some((character) => {
        const codePoint = character.codePointAt(0);
        return codePoint < 32 || codePoint === 127;
      });
      if (!normalizedName || normalizedName.length > 50 || hasControlCharacters) {
        throw new Error('Choose a name between 1 and 50 characters.');
      }
      if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
        throw new Error('Your password must be between 10 and 128 characters.');
      }

      const salt = randomBytes(16);
      const derivedKey = await scrypt(password, salt, PASSWORD_BYTES);
      const user = {
        id: randomBytes(16).toString('hex'),
        email: normalizedEmail,
        display_name: normalizedName,
        password_hash: `${salt.toString('hex')}:${derivedKey.toString('hex')}`
      };
      try {
        database.prepare(`
          INSERT INTO users (id, email, display_name, password_hash, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(user.id, user.email, user.display_name, user.password_hash, now());
      } catch (error) {
        if (error.code === 'ERR_SQLITE_ERROR' && /UNIQUE constraint failed: users.email/i.test(error.message)) {
          throw new Error('An account with that email already exists. Try signing in.');
        }
        throw error;
      }
      return { user: publicUser(user), session: await createAccountSession(user) };
    },

    async login({ email, password }) {
      const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
      const user = database.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
      const [saltHex, expectedHex] = user?.password_hash.split(':') || ['', ''];
      const salt = user ? Buffer.from(saltHex, 'hex') : Buffer.alloc(16);
      const expected = user ? Buffer.from(expectedHex, 'hex') : Buffer.alloc(PASSWORD_BYTES);
      const actual = await scrypt(typeof password === 'string' ? password : '', salt, PASSWORD_BYTES);
      if (!user || !constantTimeEqual(actual, expected)) {
        throw new Error('Email or password is incorrect.');
      }
      return { user: publicUser(user), session: await createAccountSession(user) };
    },

    authenticate(token) {
      if (!token) return null;
      const session = database.prepare(`
        SELECT sessions.csrf_token, sessions.expires_at, users.id, users.email, users.display_name
        FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ?
      `).get(hashToken(token));
      if (!session) return null;
      if (session.expires_at <= now()) {
        database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now());
        return null;
      }
      return {
        user: publicUser(session),
        csrfToken: session.csrf_token,
        expiresAt: session.expires_at
      };
    },

    validateCsrf(expected, actual) {
      return typeof expected === 'string'
        && typeof actual === 'string'
        && constantTimeEqual(expected, actual);
    },

    logout(token) {
      if (token) database.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
    },

    getAssessment(userId) {
      const row = database.prepare(`
        SELECT profile_json, results_json, completed_at
        FROM assessments WHERE user_id = ?
      `).get(userId);
      return row
        ? {
            profile: JSON.parse(row.profile_json),
            results: JSON.parse(row.results_json),
            completedAt: row.completed_at
          }
        : null;
    },

    saveAssessment(userId, profile, results) {
      const completedAt = now();
      database.prepare(`
        INSERT INTO assessments (user_id, profile_json, results_json, completed_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          profile_json = excluded.profile_json,
          results_json = excluded.results_json,
          completed_at = excluded.completed_at
      `).run(userId, JSON.stringify(profile), JSON.stringify(results), completedAt);
      return { profile, results, completedAt };
    },

    createAttempt(userId, attemptId, questionIds) {
      database.prepare('DELETE FROM assessment_attempts WHERE created_at <= ?').run(now() - 2 * 60 * 60 * 1000);
      database.prepare(`
        INSERT INTO assessment_attempts (id, user_id, question_ids_json, created_at)
        VALUES (?, ?, ?, ?)
      `).run(attemptId, userId, JSON.stringify(questionIds), now());
    },

    getAttempt(userId, attemptId) {
      const attempt = database.prepare(`
        SELECT id, question_ids_json, created_at
        FROM assessment_attempts WHERE id = ? AND user_id = ?
      `).get(attemptId, userId);
      return attempt && now() - attempt.created_at <= 2 * 60 * 60 * 1000
        ? { ...attempt, questionIds: JSON.parse(attempt.question_ids_json) }
        : null;
    },

    deleteAttempt(userId, attemptId) {
      database.prepare('DELETE FROM assessment_attempts WHERE id = ? AND user_id = ?').run(attemptId, userId);
    },

    listConversations(userId) {
      const chats = database.prepare(`
        SELECT id, title, updated_at FROM conversations
        WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50
      `).all(userId);
      const getMessages = database.prepare(`
        SELECT role, content, citations_json FROM messages
        WHERE conversation_id = ? ORDER BY position
      `);
      return chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        updatedAt: chat.updated_at,
        messages: getMessages.all(chat.id).map((message) => ({
          role: message.role,
          content: message.content,
          citations: JSON.parse(message.citations_json)
        }))
      }));
    },

    getConversation(userId, conversationId) {
      const conversation = database.prepare('SELECT id, title FROM conversations WHERE id = ? AND user_id = ?')
        .get(conversationId, userId);
      if (!conversation) return null;
      const messages = database.prepare(`
        SELECT role, content, citations_json FROM messages
        WHERE conversation_id = ? ORDER BY position
      `).all(conversationId).map((message) => ({
        role: message.role,
        content: message.content,
        citations: JSON.parse(message.citations_json)
      }));
      return { ...conversation, messages };
    },

    saveConversation(userId, conversationId, title, messages) {
      const updatedAt = now();
      database.exec('BEGIN');
      try {
        database.prepare(`
          INSERT INTO conversations (id, user_id, title, updated_at) VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET title = excluded.title, updated_at = excluded.updated_at
        `).run(conversationId, userId, title, updatedAt);
        database.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conversationId);
        const insertMessage = database.prepare(`
          INSERT INTO messages (conversation_id, position, role, content, citations_json)
          VALUES (?, ?, ?, ?, ?)
        `);
        messages.slice(-100).forEach((message, index) => {
          insertMessage.run(conversationId, index, message.role, message.content, JSON.stringify(message.citations || []));
        });
        database.exec('COMMIT');
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
      database.prepare(`
        DELETE FROM conversations
        WHERE user_id = ? AND id NOT IN (
          SELECT id FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50
        )
      `).run(userId, userId);
    },

    deleteConversation(userId, conversationId) {
      return database.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?')
        .run(conversationId, userId).changes > 0;
    }
  };
}
