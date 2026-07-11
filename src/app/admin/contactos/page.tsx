// Admin: all contacts (read-only view, links to vendedor/contactos for detail)
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getTursoClient } from '@/lib/turso-config';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, FileText } from 'lucide-react';
import Link from 'next/link';

export default async function AdminContactosPage() {
  const session = await getServerSession(authOptions);
  const libsql = getTursoClient();
  const result = await libsql.execute({
    sql: `SELECT c.*, u.nombre as ownerNombre, u.apellido as ownerApellido
      FROM Contact c LEFT JOIN "User" u ON c.ownerId = u.id
      ORDER BY c.createdAt DESC LIMIT 100`,
  });
  const contacts = result.rows as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Todos los contactos</h1>
        <p className="text-sm text-muted-foreground">{contacts.length} contactos (mostrando últimos 100)</p>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay contactos en el CRM todavía.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Los contactos se crean desde el panel del vendedor o llegan como leads de la landing.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {contacts.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{c.name}</span>
                      <Badge variant="outline" className="text-[10px] py-0">{c.status}</Badge>
                      {c.segment && <Badge variant="secondary" className="text-[10px] py-0">{c.segment.replace('_', ' ')}</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.address}{c.city ? `, ${c.city}` : ''}</span>
                      {c.primaryPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.primaryPhone}</span>}
                      {c.primaryEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.primaryEmail}</span>}
                    </div>
                    {c.ownerNombre && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">Asignado a: {c.ownerNombre} {c.ownerApellido || ''}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
