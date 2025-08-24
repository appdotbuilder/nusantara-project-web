import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import type { CreatePostInput, Category } from '../../../server/src/schema';

interface AddPostModalProps {
  onClose: () => void;
  onPostAdded: () => void;
}

export function AddPostModal({ onClose, onPostAdded }: AddPostModalProps) {
  const [formData, setFormData] = useState<CreatePostInput>({
    title: '',
    content: '',
    category: '',
    date: new Date()
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const result = await trpc.categories.getAll.query();
      setCategories(result);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await trpc.posts.create.mutate(formData);
      onPostAdded();
    } catch (error) {
      console.error('Failed to create post:', error);
      setError('Gagal membuat postingan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    setIsAddingCategory(true);
    try {
      const category = await trpc.categories.create.mutate({ name: newCategory.trim() });
      setCategories((prev: Category[]) => [...prev, category]);
      setFormData((prev: CreatePostInput) => ({ ...prev, category: category.name }));
      setNewCategory('');
    } catch (error) {
      console.error('Failed to add category:', error);
      setError('Gagal menambahkan kategori. Silakan coba lagi.');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">➕ Tambah Postingan Baru</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">📝 Judul Postingan</label>
            <Input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreatePostInput) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Masukkan judul postingan"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">📂 Kategori</label>
            <div className="flex gap-2">
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev: CreatePostInput) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Add new category */}
            <div className="mt-2 flex gap-2">
              <Input
                type="text"
                value={newCategory}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                placeholder="Atau tambah kategori baru"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || isAddingCategory}
              >
                {isAddingCategory ? '⏳' : '➕'}
              </Button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="date">📅 Tanggal Posting</label>
            <Input
              id="date"
              type="datetime-local"
              value={formatDateForInput(formData.date!)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreatePostInput) => ({ 
                  ...prev, 
                  date: new Date(e.target.value) 
                }))
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">📄 Konten Postingan</label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setFormData((prev: CreatePostInput) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Tulis konten postingan di sini..."
              rows={10}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              💡 Tips: Gunakan enter untuk membuat paragraf baru
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !formData.category.trim()}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Menyimpan...
                </>
              ) : (
                '✅ Simpan Postingan'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}