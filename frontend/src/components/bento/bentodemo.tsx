/* eslint-disable react/no-unescaped-entities */
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { BentoGrid, BentoGridItem } from '../ui/bento-grid';

import { useLazyGetUserDataQuery } from '@/api/auth';
import { useAppSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { StockStatusCard } from '../card/analytic';
import { KPIDashboard } from '../dashboard/KPIDashboard';

export function BentoGridHome() {
  const token = useAppSelector((state) => state.auth.token);
  const [userTrigger, { data: userData }] = useLazyGetUserDataQuery();

  useEffect(() => {
    if (token) {
      userTrigger();
    }
  }, [token, userTrigger]);

  // Filter items based on user role
  const filteredItems = items.filter((item, index) => {
    // If user is not admin, hide admin-only components
    if (userData?.user.role !== 'ADMIN') {
      // Hide these components for non-admin users (by index)
      const adminOnlyIndices = [2, 1, 3, 5]; // Qarzdorlik, Bugungi Natijalar, Jamoa, Savdogar Qarzi
      return !adminOnlyIndices.includes(index);
    }
    return true;
  });

  return (
    <motion.div
      className="w-full p-3 sm:p-4 md:p-6 lg:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <BentoGrid className="w-full mx-auto mb-20">
        {filteredItems.map((item, i) => (
          <BentoGridItem
            header={item.header}
            key={i}
            className={cn(
              item.className,
              // Responsive padding and sizing
              'p-3 sm:p-4 md:p-5',
              'min-h-[12rem] sm:min-h-[14rem] md:min-h-[16rem]'
            )}
          />
        ))}
      </BentoGrid>
    </motion.div>
  );
}

const items = [
  {
    header: <KPIDashboard />,
    className: 'col-span-1 sm:col-span-2 lg:col-span-4',
  },
];
