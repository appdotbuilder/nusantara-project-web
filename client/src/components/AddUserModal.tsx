import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trpc } from '@/utils/trpc';
import type { CreateUserInput } from '../../../server/src/schema';

interface AddUserModalProps {
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserModal({ onClose, onUserAdded }: AddUserModalProps) {
  const [formData, setFormData] = useState<CreateUserInput>({
    username: '',
    password: '',
    role: 'user'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newUser = await trpc.users.create.mutate(formData);
      setSuccess(`User "${newUser.username}" berhasil dibuat dengan role ${newUser.role}!`);
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        role: 'user'
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onUserAdded();
      }, 2000);
    } catch (error) {
      console.error('Failed to create user:', error);
      setError('Gagal membuat user. Username mungkin sudah digunakan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">👤 Tambah User Baru</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">👤 Username</label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateUserInput) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Masukkan username (min. 3 karakter)"
              required
              autoFocus
              disabled={isLoading || !!success}
            />
            <p className="text-sm text-gray-500 mt-1">
              💡 Username harus unik dan minimal 3 karakter
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: CreateUserInput) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Masukkan password (min. 6 karakter)"
              required
              disabled={isLoading || !!success}
            />
            <p className="text-sm text-gray-500 mt-1">
              🔐 Password minimal 6 karakter untuk keamanan
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="role">👑 Role</label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'user') =>
                setFormData((prev: CreateUserInput) => ({ ...prev, role: value }))
              }
              disabled={isLoading || !!success}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">
                  👤 User - Akses terbatas
                </SelectItem>
                <SelectItem value="admin">
                  👑 Admin - Akses penuh
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              {formData.role === 'admin' 
                ? '⚡ Admin dapat mengelola postingan dan user'
                : '📖 User hanya dapat melihat konten'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm">✅ {success}</p>
              <p className="text-green-600 text-xs mt-1">Modal akan tertutup otomatis...</p>
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
              disabled={
                isLoading || 
                !!success ||
                !formData.username.trim() || 
                !formData.password.trim() ||
                formData.username.length < 3 ||
                formData.password.length < 6
              }
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Membuat User...
                </>
              ) : success ? (
                '✅ Berhasil Dibuat!'
              ) : (
                '👤 Buat User'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Informasi Role</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>👤 User:</strong> Dapat login dan melihat konten</p>
            <p><strong>👑 Admin:</strong> Dapat mengelola postingan, user, dan semua fitur</p>
          </div>
        </div>
      </div>
    </div>
  );
}