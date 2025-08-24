import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { HomePage } from '@/components/HomePage';
import { ServicesPage } from '@/components/ServicesPage';
import { CompanyProfilePage } from '@/components/CompanyProfilePage';
import { PostDetailPage } from '@/components/PostDetailPage';
import { LoginModal } from '@/components/LoginModal';
import { AddPostModal } from '@/components/AddPostModal';
import { EditPostModal } from '@/components/EditPostModal';
import { AddUserModal } from '@/components/AddUserModal';
import { ColorSettingsModal } from '@/components/ColorSettingsModal';
import { trpc } from '@/utils/trpc';
import type { AuthResponse, Post } from '../../server/src/schema';
import './App.css';

type Page = 'home' | 'services' | 'company-profile' | 'post-detail';
type Theme = 'default' | 'dark' | 'green' | 'purple';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<AuthResponse['user'] | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [theme, setTheme] = useState<Theme>('default');
  const [wideLayout, setWideLayout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showColorSettingsModal, setShowColorSettingsModal] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme && ['default', 'dark', 'green', 'purple'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  const handleLogin = useCallback((user: AuthResponse['user']) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('user-token');
  }, []);

  const handlePostClick = useCallback((post: Post) => {
    setSelectedPost(post);
    setCurrentPage('post-detail');
  }, []);

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post);
    setShowEditPostModal(true);
  }, []);

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
    setShowColorSettingsModal(false);
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentPage('home');
    setSelectedPost(null);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            currentUser={currentUser}
            wideLayout={wideLayout}
            onPostClick={handlePostClick}
            onEditPost={handleEditPost}
          />
        );
      case 'services':
        return <ServicesPage />;
      case 'company-profile':
        return <CompanyProfilePage currentUser={currentUser} />;
      case 'post-detail':
        return (
          <PostDetailPage
            post={selectedPost}
            onBack={handleBackToHome}
          />
        );
      default:
        return (
          <HomePage
            currentUser={currentUser}
            wideLayout={wideLayout}
            onPostClick={handlePostClick}
            onEditPost={handleEditPost}
          />
        );
    }
  };

  return (
    <div className={`app theme-${theme}`}>
      <Header
        currentUser={currentUser}
        currentPage={currentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        onPageChange={setCurrentPage}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onAddPostClick={() => setShowAddPostModal(true)}
        onAddUserClick={() => setShowAddUserModal(true)}
        onColorSettingsClick={() => setShowColorSettingsModal(true)}
        onLayoutToggle={() => setWideLayout(!wideLayout)}
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        wideLayout={wideLayout}
      />

      <main className="main-content">
        {renderCurrentPage()}
      </main>

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
        />
      )}

      {showAddPostModal && (
        <AddPostModal
          onClose={() => setShowAddPostModal(false)}
          onPostAdded={() => setShowAddPostModal(false)}
        />
      )}

      {showEditPostModal && editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => {
            setShowEditPostModal(false);
            setEditingPost(null);
          }}
          onPostUpdated={() => {
            setShowEditPostModal(false);
            setEditingPost(null);
          }}
        />
      )}

      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onUserAdded={() => setShowAddUserModal(false)}
        />
      )}

      {showColorSettingsModal && (
        <ColorSettingsModal
          currentTheme={theme}
          onClose={() => setShowColorSettingsModal(false)}
          onThemeChange={handleThemeChange}
        />
      )}
    </div>
  );
}

export default App;