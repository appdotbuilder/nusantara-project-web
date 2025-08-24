import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import type { Service } from '../../../server/src/schema';

export function ServicesCarousel() {
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
    <section className="services-carousel">
      <h2>🛠️ Jenis-Jenis Jasa Kami</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <p>Memuat layanan...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada layanan yang tersedia.</p>
        </div>
      ) : (
        <div className="services-scroll">
          {services.map((service: Service) => (
            <div key={service.id} className="service-card">
              <h3>⚙️ {service.name}</h3>
              <ul className="service-features">
                {service.features.map((feature: string, index: number) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <Button
                className="w-full mt-4"
                onClick={() => handleWhatsAppClick(service.whatsapp_link, service.name)}
              >
                💬 Hubungi via WhatsApp
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}