import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { Input } from '@/components/hook-form/input';
import { Phone } from '@/components/hook-form/phone';
import { updateSchema } from '@/schema';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IUserUpdate } from '@/api/auth/type';
import { useUpdateUserMutation } from '@/api/auth';
import {
  User,
  Save,
  Loader2,
  Phone as PhoneIcon,
  Calendar,
  Shield,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function UpdateProfile({
  username,
  date_joined,
  user_role,
}: {
  username: string;
  date_joined?: string;
  user_role?: string;
}) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();

  type FormValues = {
    username: string;
    full_name: string;
    phone_number: string;
  };

  const methods = useForm<FormValues>({
    defaultValues: {
      username: '',
      full_name: '',
      phone_number: '',
    },
    resolver: zodResolver(updateSchema),
  });
  const { handleSubmit, reset, watch } = methods;
  const watchedValues = watch();

  useEffect(() => {
    reset({
      username,
    });
  }, [username, reset]);

  const handleSave: SubmitHandler<FormValues> = async (values) => {
    // Telefon raqamni to'g'ri formatga o'tkazish
    const updatedValues: IUserUpdate = { username: values.username };

    if (username === values.username) {
      toast.info("O'zgarishlar kiritilmadi");
      return;
    }

    try {
      await updateUser(updatedValues)
        .unwrap()
        .then((res) => {
          if (res) {
            toast.success('Profil muvaffaqiyatli yangilandi!');
          }
        });
    } catch (error: any) {
      console.log('error update profile:', error);

      // Backend error formatini tekshirish
      if (error?.data?.error) {
        const errorMessage = error.data.error;

        toast.error(errorMessage);
      } else {
        toast.error('Qandaydir hatolik yuz berdi, yana urinib koring');
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-muted-foreground">@{username}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">
              {user_role === 'Admin' ? 'Administrator' : 'Sotuvchi'}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Account Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Hisob ma'lumotlari
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">
                Ro'yxatdan o'tgan sana
              </p>
              <p className="text-sm font-medium">{formatDate(date_joined)}</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Edit Profile Form */}
      <div className="space-y-4">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="username"
                title="Foydalanuvchi nomi"
                placeholder="Johny123"
              />
              <Input
                name="full_name"
                title="To'liq ism"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Phone
                name="phone_number"
                title="Telefon raqam"
                placeholder="90 123 45 67"
              />
            </div>

            <Separator />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yangilanmoqda...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  O'zgarishlarni saqlash
                </>
              )}
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
