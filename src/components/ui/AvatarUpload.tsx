'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { isBlobConfigured } from '@/lib/storage';

interface AvatarUploadProps {
  initialUrl: string | null;
  userName: string;
  onUploaded?: (url: string) => void;
}

export function AvatarUpload({ initialUrl, userName, onUploaded }: AvatarUploadProps) {
  const [url, setUrl] = useState(initialUrl);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobEnabled = isBlobConfigured();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Debe ser una imagen');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no puede superar 5MB');
        return;
      }
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al subir');
        setUrl(data.url);
        onUploaded?.(data.url);
        toast.success('Foto de perfil actualizada');
      } catch (e: any) {
        toast.error(e.message || 'Error al subir la imagen');
      } finally {
        setLoading(false);
      }
    },
    [onUploaded]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // Generate initials fallback
  const initials = userName
    .split(' ')
    .map((p) => p.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-hominis-blue to-hominis-violet flex items-center justify-center text-white text-3xl font-bold shadow-lg">
          {url ? (
            <img src={url} alt={userName} className="w-full h-full object-cover" />
          ) : (
            <span>{initials || '?'}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading || !blobEnabled}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white disabled:cursor-not-allowed"
          title={blobEnabled ? 'Cambiar foto' : 'Upload no configurado'}
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
      </div>
      {!blobEnabled && (
        <p className="text-xs text-amber-600 flex items-center gap-1 text-center max-w-[200px]">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          Upload de fotos no configurado. Contactá al admin.
        </p>
      )}
      <p className="text-xs text-muted-foreground">Click para cambiar la foto</p>
    </div>
  );
}
