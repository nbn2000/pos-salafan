import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SCROLLBAR_ITEMS } from '@/constant/chartList';
import { useLocation, Link } from 'react-router-dom';
import { LineChart } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ScrollAreaDemo({ shrink }: { shrink?: boolean }) {
  const location = useLocation();
  const [isScrollAreaVisible, setScrollAreaVisible] = React.useState(false);

  const toggleScrollAreaVisibility = () => {
    setScrollAreaVisible(!isScrollAreaVisible);
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={toggleScrollAreaVisibility}
        className={cn(
          'w-full mt-3 flex items-center gap-2 sidebar-item',
          shrink ? 'justify-center px-2' : 'justify-center'
        )}
        title={
          shrink
            ? isScrollAreaVisible
              ? 'Hide Charts Menu'
              : 'Show Charts Menu'
            : undefined
        }
      >
        <LineChart
          className={cn('sidebar-item', shrink ? 'h-5 w-5' : 'h-4 w-4')}
        />
        {!shrink && (
          <span key={'chart hide and show'}>
            {isScrollAreaVisible ? 'Hide Charts Menu' : 'Show Charts Menu'}
          </span>
        )}
      </Button>
      {isScrollAreaVisible && (
        <ScrollArea className="h-auto rounded-md border mt-4 bg-white dark:bg-chartbody">
          <div className={cn('sidebar-item', shrink ? 'p-2' : 'p-4')}>
            {SCROLLBAR_ITEMS.map((item) => (
              <React.Fragment key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-4 rounded-xl px-3 py-2 hover:text-primary relative group sidebar-item',
                    shrink && 'justify-center px-2',
                    location.pathname === item.path
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title={shrink ? item.title : undefined}
                >
                  <div
                    className={cn(
                      'sidebar-item',
                      shrink ? 'w-5 h-5' : 'w-4 h-4'
                    )}
                  >
                    {item.icon}
                  </div>
                  {!shrink && <span>{item.title}</span>}
                  {/* Tooltip for collapsed state */}
                  {shrink && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-background border border-border rounded-md text-xs opacity-0 group-hover:opacity-100 sidebar-tooltip pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </Link>
                <Separator className="my-2" />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
