import { UniversalSale } from '@/components/sale/UniversalSale';
import ErrorBoundary from '@/components/toaster/toaster';
import RootLayout from '@/layout';
import { UniversalPage } from '@/components/common/UniversalPage';
import { ShoppingCart } from 'lucide-react';

const page = () => {
  return (
    <RootLayout className="border-none">
      <ErrorBoundary>
        <UniversalSale />
      </ErrorBoundary>
    </RootLayout>
  );
};

export default page;
