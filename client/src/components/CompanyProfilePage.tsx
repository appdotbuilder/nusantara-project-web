import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import type { AuthResponse, CompanyProfile, TeamMember } from '../../../server/src/schema';

interface CompanyProfilePageProps {
  currentUser: AuthResponse['user'] | null;
}

export function CompanyProfilePage({ currentUser }: CompanyProfilePageProps) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const result = await trpc.companyProfile.get.query();
      setProfile(result);
    } catch (error) {
      console.error('Failed to load company profile:', error);
    }
  }, []);

  const loadTeamMembers = useCallback(async () => {
    try {
      const result = await trpc.teamMembers.getAll.query();
      setTeamMembers(result);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadTeamMembers()]);
      setLoading(false);
    };
    
    loadData();
  }, [loadProfile, loadTeamMembers]);

  const handleDownload = (url: string, filename: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4">Memuat profil perusahaan...</p>
      </div>
    );
  }

  return (
    <div className="company-profile">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">
          🏢 Profil Perusahaan
        </h1>
        <p className="text-lg text-gray-600">
          PT. Nusantara Project Konsultan
        </p>
      </div>

      {/* About Us Section */}
      <section className="profile-section">
        <h2>🌟 Tentang Kami</h2>
        <p className="text-gray-700 leading-relaxed">
          {profile?.about_us || 
           'PT. Nusantara Project Konsultan adalah perusahaan konsultasi terpercaya yang berdedikasi untuk memberikan solusi terbaik bagi klien kami. Dengan pengalaman bertahun-tahun di industri konsultasi, kami memiliki keahlian dalam berbagai bidang untuk mendukung kesuksesan proyek Anda.'}
        </p>
      </section>

      {/* Vision & Mission Section */}
      <section className="profile-section">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2>🎯 Visi</h2>
            <p className="text-gray-700 leading-relaxed">
              {profile?.vision || 
               'Menjadi perusahaan konsultan terdepan di Indonesia yang memberikan solusi inovatif dan berkelanjutan untuk mendukung pertumbuhan bisnis klien.'}
            </p>
          </div>
          <div>
            <h2>🚀 Misi</h2>
            <p className="text-gray-700 leading-relaxed">
              {profile?.mission || 
               'Memberikan layanan konsultasi berkualitas tinggi dengan pendekatan profesional, inovatif, dan berorientasi pada hasil untuk mencapai kepuasan klien yang optimal.'}
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="profile-section">
        <h2>👥 Tim Kami</h2>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👤</div>
            <p className="text-gray-500">Informasi tim sedang dipersiapkan</p>
          </div>
        ) : (
          <div className="team-grid">
            {teamMembers.map((member: TeamMember) => (
              <div key={member.id} className="team-member">
                {member.image_url ? (
                  <img 
                    src={member.image_url} 
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👤</span>
                  </div>
                )}
                <h4 className="font-bold text-lg">{member.name}</h4>
                <p className="position text-primary font-medium">{member.position}</p>
                {member.description && (
                  <p className="text-sm text-gray-600 mt-2">{member.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section className="profile-section">
        <h2>📞 Hubungi Kami</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="prose max-w-none">
            <div className="whitespace-pre-line text-gray-700">
              {profile?.contact_info || `📍 Alamat:
Jl. Contoh No. 123, Jakarta Selatan 12345

📞 Telepon:
+62 21 1234 5678

📧 Email:
info@nusantaraprojectkonsultan.com

💬 WhatsApp:
+62 812 3456 7890

🕒 Jam Operasional:
Senin - Jumat: 08:00 - 17:00 WIB
Sabtu: 08:00 - 12:00 WIB`}
            </div>
          </div>
        </div>
      </section>

      {/* Documentation Images Section */}
      <section className="profile-section">
        <h2>📸 Dokumentasi</h2>
        {profile?.documentation_images && profile.documentation_images.length > 0 ? (
          <div className="documentation-grid">
            {profile.documentation_images.map((imageUrl: string, index: number) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Dokumentasi ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-gray-500">Dokumentasi sedang dipersiapkan</p>
          </div>
        )}
      </section>

      {/* Downloadable Documents Section */}
      <section className="profile-section">
        <h2>📄 Dokumen</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-blue-800 mb-2">
              Company Proposal
            </h3>
            <p className="text-blue-600 mb-4">
              Unduh proposal perusahaan kami untuk mengetahui lebih detail tentang layanan yang tersedia.
            </p>
            {profile?.proposal_url ? (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleDownload(profile.proposal_url!, 'Company_Proposal.pdf')}
              >
                📥 Download Proposal
              </Button>
            ) : (
              <Button variant="outline" disabled>
                📄 Proposal Sedang Dipersiapkan
              </Button>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">⚖️</div>
            <h3 className="text-lg font-bold text-green-800 mb-2">
              Badan Hukum
            </h3>
            <p className="text-green-600 mb-4">
              Dokumen legalitas perusahaan yang menunjukkan status hukum PT. Nusantara Project Konsultan.
            </p>
            {profile?.legal_doc_url ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleDownload(profile.legal_doc_url!, 'Legal_Document.pdf')}
              >
                📥 Download Badan Hukum
              </Button>
            ) : (
              <Button variant="outline" disabled>
                📄 Dokumen Sedang Dipersiapkan
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="profile-section bg-gradient-to-r from-blue-50 to-purple-50 border-none">
        <div className="text-center">
          <h2>🤝 Mari Berkolaborasi</h2>
          <p className="text-gray-700 mb-6">
            Siap untuk memulai proyek Anda? Hubungi kami sekarang untuk konsultasi gratis 
            dan dapatkan solusi terbaik untuk kebutuhan bisnis Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                const message = 'Halo! Saya tertarik untuk berkonsultasi mengenai layanan PT. Nusantara Project Konsultan.';
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/6281234567890?text=${encodedMessage}`, '_blank');
              }}
            >
              💬 WhatsApp Konsultasi
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.location.href = 'mailto:info@nusantaraprojectkonsultan.com'}
            >
              📧 Email Kami
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}