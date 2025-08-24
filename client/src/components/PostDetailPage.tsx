import { Button } from '@/components/ui/button';
import type { Post } from '../../../server/src/schema';

interface PostDetailPageProps {
  post: Post | null;
  onBack: () => void;
}

export function PostDetailPage({ post, onBack }: PostDetailPageProps) {
  if (!post) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-500 mb-4">Postingan tidak ditemukan</p>
          <Button onClick={onBack}>
            ← Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return null;
      return (
        <p key={index} className="mb-4 leading-relaxed">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-gray-100"
        >
          ← Kembali ke Beranda
        </Button>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <time dateTime={post.date.toISOString()}>
                {formatDate(post.date)}
              </time>
            </div>
            
            <div className="flex items-center gap-2">
              <span>📂</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                {post.category}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-none">
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
          <div className="text-gray-800 text-base leading-relaxed">
            {formatContent(post.content)}
          </div>
        </div>
      </article>

      {/* Article Footer */}
      <footer className="mt-8 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-gray-600">
                📝 Dipublikasikan pada {formatDate(post.created_at)}
              </p>
              {post.updated_at.getTime() !== post.created_at.getTime() && (
                <p className="text-sm text-gray-500">
                  📝 Terakhir diupdate pada {formatDate(post.updated_at)}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = window.location.href;
                  const text = `Baca artikel menarik: "${post.title}" - PT. Nusantara Project Konsultan`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                💬 Bagikan via WhatsApp
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: `Artikel dari PT. Nusantara Project Konsultan: ${post.title}`,
                      url: window.location.href,
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(window.location.href).then(() => {
                      alert('Link berhasil disalin ke clipboard!');
                    });
                  }
                }}
              >
                🔗 Bagikan
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Call to Action */}
      <section className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
        <div className="text-center">
          <h3 className="text-xl font-bold text-blue-800 mb-4">
            💼 Butuh Konsultasi Profesional?
          </h3>
          <p className="text-blue-600 mb-6">
            Tim ahli PT. Nusantara Project Konsultan siap membantu Anda. 
            Hubungi kami untuk konsultasi gratis dan dapatkan solusi terbaik untuk proyek Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                const message = `Halo! Saya baru saja membaca artikel "${post.title}" dan tertarik untuk berkonsultasi lebih lanjut.`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/6281234567890?text=${encodedMessage}`, '_blank');
              }}
            >
              💬 Konsultasi via WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
            >
              📰 Baca Artikel Lainnya
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}