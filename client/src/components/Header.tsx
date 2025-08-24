import { Button } from '@/components/ui/button';
import type { AuthResponse } from '../../../server/src/schema';

interface HeaderProps {
  currentUser: AuthResponse['user'] | null;
  currentPage: string;
  isMobileMenuOpen: boolean;
  wideLayout: boolean;
  onPageChange: (page: 'home' | 'services' | 'company-profile') => void;
  onLoginClick: () => void;
  onLogout: () => void;
  onAddPostClick: () => void;
  onAddUserClick: () => void;
  onColorSettingsClick: () => void;
  onLayoutToggle: () => void;
  onMobileMenuToggle: () => void;
}

export function Header({
  currentUser,
  currentPage,
  isMobileMenuOpen,
  wideLayout,
  onPageChange,
  onLoginClick,
  onLogout,
  onAddPostClick,
  onAddUserClick,
  onColorSettingsClick,
  onLayoutToggle,
  onMobileMenuToggle
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="brand">
          <h1>PT. Nusantara Project Konsultan</h1>
          <p className="tagline">Solusi Konsultasi Terpercaya untuk Proyek Anda</p>
        </div>

        <nav className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <a
            href="#"
            className={currentPage === 'home' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onPageChange('home');
            }}
          >
            🏠 Home
          </a>
          <a
            href="#"
            className={currentPage === 'services' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onPageChange('services');
            }}
          >
            🛠️ Services
          </a>
          <a
            href="#"
            className={currentPage === 'company-profile' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onPageChange('company-profile');
            }}
          >
            🏢 Company Profile
          </a>
        </nav>

        <div className="header-actions">
          {/* Admin Actions */}
          {currentUser?.role === 'admin' && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAddPostClick}
              >
                ➕ Tambah Postingan
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onAddUserClick}
              >
                👤 Tambah User
              </Button>
            </>
          )}

          {/* Layout Toggle */}
          {currentPage === 'home' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLayoutToggle}
              title={wideLayout ? 'Standard Layout' : 'Wide Layout'}
            >
              {wideLayout ? '📱' : '📺'}
            </Button>
          )}

          {/* Color Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onColorSettingsClick}
            title="Color Settings"
          >
            🎨
          </Button>

          {/* User Authentication */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">
                👋 {currentUser.username}
                {currentUser.role === 'admin' && (
                  <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                🚪 Logout
              </Button>
            </div>
          ) : (
            <Button onClick={onLoginClick}>
              🔑 Administrator
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mobile-menu-btn"
            onClick={onMobileMenuToggle}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-nav">
            <a
              href="#"
              className={currentPage === 'home' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                onPageChange('home');
                onMobileMenuToggle();
              }}
            >
              🏠 Home
            </a>
            <a
              href="#"
              className={currentPage === 'services' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                onPageChange('services');
                onMobileMenuToggle();
              }}
            >
              🛠️ Services
            </a>
            <a
              href="#"
              className={currentPage === 'company-profile' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                onPageChange('company-profile');
                onMobileMenuToggle();
              }}
            >
              🏢 Company Profile
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}