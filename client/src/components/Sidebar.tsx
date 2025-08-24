import type { Category } from '../../../server/src/schema';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryClick: (categoryName: string | null) => void;
}

export function Sidebar({ categories, selectedCategory, onCategoryClick }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="about-section">
        <h3>👋 Tentang Kami</h3>
        <p>
          PT. Nusantara Project Konsultan adalah perusahaan konsultasi terpercaya 
          yang menyediakan berbagai layanan profesional untuk mendukung keberhasilan 
          proyek Anda. Dengan pengalaman bertahun-tahun, kami berkomitmen memberikan 
          solusi terbaik untuk setiap kebutuhan konsultasi.
        </p>
      </div>

      <div className="categories-section">
        <h3>📂 Kategori</h3>
        <ul className="categories-list">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCategoryClick(null);
              }}
              className={selectedCategory === null ? 'active' : ''}
            >
              📰 Semua Postingan
            </a>
          </li>
          {categories.map((category: Category) => (
            <li key={category.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onCategoryClick(category.name);
                }}
                className={selectedCategory === category.name ? 'active' : ''}
              >
                📑 {category.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}