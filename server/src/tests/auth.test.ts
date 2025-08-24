import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { loginUser, validateSession } from '../handlers/auth';

const testUser = {
  username: 'testuser',
  password: 'password123',
  role: 'user' as const
};

const testAdmin = {
  username: 'admin',
  password: 'admin123',
  role: 'admin' as const
};

describe('auth handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('loginUser', () => {
    beforeEach(async () => {
      // Create test users
      await db.insert(usersTable)
        .values([testUser, testAdmin])
        .execute();
    });

    it('should successfully authenticate valid user credentials', async () => {
      const loginInput: LoginInput = {
        username: 'testuser',
        password: 'password123'
      };

      const result = await loginUser(loginInput);

      expect(result.user.username).toEqual('testuser');
      expect(result.user.role).toEqual('user');
      expect(result.user.id).toBeDefined();
      expect(result.user.created_at).toBeInstanceOf(Date);
      expect(result.token).toBeUndefined(); // No JWT implementation yet
    });

    it('should successfully authenticate admin user', async () => {
      const loginInput: LoginInput = {
        username: 'admin',
        password: 'admin123'
      };

      const result = await loginUser(loginInput);

      expect(result.user.username).toEqual('admin');
      expect(result.user.role).toEqual('admin');
      expect(result.user.id).toBeDefined();
      expect(result.user.created_at).toBeInstanceOf(Date);
    });

    it('should throw error for invalid username', async () => {
      const loginInput: LoginInput = {
        username: 'nonexistent',
        password: 'password123'
      };

      await expect(loginUser(loginInput)).rejects.toThrow(/invalid username or password/i);
    });

    it('should throw error for invalid password', async () => {
      const loginInput: LoginInput = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      await expect(loginUser(loginInput)).rejects.toThrow(/invalid username or password/i);
    });

    it('should throw error for empty username', async () => {
      const loginInput: LoginInput = {
        username: '',
        password: 'password123'
      };

      await expect(loginUser(loginInput)).rejects.toThrow(/invalid username or password/i);
    });

    it('should not expose password in response', async () => {
      const loginInput: LoginInput = {
        username: 'testuser',
        password: 'password123'
      };

      const result = await loginUser(loginInput);

      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe('validateSession', () => {
    let userId: number;

    beforeEach(async () => {
      // Create test user and get the ID
      const users = await db.insert(usersTable)
        .values(testUser)
        .returning()
        .execute();
      
      userId = users[0].id;
    });

    it('should return user info for valid session token', async () => {
      const result = await validateSession(userId.toString());

      expect(result).not.toBeNull();
      expect(result!.user.username).toEqual('testuser');
      expect(result!.user.role).toEqual('user');
      expect(result!.user.id).toEqual(userId);
      expect(result!.user.created_at).toBeInstanceOf(Date);
    });

    it('should return null for undefined token', async () => {
      const result = await validateSession(undefined);

      expect(result).toBeNull();
    });

    it('should return null for empty token', async () => {
      const result = await validateSession('');

      expect(result).toBeNull();
    });

    it('should return null for invalid token format', async () => {
      const result = await validateSession('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for non-existent user ID', async () => {
      const result = await validateSession('99999');

      expect(result).toBeNull();
    });

    it('should return null for zero user ID', async () => {
      const result = await validateSession('0');

      expect(result).toBeNull();
    });

    it('should return null for negative user ID', async () => {
      const result = await validateSession('-1');

      expect(result).toBeNull();
    });

    it('should not expose password in response', async () => {
      const result = await validateSession(userId.toString());

      expect(result).not.toBeNull();
      expect((result!.user as any).password).toBeUndefined();
    });

    it('should handle admin users correctly', async () => {
      // Create admin user
      const adminUsers = await db.insert(usersTable)
        .values(testAdmin)
        .returning()
        .execute();
      
      const adminId = adminUsers[0].id;

      const result = await validateSession(adminId.toString());

      expect(result).not.toBeNull();
      expect(result!.user.username).toEqual('admin');
      expect(result!.user.role).toEqual('admin');
      expect(result!.user.id).toEqual(adminId);
    });
  });
});