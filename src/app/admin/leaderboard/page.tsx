'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Loader2, Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Ranking {
  userId: string;
  points: number;
  level: number;
  badges: string[];
  nombre: string;
  apellido: string | null;
  email: string;
  rol: string;
  avatarUrl: string | null;
  totalContacts: number;
  conversionRate: number;
  conversions: number;
}

interface BadgeDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  pointsAward: number;
}

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [badges, setBadges] = useState<BadgeDef[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/leaderboard');
      const data = await res.json();
      setRankings(data.rankings || []);
      setBadges(data.badges || []);
    } catch {
      toast.error('Error al cargar leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getBadge = (id: string) => badges.find((b) => b.id === id);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" /> Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">Ranking de vendedores por puntos y badges</p>
      </div>

      {/* Podium (top 3) */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {/* 2nd place */}
          <PodiumCard rank={2} ranking={rankings[1]} icon={<Medal className="w-6 h-6 text-gray-400" />} />
          {/* 1st place (center, taller) */}
          <PodiumCard rank={1} ranking={rankings[0]} icon={<Trophy className="w-8 h-8 text-amber-500" />} highlight />
          {/* 3rd place */}
          <PodiumCard rank={3} ranking={rankings[2]} icon={<Award className="w-6 h-6 text-orange-400" />} />
        </div>
      )}

      {/* Full ranking */}
      <Card>
        <CardHeader><CardTitle className="text-base">Ranking completo ({rankings.length})</CardTitle></CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aún no hay puntos asignados. Los vendedores suman puntos al crear contactos y cerrar ventas.
            </p>
          ) : (
            <div className="space-y-2">
              {rankings.map((r, i) => (
                <div key={r.userId} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent/50">
                  <span className="text-xl font-bold w-10 text-center flex-shrink-0">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-hominis-blue to-hominis-violet flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                    {r.avatarUrl ? <img src={r.avatarUrl} alt="" className="w-full h-full object-cover" /> : (r.nombre[0] || '?')}
                  </div>
                  {/* Name + stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{r.nombre} {r.apellido || ''}</span>
                      <UIBadge variant="outline" className="text-[10px]">{r.rol}</UIBadge>
                      <UIBadge variant="secondary" className="text-[10px] gap-0.5"><Star className="w-2.5 h-2.5" />Nivel {r.level}</UIBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.totalContacts} leads · {r.conversions} conv · {r.conversionRate}%
                    </p>
                  </div>
                  {/* Badges */}
                  <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                    {r.badges.slice(0, 5).map((badgeId) => {
                      const b = getBadge(badgeId);
                      return b ? <span key={badgeId} title={b.name} className="text-lg">{b.icon}</span> : null;
                    })}
                    {r.badges.length > 5 && <span className="text-xs text-muted-foreground">+{r.badges.length - 5}</span>}
                  </div>
                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-primary">{r.points}</p>
                    <p className="text-[10px] text-muted-foreground">puntos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All badges */}
      <Card>
        <CardHeader><CardTitle className="text-base">Badges disponibles ({badges.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {badges.map((b) => (
              <div key={b.id} className="border rounded-lg p-3 text-center hover:bg-accent/50">
                <div className="text-3xl mb-1">{b.icon}</div>
                <p className="font-medium text-sm">{b.name}</p>
                <p className="text-xs text-muted-foreground mb-1">{b.description}</p>
                <p className="text-[10px] text-muted-foreground">
                  {b.conditionType} ≥ {b.conditionValue} · +{b.pointsAward} pts
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points system */}
      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Cómo sumar puntos</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <span>🎯 Crear contacto: <strong>+10</strong></span>
              <span>🔥 Lead score ALTA: <strong>+20</strong></span>
              <span>✅ Cerrar venta (ATENDIDO): <strong>+100</strong></span>
              <span>⚡ Respuesta rápida: <strong>+15</strong></span>
              <span>📖 Contactar lead: <strong>+50</strong></span>
              <span>💎 Badge bonus: <strong>+10 a +200</strong></span>
            </div>
            <p className="mt-2">Nivel = puntos ÷ 100 + 1. Cada 100 puntos subís de nivel.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PodiumCard({ rank, ranking, icon, highlight }: { rank: number; ranking: Ranking; icon: React.ReactNode; highlight?: boolean }) {
  return (
    <Card className={highlight ? 'border-amber-300 bg-amber-50/50' : ''}>
      <CardContent className={`flex flex-col items-center text-center p-4 ${highlight ? 'pt-6' : 'pt-4'}`}>
        <div className="mb-2">{icon}</div>
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-hominis-blue to-hominis-violet flex items-center justify-center text-white font-bold mb-2 overflow-hidden ${highlight ? 'w-16 h-16 text-xl' : ''}`}>
          {ranking.avatarUrl ? <img src={ranking.avatarUrl} alt="" className="w-full h-full object-cover" /> : (ranking.nombre[0] || '?')}
        </div>
        <p className="font-semibold text-sm truncate">{ranking.nombre} {ranking.apellido || ''}</p>
        <p className="text-2xl font-bold text-primary mt-1">{ranking.points}</p>
        <p className="text-[10px] text-muted-foreground">puntos · Nivel {ranking.level}</p>
      </CardContent>
    </Card>
  );
}
