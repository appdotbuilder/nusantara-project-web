import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import type { Service } from '../../../server/src/schema';

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = useCallback(async () => {
    try {
      const result = await trpc.services.getAll.query();
      setServices(result);
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleWhatsAppClick = (whatsappLink: string, serviceName: string) => {
    const message = `Halo! Saya tertarik dengan layanan ${serviceName} dari PT. Nusantara Project Konsultan. Bisa minta informasi lebih lanjut?`;
    const encodedMessage = encodeURIComponent(message);
    
    // If it's a WhatsApp link, append the message
    if (whatsappLink.includes('wa.me') || whatsappLink.includes('whatsapp')) {
      const separator = whatsappLink.includes('?') ? '&' : '?';
      window.open(`${whatsappLink}${separator}text=${encodedMessage}`, '_blank');
    } else {
      window.open(whatsappLink, '_blank');
    }
  };

  return (
    <div className="services-page">
      <div className="container mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            🛠️ Jenis-Jenis Jasa Kami
          </h1>
          <p className="text-lg text-gray-600">
            Layanan konsultasi profesional untuk mendukung keberhasilan proyek Anda
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4">Memuat layanan...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <p className="text-xl text-gray-500 mb-4">Belum ada layanan yang tersedia</p>
            <p className="text-gray-400">Admin dapat menambahkan layanan melalui panel administrasi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: Service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">⚙️</div>
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {service.name}
                  </h3>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    ✨ Fitur Layanan:
                  </h4>
                  <ul className="space-y-2">
                    {service.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 flex-shrink-0">✓</span>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-center">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                    onClick={() => handleWhatsAppClick(service.whatsapp_link, service.name)}
                  >
                    💬 Hubungi via WhatsApp
                  </Button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400">
                    📅 Layanan tersedia sejak {new Date(service.created_at).getFullYear()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-3xl mb-3">💼</div>
            <h3 className="text-lg font-bold text-blue-800 mb-2">
              Butuh Layanan Khusus?
            </h3>
            <p className="text-blue-600 mb-4">
              Kami juga menyediakan konsultasi khusus sesuai kebutuhan proyek Anda.
              Hubungi kami untuk diskusi lebih lanjut!
            </p>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => {
                const message = 'Halo! Saya ingin berkonsultasi mengenai layanan khusus untuk proyek saya.';
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/6281234567890?text=${encodedMessage}`, '_blank');
              }}
            >
              💬 Konsultasi Gratis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}