import { Button } from '@/components/ui/button';

type Theme = 'default' | 'dark' | 'green' | 'purple';

interface ColorSettingsModalProps {
  currentTheme: Theme;
  onClose: () => void;
  onThemeChange: (theme: Theme) => void;
}

export function ColorSettingsModal({ currentTheme, onClose, onThemeChange }: ColorSettingsModalProps) {
  const themes = [
    {
      id: 'default' as Theme,
      name: 'Default',
      description: 'Tema standar dengan warna biru',
      preview: 'bg-blue-500',
      emoji: '🔵'
    },
    {
      id: 'dark' as Theme,
      name: 'Dark',
      description: 'Tema gelap untuk mata yang lebih nyaman',
      preview: 'bg-gray-800',
      emoji: '🌙'
    },
    {
      id: 'green' as Theme,
      name: 'Green',
      description: 'Tema hijau yang segar dan alami',
      preview: 'bg-green-500',
      emoji: '🌿'
    },
    {
      id: 'purple' as Theme,
      name: 'Purple',
      description: 'Tema ungu yang elegan dan modern',
      preview: 'bg-purple-500',
      emoji: '💜'
    }
  ];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">🎨 Pengaturan Tema</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pilih tema yang Anda sukai untuk mengubah tampilan aplikasi:
          </p>

          <div className="grid gap-3">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                  ${currentTheme === theme.id 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => onThemeChange(theme.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${theme.preview} flex items-center justify-center text-white font-bold text-sm`}>
                    {theme.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {theme.name}
                      {currentTheme === theme.id && (
                        <span className="ml-2 text-sm text-primary">✓ Aktif</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{theme.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600">💡</span>
              <div>
                <h3 className="font-semibold text-yellow-800">Tips:</h3>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Pengaturan tema akan tersimpan otomatis</li>
                  <li>• Tema Dark cocok untuk penggunaan malam hari</li>
                  <li>• Setiap tema memiliki karakteristik warna yang berbeda</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <Button onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}