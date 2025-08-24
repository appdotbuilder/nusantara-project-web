import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { runningTextTable } from '../db/schema';
import { type CreateRunningTextInput, type UpdateRunningTextInput } from '../schema';
import { 
  getActiveRunningText, 
  getAllRunningTexts, 
  createRunningText, 
  updateRunningText, 
  deleteRunningText 
} from '../handlers/running_text';
import { eq } from 'drizzle-orm';

describe('Running Text Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createRunningText', () => {
    it('should create a running text entry', async () => {
      const input: CreateRunningTextInput = {
        content: 'Welcome to our website!',
        is_active: true
      };

      const result = await createRunningText(input);

      expect(result.content).toBe('Welcome to our website!');
      expect(result.is_active).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should create running text with is_active true', async () => {
      const input: CreateRunningTextInput = {
        content: 'Active text',
        is_active: true
      };

      const result = await createRunningText(input);

      expect(result.content).toBe('Active text');
      expect(result.is_active).toBe(true);
    });

    it('should deactivate other running texts when creating active one', async () => {
      // Create first active running text
      const firstInput: CreateRunningTextInput = {
        content: 'First active text',
        is_active: true
      };
      const firstResult = await createRunningText(firstInput);

      // Create second active running text
      const secondInput: CreateRunningTextInput = {
        content: 'Second active text',
        is_active: true
      };
      const secondResult = await createRunningText(secondInput);

      // Check database state
      const allTexts = await db.select()
        .from(runningTextTable)
        .execute();

      const firstFromDb = allTexts.find(t => t.id === firstResult.id);
      const secondFromDb = allTexts.find(t => t.id === secondResult.id);

      expect(firstFromDb?.is_active).toBe(false);
      expect(secondFromDb?.is_active).toBe(true);
    });

    it('should allow multiple inactive running texts', async () => {
      const firstInput: CreateRunningTextInput = {
        content: 'First inactive text',
        is_active: false
      };
      
      const secondInput: CreateRunningTextInput = {
        content: 'Second inactive text',
        is_active: false
      };

      const firstResult = await createRunningText(firstInput);
      const secondResult = await createRunningText(secondInput);

      expect(firstResult.is_active).toBe(false);
      expect(secondResult.is_active).toBe(false);

      // Verify both exist in database
      const allTexts = await db.select()
        .from(runningTextTable)
        .execute();

      expect(allTexts).toHaveLength(2);
      expect(allTexts.every(t => !t.is_active)).toBe(true);
    });
  });

  describe('getActiveRunningText', () => {
    it('should return null when no active running text exists', async () => {
      const result = await getActiveRunningText();
      expect(result).toBeNull();
    });

    it('should return the active running text', async () => {
      // Create inactive text
      await createRunningText({
        content: 'Inactive text',
        is_active: false
      });

      // Create active text
      const activeText = await createRunningText({
        content: 'Active text',
        is_active: true
      });

      const result = await getActiveRunningText();

      expect(result).not.toBeNull();
      expect(result?.id).toBe(activeText.id);
      expect(result?.content).toBe('Active text');
      expect(result?.is_active).toBe(true);
    });

    it('should return only one active text even if multiple exist', async () => {
      // This shouldn't happen in normal operation, but test edge case
      await db.insert(runningTextTable)
        .values([
          {
            content: 'First active',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            content: 'Second active',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          }
        ])
        .execute();

      const result = await getActiveRunningText();

      expect(result).not.toBeNull();
      expect(result?.is_active).toBe(true);
    });
  });

  describe('getAllRunningTexts', () => {
    it('should return empty array when no running texts exist', async () => {
      const result = await getAllRunningTexts();
      expect(result).toEqual([]);
    });

    it('should return all running texts ordered by created_at desc', async () => {
      // Create texts with slight delay to ensure different timestamps
      const firstText = await createRunningText({
        content: 'First text',
        is_active: false
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const secondText = await createRunningText({
        content: 'Second text',
        is_active: true
      });

      const result = await getAllRunningTexts();

      expect(result).toHaveLength(2);
      // Should be ordered by created_at descending (newest first)
      expect(result[0].id).toBe(secondText.id);
      expect(result[1].id).toBe(firstText.id);
      expect(result[0].content).toBe('Second text');
      expect(result[1].content).toBe('First text');
    });

    it('should return both active and inactive texts', async () => {
      await createRunningText({
        content: 'Active text',
        is_active: true
      });

      await createRunningText({
        content: 'Inactive text',
        is_active: false
      });

      const result = await getAllRunningTexts();

      expect(result).toHaveLength(2);
      const activeText = result.find(t => t.is_active);
      const inactiveText = result.find(t => !t.is_active);

      expect(activeText).toBeDefined();
      expect(inactiveText).toBeDefined();
      expect(activeText?.content).toBe('Active text');
      expect(inactiveText?.content).toBe('Inactive text');
    });
  });

  describe('updateRunningText', () => {
    it('should update running text content', async () => {
      const created = await createRunningText({
        content: 'Original content',
        is_active: false
      });

      const input: UpdateRunningTextInput = {
        id: created.id,
        content: 'Updated content'
      };

      const result = await updateRunningText(input);

      expect(result.id).toBe(created.id);
      expect(result.content).toBe('Updated content');
      expect(result.is_active).toBe(false); // Should remain unchanged
      expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
    });

    it('should update running text active status', async () => {
      const created = await createRunningText({
        content: 'Test content',
        is_active: false
      });

      const input: UpdateRunningTextInput = {
        id: created.id,
        is_active: true
      };

      const result = await updateRunningText(input);

      expect(result.id).toBe(created.id);
      expect(result.content).toBe('Test content'); // Should remain unchanged
      expect(result.is_active).toBe(true);
    });

    it('should deactivate other texts when setting one to active', async () => {
      const firstText = await createRunningText({
        content: 'First text',
        is_active: true
      });

      const secondText = await createRunningText({
        content: 'Second text',
        is_active: false
      });

      // Update second text to be active
      const input: UpdateRunningTextInput = {
        id: secondText.id,
        is_active: true
      };

      await updateRunningText(input);

      // Check database state
      const allTexts = await db.select()
        .from(runningTextTable)
        .execute();

      const firstFromDb = allTexts.find(t => t.id === firstText.id);
      const secondFromDb = allTexts.find(t => t.id === secondText.id);

      expect(firstFromDb?.is_active).toBe(false);
      expect(secondFromDb?.is_active).toBe(true);
    });

    it('should update both content and active status', async () => {
      const created = await createRunningText({
        content: 'Original content',
        is_active: false
      });

      const input: UpdateRunningTextInput = {
        id: created.id,
        content: 'New content',
        is_active: true
      };

      const result = await updateRunningText(input);

      expect(result.content).toBe('New content');
      expect(result.is_active).toBe(true);
    });

    it('should throw error when updating non-existent running text', async () => {
      const input: UpdateRunningTextInput = {
        id: 999999,
        content: 'This should fail'
      };

      expect(updateRunningText(input)).rejects.toThrow(/not found/i);
    });

    it('should allow setting text to inactive without affecting others', async () => {
      const activeText = await createRunningText({
        content: 'Active text',
        is_active: true
      });

      const anotherText = await createRunningText({
        content: 'Another text',
        is_active: false
      });

      // Set the active text to inactive
      const input: UpdateRunningTextInput = {
        id: activeText.id,
        is_active: false
      };

      await updateRunningText(input);

      // Check both texts are now inactive
      const allTexts = await db.select()
        .from(runningTextTable)
        .execute();

      expect(allTexts.every(t => !t.is_active)).toBe(true);
    });
  });

  describe('deleteRunningText', () => {
    it('should delete running text', async () => {
      const created = await createRunningText({
        content: 'To be deleted',
        is_active: false
      });

      await deleteRunningText(created.id);

      // Verify it's deleted
      const result = await db.select()
        .from(runningTextTable)
        .where(eq(runningTextTable.id, created.id))
        .execute();

      expect(result).toHaveLength(0);
    });

    it('should delete active running text', async () => {
      const created = await createRunningText({
        content: 'Active text to delete',
        is_active: true
      });

      await deleteRunningText(created.id);

      // Verify it's deleted
      const result = await db.select()
        .from(runningTextTable)
        .execute();

      expect(result).toHaveLength(0);
    });

    it('should throw error when deleting non-existent running text', async () => {
      expect(deleteRunningText(999999)).rejects.toThrow(/not found/i);
    });

    it('should not affect other running texts when deleting one', async () => {
      const firstText = await createRunningText({
        content: 'Keep this',
        is_active: true
      });

      const secondText = await createRunningText({
        content: 'Delete this',
        is_active: false
      });

      await deleteRunningText(secondText.id);

      // Verify first text still exists
      const remaining = await db.select()
        .from(runningTextTable)
        .execute();

      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe(firstText.id);
      expect(remaining[0].content).toBe('Keep this');
    });
  });
});