import { BentoGridHome } from '@/components/bento/bentodemo';
import ErrorBoundary from '@/components/toaster/toaster';
import RootLayout from '@/layout';
import { UniversalPage } from '@/components/common/UniversalPage';
import { Home } from 'lucide-react';

const page = () => {
  return (
    <RootLayout>
      <UniversalPage
        header={{
          title: 'Bosh sahifa',
          description: 'Tizim ko\'rsatkichlari va tezkor ma\'lumotlar',
          icon: <Home />,
        }}
        showBreadcrumb
      >
        <ErrorBoundary>
          <BentoGridHome />
        </ErrorBoundary>
      </UniversalPage>
    </RootLayout>
  );
};

export default page;
