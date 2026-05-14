'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Check, ChevronDown, ChevronUp, FileCode } from 'lucide-react';

const filesToEdit = [
  {
    id: '1',
    path: 'src/lib/db.ts',
    description: 'Conexión a Turso (base de datos en la nube)',
    action: 'REEMPLAZAR TODO el contenido del archivo con este código:',
    code: `import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''

  // If using Turso (Vercel production), use the libSQL adapter
  if (databaseUrl.startsWith('libsql://')) {
    console.log('[DB] Using Turso (libSQL) adapter')
    const libsql = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || '',
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter })
  }

  // Local development: use simple SQLite PrismaClient
  console.log('[DB] Using SQLite (local)')
  return new PrismaClient({ log: ['query'] })
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient()
}

export const db = globalForPrisma.prisma`,
  },
  {
    id: '2',
    path: 'src/lib/sanitize.ts',
    description: 'Separar CABA y GBA como opciones individuales',
    action: 'Buscar esta línea y reemplazarla:',
    findWhat: "const validCoverages = ['CABA_GBA'];",
    replaceWith: "const validCoverages = ['CABA', 'GBA'];",
    code: `const validCoverages = ['CABA', 'GBA'];`,
  },
  {
    id: '3',
    path: 'src/app/page.tsx',
    description: 'Formulario: separar opciones CABA y GBA + sacar botón "Ver Segmentos"',
    action: 'Buscar esta línea y reemplazarla:',
    findWhat: '<SelectItem value="CABA_GBA">Caba y Gba</SelectItem>',
    replaceWith: `<SelectItem value="CABA">CABA</SelectItem>
                      <SelectItem value="GBA">GBA</SelectItem>`,
    code: `<SelectItem value="CABA">CABA</SelectItem>
<SelectItem value="GBA">GBA</SelectItem>`,
  },
  {
    id: '4',
    path: 'src/app/dashboard/page.tsx',
    description: 'Dashboard: corregir visualización de cobertura',
    action: 'Buscar esta línea y reemplazarla:',
    findWhat: "{contact.cobertura.replace('_', ' y ')}",
    replaceWith: '{contact.cobertura}',
    code: '{contact.cobertura}',
  },
  {
    id: '5',
    path: 'src/lib/db-turso.ts',
    description: 'Archivo innecesario (ya no se usa)',
    action: 'ELIMINAR este archivo completo (ícono papelera 🗑️ en GitHub)',
    code: '',
  },
];

export default function DownloadPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <a href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al sitio
        </a>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            📝 Guía de Actualización
          </h1>
          <p className="text-white/60 text-sm">
            Editá estos archivos directamente en GitHub desde tu navegador. No necesitás descargar nada.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {filesToEdit.map((file) => (
            <div key={file.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {/* File header */}
              <button
                onClick={() => setExpandedId(expandedId === file.id ? null : file.id)}
                className="w-full p-4 flex items-center gap-3 text-left hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-hominis-blue to-hominis-violet flex items-center justify-center flex-shrink-0">
                  <FileCode className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-mono text-sm truncate">{file.path}</p>
                  <p className="text-white/50 text-xs mt-0.5">{file.description}</p>
                </div>
                {expandedId === file.id ? (
                  <ChevronUp className="w-5 h-5 text-white/40 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/40 flex-shrink-0" />
                )}
              </button>

              {/* Expanded content */}
              {expandedId === file.id && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Action description */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                    <p className="text-amber-300 text-sm font-medium">
                      ⚡ {file.action}
                    </p>
                  </div>

                  {/* Find & Replace info */}
                  {file.findWhat && (
                    <div className="space-y-2">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        <p className="text-red-300 text-xs font-semibold mb-1">❌ BUSCAR (borrar esto):</p>
                        <code className="text-red-200 text-xs break-all">{file.findWhat}</code>
                      </div>
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                        <p className="text-green-300 text-xs font-semibold mb-1">✅ REEMPLAZAR CON (pegar esto):</p>
                        <code className="text-green-200 text-xs break-all">{file.replaceWith}</code>
                      </div>
                    </div>
                  )}

                  {/* Code block */}
                  {file.code && (
                    <div className="relative">
                      <div className="bg-black/40 rounded-xl p-4 overflow-x-auto">
                        <pre className="text-green-300 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                          {file.code}
                        </pre>
                      </div>
                      <button
                        onClick={() => copyToClipboard(file.code, file.id)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        title="Copiar código"
                      >
                        {copiedId === file.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/60" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-white font-bold text-lg mb-4">📋 Instrucciones paso a paso</h2>
          <ol className="space-y-3 text-white/70 text-sm">
            <li className="flex gap-3">
              <span className="bg-hominis-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <span>Andá a tu repositorio en <strong className="text-white">github.com</strong></span>
            </li>
            <li className="flex gap-3">
              <span className="bg-hominis-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
              <span>Navegá hasta cada archivo (por ejemplo: <code className="text-hominis-gold">src/lib/db.ts</code>)</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-hominis-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
              <span>Hacé clic en el <strong className="text-white">lápiz ✏️</strong> (arriba a la derecha) para editar</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-hominis-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
              <span>Para los archivos 1: <strong className="text-white">borrá todo y pegá</strong> el código nuevo. Para los archivos 2-4: <strong className="text-white">buscá y reemplazá</strong> las líneas indicadas.</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-hominis-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
              <span>Para el archivo 5 (db-turso.ts): hacé clic en la <strong className="text-white">papelera 🗑️</strong> para eliminarlo</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-hominis-blue text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">6</span>
              <span>Hacé clic en <strong className="text-white">&quot;Commit changes...&quot;</strong> → <strong className="text-white">&quot;Commit changes&quot;</strong> para guardar cada cambio</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
              <span><strong className="text-green-300">¡Listo!</strong> Vercel detecta los cambios y redeploya automáticamente en 1-2 min</span>
            </li>
          </ol>
        </div>

        {/* After deploy */}
        <div className="mt-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
          <h2 className="text-purple-300 font-bold text-sm mb-2">🚀 Después de que Vercel redeploye</h2>
          <p className="text-purple-200/70 text-xs leading-relaxed">
            Una vez que Vercel termine de redeployar, andá a tu sitio y probá loguearte en <strong>/login</strong> con:
            <br />Email: <code className="text-purple-300">acandia@mphominis.com.ar</code>
            <br />Contraseña: <code className="text-purple-300">Hominis2025!</code>
            <br /><br />
            Si te da error de usuario, hay que crear el admin desde el endpoint <code className="text-purple-300">/api/setup</code>. Contactame y te guío.
          </p>
        </div>
      </div>
    </div>
  );
}
