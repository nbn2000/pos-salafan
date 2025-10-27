import { Button } from '@/components/ui/button';
import { Input } from '@/components/hook-form/input';
import { TypewriterEffect } from '@/components/ui/type-writer';
import { useNavigate } from 'react-router-dom';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useRegisterMutation } from '@/api/auth';
import { registerSchema } from '@/schema';
import { Phone } from '@/components/hook-form/phone';
import { IRegisterPost } from '@/api/auth/type';

export default function Home() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();
  const methods = useForm({
    defaultValues: {
      username: '',
      password: '',
      phone_number: '',
      full_name: '',
    },
    resolver: zodResolver(registerSchema),
  });
  const { handleSubmit } = methods;

  const onSubmitRegister = async (values: IRegisterPost) => {
    try {
      await register({
        ...values,
      })
        .unwrap()
        .then(() => {
          toast.success(`Hush kelibsiz ${values.username}`);
          navigate('/');
        })
        .catch((err: any) => {
          toast.error(err.message);
        });
    } catch (error) {
      console.log('error register:', error);
      toast.error('Qandaydir hatolik yuz berdi yana urinib koring');
    }
  };

  const words = [
    { text: 'Biznesingizni' },
    { text: 'eng' },
    { text: 'yaxshi' },
    { text: 'yechim' },
    { text: 'bilan' },
    {
      text: 'Optimallashtirish .',
      className: 'text-blue-500 dark:text-blue-500',
    },
  ];

  return (
    <main>
      <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-800 relative flex items-center justify-center p-4">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-purple-900/60 bg-gradient-to-br from-white/60 to-blue-50/80 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="flex flex-col items-center justify-center min-h-[90vh] w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              SALAFAN
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-6">
              POS tizimiga ro'yxatdan o'ting!
            </p>
          </div>
          <div className="hidden sm:block mb-8">
            <TypewriterEffect words={words} />
          </div>
          <div className="w-full">
            <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
              <FormProvider {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmitRegister)}
                  className="space-y-6"
                >
                  <Input
                    name="username"
                    title="Foydalanuvchi nomi"
                    placeholder="Johny123"
                  />
                  <Input
                    name="full_name"
                    title="To'liq Isminigiz"
                    placeholder="John Doe"
                  />
                  <Phone
                    name="phone_number"
                    title="Telefon Raqam"
                    placeholder="+998 (12) 312 33 33"
                    className=""
                  />
                  <Input
                    name="password"
                    type="password"
                    title="Parol"
                    placeholder="********"
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Kuting...
                      </div>
                    ) : (
                      "Ro'yxatdan o'tish"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl text-sm font-medium border-2 hover:bg-primary/5"
                    onClick={() => navigate('/login')}
                  >
                    Kirish
                  </Button>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
