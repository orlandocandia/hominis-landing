'use client';

import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { PhoneManager } from '@/components/ui/PhoneManager';
import { EmailManager } from '@/components/ui/EmailManager';
import { SocialNetworkManager } from '@/components/ui/SocialNetworkManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileContentProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
  };
}

export function ProfileContent({ user }: ProfileContentProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <AvatarUpload initialUrl={user.avatarUrl} userName={user.name} />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Rol: {user.role}</p>
        </div>
      </div>

      {/* Tabs con los managers */}
      <Tabs defaultValue="phones" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="phones">Teléfonos</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="social">Redes</TabsTrigger>
        </TabsList>
        <TabsContent value="phones">
          <Card>
            <CardContent className="pt-6"><PhoneManager /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="emails">
          <Card>
            <CardContent className="pt-6"><EmailManager /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="social">
          <Card>
            <CardContent className="pt-6"><SocialNetworkManager /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
