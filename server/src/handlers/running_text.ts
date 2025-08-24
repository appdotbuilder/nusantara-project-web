import { db } from '../db';
import { runningTextTable } from '../db/schema';
import { type CreateRunningTextInput, type UpdateRunningTextInput, type RunningText } from '../schema';
import { eq, desc, and } from 'drizzle-orm';

export async function getActiveRunningText(): Promise<RunningText | null> {
  try {
    const results = await db.select()
      .from(runningTextTable)
      .where(eq(runningTextTable.is_active, true))
      .limit(1)
      .execute();

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Failed to fetch active running text:', error);
    throw error;
  }
}

export async function getAllRunningTexts(): Promise<RunningText[]> {
  try {
    const results = await db.select()
      .from(runningTextTable)
      .orderBy(desc(runningTextTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch all running texts:', error);
    throw error;
  }
}

export async function createRunningText(input: CreateRunningTextInput): Promise<RunningText> {
  try {
    // If the new running text should be active, deactivate all others first
    if (input.is_active) {
      await db.update(runningTextTable)
        .set({ 
          is_active: false, 
          updated_at: new Date() 
        })
        .where(eq(runningTextTable.is_active, true))
        .execute();
    }

    // Insert the new running text
    const result = await db.insert(runningTextTable)
      .values({
        content: input.content,
        is_active: input.is_active,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Failed to create running text:', error);
    throw error;
  }
}

export async function updateRunningText(input: UpdateRunningTextInput): Promise<RunningText> {
  try {
    // If setting this running text to active, deactivate all others first
    if (input.is_active === true) {
      await db.update(runningTextTable)
        .set({ 
          is_active: false, 
          updated_at: new Date() 
        })
        .where(eq(runningTextTable.is_active, true))
        .execute();
    }

    // Prepare update values, only including provided fields
    const updateValues: any = {
      updated_at: new Date()
    };

    if (input.content !== undefined) {
      updateValues.content = input.content;
    }
    if (input.is_active !== undefined) {
      updateValues.is_active = input.is_active;
    }

    // Update the running text
    const result = await db.update(runningTextTable)
      .set(updateValues)
      .where(eq(runningTextTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Running text with id ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Failed to update running text:', error);
    throw error;
  }
}

export async function deleteRunningText(id: number): Promise<void> {
  try {
    const result = await db.delete(runningTextTable)
      .where(eq(runningTextTable.id, id))
      .returning({ id: runningTextTable.id })
      .execute();

    if (result.length === 0) {
      throw new Error(`Running text with id ${id} not found`);
    }
  } catch (error) {
    console.error('Failed to delete running text:', error);
    throw error;
  }
}