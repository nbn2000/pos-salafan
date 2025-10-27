import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/darkmode/darkmode';
import Navbar from '@/components/dashboard/navbar';
import { NavbarSheet } from '@/components/dashboard/NavbarSheet';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { toggleShrink } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';
import { persistor } from '@/store';
import { clearCart } from '@/store/slices/cartSlice';
import { useLazyGetUserDataQuery } from '@/api/auth';
import { useEffect } from 'react';

interface RootLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const RootLayout = ({ children, className }: RootLayoutProps) => {
  const dispatch = useAppDispatch();
  const shrink = useAppSelector((state) => state.ui.shrink);
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((state) => state.auth.token);
  const [userTrigger, { data: userData }] = useLazyGetUserDataQuery();

  useEffect(() => {
    if (token) userTrigger();
  }, [token, userTrigger]);

  const usernameInitial =
    userData?.user.username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 w-full h-screen overflow-hidden">
      <div
        className={cn(
          'grid h-screen w-full grid-layout',
          shrink
            ? 'md:grid-cols-[70px_1fr] lg:grid-cols-[80px_1fr] xl:grid-cols-[80px_1fr]'
            : 'md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]'
        )}
      >
        {/* Sidebar */}
        <div className="hidden md:block h-screen sticky top-0 left-0 z-50">
          <div
            className={cn(
              'flex h-full flex-col gap-2 p-1 md:p-2 sidebar-transition',
              shrink ? 'items-center sidebar-collapsed' : ''
            )}
          >
            {/* Logo and Toggle */}
            <div
              className={cn(
                'flex w-full h-14 items-center rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 px-3 shadow-sm sidebar-transition overflow-hidden',
                shrink ? 'justify-center w-[60px]' : 'justify-between'
              )}
            >
              {!shrink && (
                <Link
                  to="/"
                  className="flex items-center gap-2 font-semibold text-lg sidebar-transition min-w-0"
                >
                  <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                    <img
                      src="/logo.jpg"
                      alt="logo"
                      className="w-10 h-10 object-contain rounded-[30%]"
                    />
                  </div>
                  <span className="max-lg:hidden whitespace-nowrap overflow-hidden text-ellipsis">
                    SALAFAN
                  </span>
                </Link>
              )}
              {shrink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10 flex-shrink-0 sidebar-transition"
                  onClick={() => dispatch(toggleShrink())}
                >
                  <Menu className="h-4 w-4" />
                </Button>
              )}
              {!shrink && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 hover:bg-primary/10 flex-shrink-0 sidebar-transition"
                  onClick={() => dispatch(toggleShrink())}
                >
                  <ArrowRight className="h-3.5 w-3.5 transform sidebar-transition rotate-180" />
                </Button>
              )}
            </div>

            {/* Navigation (stick to top, no space-between) */}
            <div
              className={cn(
                'flex flex-col h-full justify-start rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm overflow-hidden sidebar-transition',
                shrink ? 'w-[60px]' : ''
              )}
            >
              <Navbar shrink={shrink} />
            </div>

            {/* Profile and Mode Toggle */}
            <div
              className={cn(
                'flex rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 shadow-sm sidebar-transition',
                shrink
                  ? 'flex-col items-center justify-center w-[60px] py-2 gap-2'
                  : 'justify-start items-center px-3 py-2 gap-2'
              )}
            >
              {/* Logout button only */}
              {!shrink ? (
                <Button
                  onClick={() => {
                    dispatch(logout());
                    dispatch(clearCart());
                    localStorage.removeItem('selectedProducts');
                    persistor.purge();
                    navigate('/login');
                  }}
                  variant="ghost"
                  className="flex items-center gap-3 hover:bg-destructive/10 hover:text-destructive text-muted-foreground px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-semibold text-primary border border-primary/20 shadow-sm">
                    {usernameInitial}
                  </div>
                  <span className="text-sm font-medium">Chiqish</span>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    dispatch(logout());
                    dispatch(clearCart());
                    localStorage.removeItem('selectedProducts');
                    persistor.purge();
                    navigate('/login');
                  }}
                  variant="ghost"
                  size="icon"
                  title="Chiqish"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0 sidebar-transition rounded-lg transition-all duration-200"
                >
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-semibold text-primary border border-primary/20 shadow-sm">
                    {usernameInitial}
                  </div>
                </Button>
              )}

              <ModeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col w-full min-w-0 h-screen">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-3  bg-background/80 backdrop-blur-sm border-b border-border/50">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-9 w-9 hover:bg-primary/10 rounded-lg"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <NavbarSheet />
              </Sheet>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-primary/10">
                  <img
                    src="/logo.jpg"
                    alt="logo"
                    className="w-8 h-8 object-contain rounded-[30%]"
                  />
                </div>
                <span className="font-semibold text-lg">MO'JIZA TOYS</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModeToggle />
            </div>
          </div>

          {/* Main Area */}
          <main className="flex flex-1 flex-col w-full p-2 overflow-hidden min-h-0">
            <div
              className={cn(
                'flex flex-1 w-full h-full overflow-hidden min-h-0 rounded-lg',
                className
              )}
              x-chunk="dashboard-02-chunk-1"
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
