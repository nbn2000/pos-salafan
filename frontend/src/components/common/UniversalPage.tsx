import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchInput } from '../search/search';
import FullscreenButton from '../fullscreen/fullscreen';
import {
  UniversalPageHeader,
  UniversalPageHeaderProps,
} from './UniversalPageHeader';

interface UniversalPageProps
  extends Omit<UniversalPageHeaderProps, 'pageRef' | 'filters'> {
  children: React.ReactNode;
  filters?: UniversalPageHeaderProps['filters'];
  showBreadcrumb?: boolean;
}

export function UniversalPage({
  children,
  filters,
  header,
  showBreadcrumb = false,
}: UniversalPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={pageRef} className="h-full w-full flex flex-col rounded-lg">
      <Card className="h-full w-full flex flex-col bg-background/80 backdrop-blur-sm border  border-border/50 shadow-lg">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <UniversalPageHeader
            header={header}
            filters={filters}
            pageRef={pageRef}
            showBreadcrumb={showBreadcrumb}
          />
        </div>

        {/* Scrollable Content */}
        <CardContent className="flex-1 p-3 md:p-4 overflow-y-auto min-h-0 rounded-lg ">
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
