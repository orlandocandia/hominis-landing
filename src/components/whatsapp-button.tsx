'use client';

import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '5491165555534'; // 11-6555-5534 formatted for WhatsApp API
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Hola Agustina, me interesa conocer más sobre las coberturas de salud. ¿Podrías asesorarme?'
);

export function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-[#25D366] rounded-full shadow-2xl animate-whatsapp-pulse hover:scale-110 transition-transform duration-300 group"
    >
      <MessageCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-4 py-2 bg-white rounded-xl shadow-lg text-sm font-semibold text-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        ¡Chateá conmigo!
        <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45" />
      </span>
    </a>
  );
}
