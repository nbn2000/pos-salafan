import { cn } from '@/lib/utils';

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  header,
}: {
  className?: string;
  header?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        'group/bento hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/40 transition-all duration-300 ease-out shadow-sm dark:shadow-none bg-white/60 dark:bg-slate-900/30 border border-slate-100/80 dark:border-slate-700/30 rounded-2xl flex flex-col backdrop-blur-sm',
        className
      )}
    >
      {/* Header section */}
      <div className="flex-1 mb-3 p-1">{header}</div>

      {/* Content section with icon and text */}
      <div className="transition duration-200 space-y-2"></div>
    </div>
  );
};
