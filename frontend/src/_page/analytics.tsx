import React from 'react';
import RootLayout from '@/layout';
import { AnalyticsDashboard } from '@/components/analytics';
import ErrorBoundary from '@/components/toaster/toaster';

const Page = () => {
  return (
    <RootLayout>
      <div className="w-full min-h-screen overflow-y-auto">
        <ErrorBoundary>
          <AnalyticsDashboard />
        </ErrorBoundary>
      </div>
    </RootLayout>
  );
};

export default Page;
