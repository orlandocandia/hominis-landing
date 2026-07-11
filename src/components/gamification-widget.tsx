'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Zap } from 'lucide-react';

interface Progress {
  points: number;
  level: number;
  badges: string[];
  nextLevelPoints: number;
  progressToNextLevel: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  conditionType: string;
  conditionValue: number;
  pointsAward: number;
}

export function GamificationWidget() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/gamification/progress').then(r => r.json()),
      fetch('/api/gamification/badges').then(r => r.json()),
    ]).then(([p, b]) => {
      setProgress(p);
      setBadges(b.badges || []);
    }).catch(() => {});
  }, []);

  if (!progress) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Mi progreso
          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
            <Star className="w-3 h-3" /> Nivel {progress.level}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Points + progress bar */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span className="font-bold text-foreground">{progress.points} pts</span>
            <span>{progress.nextLevelPoints} pts</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-hominis-blue to-hominis-violet rounded-full transition-all duration-500"
              style={{ width: `${progress.progressToNextLevel}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-center">
            {progress.nextLevelPoints - progress.points} pts para nivel {progress.level + 1}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge) => {
            const unlocked = progress.badges.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`p-1.5 rounded-lg text-center transition-all ${unlocked ? 'bg-amber-50 border border-amber-200' : 'bg-muted/50 border border-border opacity-40 grayscale'}`}
                title={`${badge.name}: ${badge.description}`}
              >
                <div className="text-xl">{badge.icon}</div>
                <div className="text-[8px] mt-0.5 leading-tight">{badge.name}</div>
              </div>
            );
          })}
        </div>

        {/* Points system hint */}
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-1 border-t">
          <Zap className="w-3 h-3" />
          Ganá puntos creando contactos, agendando reuniones y cerrando ventas
        </div>
      </CardContent>
    </Card>
  );
}
