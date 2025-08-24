import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type CreateUserInput, type UpdateUserInput } from '../schema';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from '../handlers/users';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testUserInput: CreateUserInput = {
  username: 'testuser',
  password: 'password123',
  role: 'user'
};

const testAdminInput: CreateUserInput = {
  username: 'admin',
  password: 'adminpass123',
  role: 'admin'
};

describe('User Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createUser', () => {
    it('should create a user with default role', async () => {
      const result = await createUser(testUserInput);

      expect(result.username).toEqual('testuser');
      expect(result.role).toEqual('user');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.password).toBeDefined();
      expect(result.password).not.toEqual('password123'); // Should be hashed
    });

    it('should create an admin user', async () => {
      const result = await createUser(testAdminInput);

      expect(result.username).toEqual('admin');
      expect(result.role).toEqual('admin');
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
    });

    it('should hash the password', async () => {
      const result = await createUser(testUserInput);

      expect(result.password).not.toEqual(testUserInput.password);
      expect(result.password.length).toBeGreaterThan(20); // Hashed password should be longer
    });

    it('should save user to database', async () => {
      const result = await createUser(testUserInput);

      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, result.id))
        .execute();

      expect(users).toHaveLength(1);
      expect(users[0].username).toEqual('testuser');
      expect(users[0].role).toEqual('user');
    });

    it('should throw error for duplicate username', async () => {
      await createUser(testUserInput);

      await expect(createUser(testUserInput)).rejects.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should return empty array when no users exist', async () => {
      const result = await getUsers();

      expect(result).toEqual([]);
    });

    it('should return all users', async () => {
      await createUser(testUserInput);
      await createUser(testAdminInput);

      const result = await getUsers();

      expect(result).toHaveLength(2);
      expect(result[0].username).toEqual('testuser');
      expect(result[1].username).toEqual('admin');
      expect(result[0].password).toBeDefined();
      expect(result[1].password).toBeDefined();
    });

    it('should return users with all fields', async () => {
      await createUser(testUserInput);

      const result = await getUsers();

      expect(result[0].id).toBeDefined();
      expect(result[0].username).toEqual('testuser');
      expect(result[0].password).toBeDefined();
      expect(result[0].role).toEqual('user');
      expect(result[0].created_at).toBeInstanceOf(Date);
    });
  });

  describe('getUserById', () => {
    it('should return null for non-existent user', async () => {
      const result = await getUserById(999);

      expect(result).toBeNull();
    });

    it('should return user by ID', async () => {
      const createdUser = await createUser(testUserInput);

      const result = await getUserById(createdUser.id);

      expect(result).not.toBeNull();
      expect(result!.id).toEqual(createdUser.id);
      expect(result!.username).toEqual('testuser');
      expect(result!.role).toEqual('user');
    });

    it('should return user with all fields', async () => {
      const createdUser = await createUser(testUserInput);

      const result = await getUserById(createdUser.id);

      expect(result!.id).toBeDefined();
      expect(result!.username).toEqual('testuser');
      expect(result!.password).toBeDefined();
      expect(result!.role).toEqual('user');
      expect(result!.created_at).toBeInstanceOf(Date);
    });
  });

  describe('updateUser', () => {
    it('should update username only', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        username: 'updateduser'
      };

      const result = await updateUser(updateInput);

      expect(result.id).toEqual(createdUser.id);
      expect(result.username).toEqual('updateduser');
      expect(result.role).toEqual('user'); // Should remain unchanged
      expect(result.password).toEqual(createdUser.password); // Should remain unchanged
    });

    it('should update password only', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        password: 'newpassword123'
      };

      const result = await updateUser(updateInput);

      expect(result.id).toEqual(createdUser.id);
      expect(result.username).toEqual('testuser'); // Should remain unchanged
      expect(result.password).not.toEqual(createdUser.password); // Should be different
      expect(result.password).not.toEqual('newpassword123'); // Should be hashed
    });

    it('should update role only', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        role: 'admin'
      };

      const result = await updateUser(updateInput);

      expect(result.id).toEqual(createdUser.id);
      expect(result.username).toEqual('testuser'); // Should remain unchanged
      expect(result.role).toEqual('admin');
    });

    it('should update all fields', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        username: 'fullyupdated',
        password: 'newpassword456',
        role: 'admin'
      };

      const result = await updateUser(updateInput);

      expect(result.id).toEqual(createdUser.id);
      expect(result.username).toEqual('fullyupdated');
      expect(result.role).toEqual('admin');
      expect(result.password).not.toEqual('newpassword456'); // Should be hashed
      expect(result.password).not.toEqual(createdUser.password); // Should be different
    });

    it('should throw error for non-existent user', async () => {
      const updateInput: UpdateUserInput = {
        id: 999,
        username: 'nonexistent'
      };

      await expect(updateUser(updateInput)).rejects.toThrow(/user not found/i);
    });

    it('should save changes to database', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        username: 'dbtest'
      };

      await updateUser(updateInput);

      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, createdUser.id))
        .execute();

      expect(users[0].username).toEqual('dbtest');
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      const createdUser = await createUser(testUserInput);

      await deleteUser(createdUser.id);

      const users = await db.select()
        .from(usersTable)
        .where(eq(usersTable.id, createdUser.id))
        .execute();

      expect(users).toHaveLength(0);
    });

    it('should throw error for non-existent user', async () => {
      await expect(deleteUser(999)).rejects.toThrow(/user not found/i);
    });

    it('should not affect other users', async () => {
      const user1 = await createUser(testUserInput);
      const user2 = await createUser(testAdminInput);

      await deleteUser(user1.id);

      const remainingUsers = await getUsers();
      expect(remainingUsers).toHaveLength(1);
      expect(remainingUsers[0].id).toEqual(user2.id);
      expect(remainingUsers[0].username).toEqual('admin');
    });
  });

  describe('Password verification', () => {
    it('should verify hashed password correctly', async () => {
      const createdUser = await createUser(testUserInput);

      // Verify the password was hashed correctly by using Bun's verify
      const isValid = await Bun.password.verify('password123', createdUser.password);
      expect(isValid).toBe(true);

      const isInvalid = await Bun.password.verify('wrongpassword', createdUser.password);
      expect(isInvalid).toBe(false);
    });

    it('should hash updated passwords correctly', async () => {
      const createdUser = await createUser(testUserInput);

      const updateInput: UpdateUserInput = {
        id: createdUser.id,
        password: 'updatedpassword123'
      };

      const updatedUser = await updateUser(updateInput);

      // Verify the new password
      const isValidNew = await Bun.password.verify('updatedpassword123', updatedUser.password);
      expect(isValidNew).toBe(true);

      // Verify old password no longer works
      const isValidOld = await Bun.password.verify('password123', updatedUser.password);
      expect(isValidOld).toBe(false);
    });
  });
});