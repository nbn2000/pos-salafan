import TablePartner from '@/components/tablepartners/table';
import ErrorBoundary from '@/components/toaster/toaster';
import RootLayout from '@/layout';
import { UniversalPage } from '@/components/common/UniversalPage';
import { Users } from 'lucide-react';

const page = () => {
  return (
    <RootLayout>
      <UniversalPage
        header={{
          title: 'Hamkorlar',
          description: 'Biznes hamkorlari va yetkazib beruvchilar',
          icon: <Users />,
        }}
        showBreadcrumb
      >
        <ErrorBoundary>
          <TablePartner />
        </ErrorBoundary>
      </UniversalPage>
    </RootLayout>
  );
};

export default page;
