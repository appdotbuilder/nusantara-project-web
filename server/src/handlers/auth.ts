import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput, type AuthResponse } from '../schema';
import { eq } from 'drizzle-orm';

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  try {
    // Find user by username
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.username, input.username))
      .execute();

    if (users.length === 0) {
      throw new Error('Invalid username or password');
    }

    const user = users[0];

    // Check password (in a real app, you would hash/compare passwords)
    if (user.password !== input.password) {
      throw new Error('Invalid username or password');
    }

    // Return user info without password
    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      }
    };
  } catch (error) {
    console.error('User login failed:', error);
    throw error;
  }
}

export async function validateSession(token?: string): Promise<AuthResponse | null> {
  try {
    // For this implementation, we'll treat the token as a simple user ID
    // In a real application, you would verify JWT tokens
    if (!token) {
      return null;
    }

    const userId = parseInt(token);
    if (isNaN(userId)) {
      return null;
    }

    // Find user by ID
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .execute();

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    // Return user info without password
    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      }
    };
  } catch (error) {
    console.error('Session validation failed:', error);
    return null;
  }
}