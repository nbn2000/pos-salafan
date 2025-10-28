import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollAreaDemo } from '../scrollarea/scrollarea';
import { SheetContent } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/darkmode/darkmode';
import { getFilteredNavItems } from '@/constant/navbarMenu';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { clearCart } from '@/store/slices/cartSlice';
import { persistor } from '@/store';
import { useUserData } from '@/hooks/useUserData';

export function NavbarSheet() {
  const location = useLocation();
  const pathname = location.pathname;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { userData } = useUserData();

  // Get filtered navigation items based on user role
  const filteredNavItems = getFilteredNavItems(
    userData?.user.role as 'Admin' | 'Merchant' | undefined
  );

  return (
    <SheetContent
      side="left"
      className="flex flex-col bg-background/95 backdrop-blur-sm"
    >
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-4 p-4 flex-1">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-3 text-lg font-semibold p-4 rounded-xl bg-background/80 border border-border/50"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <img src="/logo.jpg" alt="" />
            </div>
            MUJIZA TOYS
          </Link>


          {/* Navigation Items */}
          <div className="space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all hover:bg-primary/10 hover:text-primary group ${
                  pathname === item.path
                    ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 ${pathname === item.path ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}
                >
                  {item.icon}
                </div>
                <span
                  className={`font-medium ${pathname === item.path ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}
                >
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
          {/* <ScrollAreaDemo /> */}
        </div>

        {/* Logout and Mode Toggle */}
        <div className="border-t border-border/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <ModeToggle />
            <Button
              onClick={() => {
                dispatch(logout());
                dispatch(clearCart());
                persistor.purge();
                navigate('/login');
              }}
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Chiqish
            </Button>
          </div>
        </div>
      </div>
    </SheetContent>
  );
}
