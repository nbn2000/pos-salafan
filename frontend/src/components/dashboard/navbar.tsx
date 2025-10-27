import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getFilteredNavItems } from '@/constant/navbarMenu';
import { cn } from '@/lib/utils';
import { useLazyGetUserDataQuery } from '@/api/auth';
import { useAppSelector } from '@/store/hooks';

function Navbar({ shrink }: { shrink: boolean }) {
  const location = useLocation();
  const pathname = location.pathname;
  const token = useAppSelector((state) => state.auth.token);
  const [userTrigger, { data: userData }] = useLazyGetUserDataQuery();

  useEffect(() => {
    if (token) {
      userTrigger();
    }
  }, [token, userTrigger]);

  // Get filtered navigation items based on user role
  const filteredNavItems = getFilteredNavItems(
    userData?.user.role as 'Admin' | 'Merchant' | undefined
  );

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden p-2 min-h-0">
      <nav
        className={cn(
          shrink
            ? 'flex flex-col items-center gap-1 justify-start'
            : 'flex flex-col items-start gap-1 justify-start',
          'text-sm font-medium flex-1 overflow-y-auto pr-1 min-h-0'
        )}
      >

        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 sidebar-item hover:bg-primary/10 hover:text-primary group relative',
              shrink && 'justify-center px-2 w-full max-w-[60px]',
              pathname === item.path
                ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={shrink ? item.title : undefined}
          >
            <div
              className={cn(
                'flex items-center justify-center sidebar-item',
                shrink ? 'w-6 h-6' : 'w-5 h-5',
                pathname === item.path
                  ? 'text-primary'
                  : 'text-muted-foreground group-hover:text-primary'
              )}
            >
              {item.icon}
            </div>
            {!shrink && (
              <span
                className={`font-medium sidebar-item ${
                  pathname === item.path
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-primary'
                }`}
              >
                {item.title}
              </span>
            )}
            {/* Tooltip for collapsed state */}
            {shrink && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-background border border-border rounded-md text-xs opacity-0 group-hover:opacity-100 sidebar-tooltip pointer-events-none whitespace-nowrap z-50">
                {item.title}
              </div>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default Navbar;
