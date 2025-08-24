import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trpc } from '@/utils/trpc';
import type { AuthResponse, LoginInput } from '../../../server/src/schema';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: AuthResponse['user']) => void;
}

export function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const [formData, setFormData] = useState<LoginInput>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await trpc.auth.login.mutate(formData);
      
      // Store user token if provided
      if (response.token) {
        localStorage.setItem('user-token', response.token);
      }
      
      onLogin(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Username atau password salah. Silakan coba lagi.');
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
          <h2 className="modal-title">🔑 Login Administrator</h2>
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
            <label htmlFor="username">👤 Username</label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: LoginInput) => ({ ...prev, username: e.target.value }))
              }
              placeholder="Masukkan username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev: LoginInput) => ({ ...prev, password: e.target.value }))
              }
              placeholder="Masukkan password"
              required
            />
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
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Memproses...
                </>
              ) : (
                '🔓 Login'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Demo Credentials</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Admin:</strong> username: admin, password: admin123</p>
            <p><strong>User:</strong> username: user, password: user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}