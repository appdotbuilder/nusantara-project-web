import { db } from '../db';
import { postsTable } from '../db/schema';
import { type CreatePostInput, type UpdatePostInput, type Post } from '../schema';
import { eq, desc } from 'drizzle-orm';

export const createPost = async (input: CreatePostInput): Promise<Post> => {
  try {
    // Use current date if no date is provided
    const postDate = input.date || new Date();
    
    // Insert post record
    const result = await db.insert(postsTable)
      .values({
        title: input.title,
        content: input.content,
        category: input.category,
        date: postDate
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Post creation failed:', error);
    throw error;
  }
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    // Fetch all posts ordered by date descending (newest first)
    const results = await db.select()
      .from(postsTable)
      .orderBy(desc(postsTable.date))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
};

export const getPostById = async (id: number): Promise<Post | null> => {
  try {
    const results = await db.select()
      .from(postsTable)
      .where(eq(postsTable.id, id))
      .execute();

    return results[0] || null;
  } catch (error) {
    console.error('Failed to fetch post by ID:', error);
    throw error;
  }
};

export const getRecentPosts = async (limit: number = 5): Promise<Post[]> => {
  try {
    const results = await db.select()
      .from(postsTable)
      .orderBy(desc(postsTable.date))
      .limit(limit)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch recent posts:', error);
    throw error;
  }
};

export const getPostsByCategory = async (category: string): Promise<Post[]> => {
  try {
    const results = await db.select()
      .from(postsTable)
      .where(eq(postsTable.category, category))
      .orderBy(desc(postsTable.date))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch posts by category:', error);
    throw error;
  }
};

export const updatePost = async (input: UpdatePostInput): Promise<Post> => {
  try {
    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.date !== undefined) updateData.date = input.date;

    // Update the post
    const result = await db.update(postsTable)
      .set(updateData)
      .where(eq(postsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Post with ID ${input.id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Post update failed:', error);
    throw error;
  }
};

export const deletePost = async (id: number): Promise<void> => {
  try {
    const result = await db.delete(postsTable)
      .where(eq(postsTable.id, id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Post with ID ${id} not found`);
    }
  } catch (error) {
    console.error('Post deletion failed:', error);
    throw error;
  }
};