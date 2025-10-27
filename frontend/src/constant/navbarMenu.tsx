import { NavItem } from '@/types/Navbar';
import {
  Archive,
  Boxes,
  Handshake,
  Home,
  Package,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
// for commit
export const NAVBAR_ITEMS: NavItem[] = [
  {
    title: 'Asosiy',
    path: '/',
    icon: <Home className="h-4 w-4" />,
  },

  {
    title: 'Sotuv',
    path: '/sale',
    icon: <Store className="h-4 w-4" />,
  },
  {
    title: 'Homashyolar',
    path: '/raw-materials',
    icon: <Boxes className="h-4 w-4" />,
  },

  {
    title: 'Mahsulotlar',
    path: '/products',
    icon: <Package className="h-4 w-4" />,
  },
  {
    title: 'Sotilgan Mahsulotlar',
    path: '/records',
    icon: <Archive className="h-4 w-4" />,
  },
  {
    title: 'Hamkorlar',
    path: '/partners',
    icon: <Handshake className="h-4 w-4" />,
  },
  {
    title: 'Mijozlar',
    path: '/customers',
    icon: <Users className="h-4 w-4" />,
  },
];

/**
 * Filter navigation items based on user role
 * @param userRole - User's role ('Admin' | 'Merchant')
 * @returns Filtered navigation items
 */
export const getFilteredNavItems = (
  userRole?: 'Admin' | 'Merchant'
): NavItem[] => {
  if (!userRole) return NAVBAR_ITEMS;

  return NAVBAR_ITEMS.filter((item) => {
    // If item requires admin access, only show for Admin users
    if (item.requiresAdmin && userRole !== 'Admin') {
      return false;
    }
    return true;
  });
};
