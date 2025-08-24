import { db } from '../db';
import { categoriesTable, postsTable } from '../db/schema';
import { type CreateCategoryInput, type Category } from '../schema';
import { eq, asc } from 'drizzle-orm';

export async function getCategories(): Promise<Category[]> {
  try {
    const results = await db.select()
      .from(categoriesTable)
      .orderBy(asc(categoriesTable.name))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  try {
    const result = await db.insert(categoriesTable)
      .values({
        name: input.name
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Category creation failed:', error);
    throw error;
  }
}

export async function getCategoryById(id: number): Promise<Category | null> {
  try {
    const results = await db.select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .execute();

    return results[0] || null;
  } catch (error) {
    console.error('Failed to fetch category by ID:', error);
    throw error;
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    // First, update all posts in this category to use 'Uncategorized'
    // This ensures we don't orphan posts when deleting a category
    await db.update(postsTable)
      .set({ category: 'Uncategorized' })
      .where(eq(postsTable.category, String(id)))
      .execute();

    // Then delete the category
    await db.delete(categoriesTable)
      .where(eq(categoriesTable.id, id))
      .execute();
  } catch (error) {
    console.error('Category deletion failed:', error);
    throw error;
  }
}