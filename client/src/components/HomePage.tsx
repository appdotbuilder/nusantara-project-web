import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RunningText } from '@/components/RunningText';
import { DateTimeCard } from '@/components/DateTimeCard';
import { ServicesCarousel } from '@/components/ServicesCarousel';
import { Sidebar } from '@/components/Sidebar';
import { trpc } from '@/utils/trpc';
import type { AuthResponse, Post, Category } from '../../../server/src/schema';

interface HomePageProps {
  currentUser: AuthResponse['user'] | null;
  wideLayout: boolean;
  onPostClick: (post: Post) => void;
  onEditPost: (post: Post) => void;
}

export function HomePage({ currentUser, wideLayout, onPostClick, onEditPost }: HomePageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      let result: Post[];
      
      if (selectedCategory) {
        result = await trpc.posts.getByCategory.query(selectedCategory);
      } else {
        result = await trpc.posts.getRecent.query(10);
      }
      
      setPosts(result);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await trpc.categories.getAll.query();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCategoryClick = useCallback((categoryName: string | null) => {
    setSelectedCategory(categoryName);
  }, []);

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div>
      <RunningText />
      
      <div className="home-container">
        <DateTimeCard />
        
        <ServicesCarousel />

        <div className={`home-layout ${wideLayout ? 'wide' : ''}`}>
          <section className="posts-section">
            <div className="flex justify-between items-center mb-4">
              <h2>📰 Blog Terbaru</h2>
              {selectedCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCategoryClick(null)}
                >
                  🏠 Semua Postingan
                </Button>
              )}
            </div>

            {selectedCategory && (
              <p className="mb-4 text-sm text-gray-600">
                Menampilkan postingan dalam kategori: <strong>{selectedCategory}</strong>
              </p>
            )}

            {loading ? (
              <div className="text-center py-8">
                <p>Memuat postingan...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {selectedCategory 
                    ? `Belum ada postingan dalam kategori "${selectedCategory}"`
                    : 'Belum ada postingan. Admin dapat menambahkan postingan baru.'
                  }
                </p>
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map((post: Post) => (
                  <article key={post.id} className="post-card">
                    <div className="post-header">
                      <div>
                        <h3 className="post-title">{post.title}</h3>
                        <div className="post-meta">
                          <span>📅 {formatDate(post.date)}</span>
                          <span className="ml-4">📂 {post.category}</span>
                        </div>
                      </div>
                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditPost(post)}
                          title="Edit Postingan"
                        >
                          ✏️
                        </Button>
                      )}
                    </div>
                    
                    <div className="post-content">
                      <p>{truncateContent(post.content)}</p>
                    </div>
                    
                    <div className="post-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPostClick(post)}
                      >
                        📖 Baca Selengkapnya
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {!wideLayout && (
            <Sidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}