import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import type { Post, UpdatePostInput, Category } from '../../../server/src/schema';

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
  onPostUpdated: () => void;
}

export function EditPostModal({ post, onClose, onPostUpdated }: EditPostModalProps) {
  const [formData, setFormData] = useState<UpdatePostInput>({
    id: post.id,
    title: post.title,
    content: post.content,
    category: post.category,
    date: post.date
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      await trpc.posts.update.mutate(formData);
      onPostUpdated();
    } catch (error) {
      console.error('Failed to update post:', error);
      setError('Gagal mengupdate postingan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await trpc.posts.delete.mutate(post.id);
      onPostUpdated();
    } catch (error) {
      console.error('Failed to delete post:', error);
      setError('Gagal menghapus postingan. Silakan coba lagi.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !showDeleteConfirm) {
      onClose();
    }
  };

  const formatDateForInput = (date: Date) => {
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <h2 className="modal-title">✏️ Edit Postingan</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={showDeleteConfirm}
          >
            ✕
          </Button>
        </div>

        {showDeleteConfirm ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-red-800 mb-2">
              Konfirmasi Hapus Postingan
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus postingan "{post.title}"? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Menghapus...
                  </>
                ) : (
                  '🗑️ Hapus Postingan'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">📝 Judul Postingan</label>
              <Input
                id="title"
                type="text"
                value={formData.title || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: UpdatePostInput) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Masukkan judul postingan"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">📂 Kategori</label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) =>
                  setFormData((prev: UpdatePostInput) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
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

            <div className="form-group">
              <label htmlFor="date">📅 Tanggal Posting</label>
              <Input
                id="date"
                type="datetime-local"
                value={formatDateForInput(formData.date!)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: UpdatePostInput) => ({ 
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
                value={formData.content || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: UpdatePostInput) => ({ ...prev, content: e.target.value }))
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
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                🗑️ Hapus
              </Button>
              <div className="flex gap-2">
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
                  disabled={isLoading || !formData.title?.trim() || !formData.content?.trim() || !formData.category?.trim()}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Menyimpan...
                    </>
                  ) : (
                    '✅ Update Postingan'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}