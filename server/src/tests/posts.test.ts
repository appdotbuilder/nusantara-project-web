import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { postsTable } from '../db/schema';
import { type CreatePostInput, type UpdatePostInput } from '../schema';
import { 
  createPost, 
  getPosts, 
  getPostById, 
  getRecentPosts, 
  getPostsByCategory, 
  updatePost, 
  deletePost 
} from '../handlers/posts';
import { eq } from 'drizzle-orm';

// Test data
const testPost: CreatePostInput = {
  title: 'Test Post',
  content: 'This is test content for the blog post.',
  category: 'Technology',
  date: new Date('2024-01-15')
};

const testPost2: CreatePostInput = {
  title: 'Another Test Post',
  content: 'This is another test post.',
  category: 'Business',
  date: new Date('2024-01-10')
};

describe('Posts Handlers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  describe('createPost', () => {
    it('should create a post with all fields', async () => {
      const result = await createPost(testPost);

      expect(result.title).toEqual('Test Post');
      expect(result.content).toEqual('This is test content for the blog post.');
      expect(result.category).toEqual('Technology');
      expect(result.date).toEqual(new Date('2024-01-15'));
      expect(result.id).toBeDefined();
      expect(result.created_at).toBeInstanceOf(Date);
      expect(result.updated_at).toBeInstanceOf(Date);
    });

    it('should create a post without date (uses current date)', async () => {
      const inputWithoutDate = {
        title: 'Post without date',
        content: 'Content here',
        category: 'General'
      };

      const result = await createPost(inputWithoutDate);

      expect(result.title).toEqual('Post without date');
      expect(result.date).toBeInstanceOf(Date);
      // Check that date is recent (within last minute)
      const now = new Date();
      const timeDiff = now.getTime() - result.date.getTime();
      expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
    });

    it('should save post to database', async () => {
      const result = await createPost(testPost);

      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.id, result.id))
        .execute();

      expect(posts).toHaveLength(1);
      expect(posts[0].title).toEqual('Test Post');
      expect(posts[0].content).toEqual(testPost.content);
      expect(posts[0].category).toEqual('Technology');
    });
  });

  describe('getPosts', () => {
    it('should return empty array when no posts exist', async () => {
      const results = await getPosts();
      expect(results).toEqual([]);
    });

    it('should return all posts ordered by date descending', async () => {
      // Create posts with different dates
      await createPost(testPost); // 2024-01-15
      await createPost(testPost2); // 2024-01-10

      const results = await getPosts();

      expect(results).toHaveLength(2);
      // Should be ordered by date descending (newest first)
      expect(results[0].title).toEqual('Test Post'); // 2024-01-15 (newer)
      expect(results[1].title).toEqual('Another Test Post'); // 2024-01-10 (older)
    });
  });

  describe('getPostById', () => {
    it('should return null when post does not exist', async () => {
      const result = await getPostById(999);
      expect(result).toBeNull();
    });

    it('should return post when it exists', async () => {
      const created = await createPost(testPost);
      const result = await getPostById(created.id);

      expect(result).not.toBeNull();
      expect(result!.title).toEqual('Test Post');
      expect(result!.id).toEqual(created.id);
    });
  });

  describe('getRecentPosts', () => {
    it('should return empty array when no posts exist', async () => {
      const results = await getRecentPosts();
      expect(results).toEqual([]);
    });

    it('should return posts limited by count', async () => {
      // Create 3 posts
      await createPost(testPost);
      await createPost(testPost2);
      await createPost({
        title: 'Third Post',
        content: 'Third content',
        category: 'Other',
        date: new Date('2024-01-20')
      });

      const results = await getRecentPosts(2);

      expect(results).toHaveLength(2);
      // Should be ordered by date descending
      expect(results[0].title).toEqual('Third Post'); // 2024-01-20 (newest)
      expect(results[1].title).toEqual('Test Post'); // 2024-01-15
    });

    it('should default to 5 posts when no limit specified', async () => {
      // Create 6 posts
      for (let i = 0; i < 6; i++) {
        await createPost({
          title: `Post ${i}`,
          content: `Content ${i}`,
          category: 'Test',
          date: new Date(2024, 0, i + 1)
        });
      }

      const results = await getRecentPosts();

      expect(results).toHaveLength(5);
    });
  });

  describe('getPostsByCategory', () => {
    it('should return empty array when no posts in category exist', async () => {
      const results = await getPostsByCategory('NonExistent');
      expect(results).toEqual([]);
    });

    it('should return posts from specific category only', async () => {
      await createPost(testPost); // Technology
      await createPost(testPost2); // Business
      await createPost({
        title: 'Another Tech Post',
        content: 'More tech content',
        category: 'Technology',
        date: new Date('2024-01-20')
      });

      const results = await getPostsByCategory('Technology');

      expect(results).toHaveLength(2);
      results.forEach(post => {
        expect(post.category).toEqual('Technology');
      });
      // Should be ordered by date descending
      expect(results[0].title).toEqual('Another Tech Post'); // 2024-01-20 (newer)
      expect(results[1].title).toEqual('Test Post'); // 2024-01-15 (older)
    });
  });

  describe('updatePost', () => {
    it('should update post fields', async () => {
      const created = await createPost(testPost);
      
      const updateInput: UpdatePostInput = {
        id: created.id,
        title: 'Updated Title',
        category: 'Updated Category'
      };

      const result = await updatePost(updateInput);

      expect(result.title).toEqual('Updated Title');
      expect(result.category).toEqual('Updated Category');
      expect(result.content).toEqual(testPost.content); // Unchanged
      expect(result.updated_at.getTime()).toBeGreaterThan(result.created_at.getTime());
    });

    it('should update only provided fields', async () => {
      const created = await createPost(testPost);
      
      const updateInput: UpdatePostInput = {
        id: created.id,
        content: 'Updated content only'
      };

      const result = await updatePost(updateInput);

      expect(result.content).toEqual('Updated content only');
      expect(result.title).toEqual(testPost.title); // Unchanged
      expect(result.category).toEqual(testPost.category); // Unchanged
    });

    it('should throw error when post does not exist', async () => {
      const updateInput: UpdatePostInput = {
        id: 999,
        title: 'Non-existent post'
      };

      await expect(updatePost(updateInput)).rejects.toThrow(/not found/i);
    });

    it('should save updated post to database', async () => {
      const created = await createPost(testPost);
      
      const updateInput: UpdatePostInput = {
        id: created.id,
        title: 'Database Updated Title'
      };

      await updatePost(updateInput);

      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.id, created.id))
        .execute();

      expect(posts[0].title).toEqual('Database Updated Title');
    });
  });

  describe('deletePost', () => {
    it('should delete existing post', async () => {
      const created = await createPost(testPost);

      await deletePost(created.id);

      const posts = await db.select()
        .from(postsTable)
        .where(eq(postsTable.id, created.id))
        .execute();

      expect(posts).toHaveLength(0);
    });

    it('should throw error when post does not exist', async () => {
      await expect(deletePost(999)).rejects.toThrow(/not found/i);
    });
  });
});