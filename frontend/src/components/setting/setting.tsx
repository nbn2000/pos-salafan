import { useUserData } from '@/hooks/useUserData';
import UpdateProfile from '@/components/setting/components/UpdateProfile';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSelector } from '@/store/hooks';
import { DollarSign, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Profile() {
  const { userData: data, isLoading } = useUserData();
  const [activeTab, setActiveTab] = useState('profile');

  if (isLoading || !data) {
    return (
      <div className="flex flex-col justify-center items-center h-80 space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-primary/30"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Profil yuklanmoqda...
          </p>
          <p className="text-sm text-muted-foreground/70">Iltimos kuting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col gap-4 md:gap-6 bg-background/80 backdrop-blur-sm p-3 md:p-6 lg:gap-8 lg:p-10 min-h-0 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Sozlamalar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      Profil ma'lumotlari
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Shaxsiy ma'lumotlaringizni yangilang
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <UpdateProfile
                  username={data?.user.username!}
                  user_role={data?.user.role}
                  date_joined={data?.user.createdAt!}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      Hozircha malumotlar mavjud emas
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Bu yerda hech qanday malumotlar mavjud emas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
