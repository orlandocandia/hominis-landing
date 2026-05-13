'use client';

import { Button } from '@/components/ui/button';
import { Download, FileArchive, ArrowLeft } from 'lucide-react';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-hominis-gradient flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <a href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al sitio
        </a>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-hominis-blue to-hominis-violet flex items-center justify-center mx-auto mb-6">
            <FileArchive className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-2xl font-serif font-bold gradient-text mb-2">
            Descargar Proyecto
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            Hacé clic en el botón para descargar el archivo ZIP con todo el código listo para subir a GitHub.
          </p>

          <a href="/proyecto-hominis.zip" download="proyecto-hominis.zip">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-hominis-blue to-hominis-violet hover:from-hominis-indigo hover:to-hominis-purple text-white font-semibold shadow-lg shadow-hominis-violet/25 text-base h-14 rounded-xl"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar ZIP (2.8 MB)
            </Button>
          </a>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-left">
            <p className="text-xs font-semibold text-foreground mb-2">El ZIP contiene:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✅ Código fuente completo (src/)</li>
              <li>✅ Base de datos schema (prisma/)</li>
              <li>✅ Imágenes (public/)</li>
              <li>✅ Configuración (.env.example, package.json, etc.)</li>
              <li>✅ Instrucciones (README.md)</li>
              <li>❌ NO incluye node_modules, .env, ni db</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
