import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SearchInput } from '@/components/search/search';

import { UniversalFilters, UniversalFiltersProps } from './UniversalFilters';
import FullscreenButton from '../fullscreen/fullscreen';
import Bread from '../dashboard/breadcrumb';

export interface UniversalPageHeaderProps {
  header: {
    title: string;
    description: string;
    icon: React.ReactNode;
    search?: {
      value: string;
      placeholder?: string;
    };
    actions?: React.ReactNode;
    showFullscreen?: boolean;
    additionalControls?: React.ReactNode;
  };
  filters?: UniversalFiltersProps['filters'];
  pageRef: React.RefObject<HTMLDivElement>;
  showBreadcrumb?: boolean;
}

export const UniversalPageHeader: React.FC<UniversalPageHeaderProps> = ({
  header,
  filters,
  pageRef,
  showBreadcrumb = false,
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50 py-3 md:py-6">
      <div className="flex flex-col gap-3 md:gap-6">
        {/* Breadcrumb section */}
        {showBreadcrumb && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <Bread />
          </div>
        )}

        {/* Title section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {header.icon}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg md:text-xl font-bold truncate">
                {header.title}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-muted-foreground line-clamp-1 md:line-clamp-2">
                {header.description}
              </CardDescription>
            </div>
          </div>
          {header.actions && (
            <div className="flex gap-2 md:gap-3">
              {header.actions}
              {header.showFullscreen && (
                <FullscreenButton targetRef={pageRef} />
              )}
            </div>
          )}
        </div>

        {/* Search va Filter section - yonma-yon */}
        <div className="flex items-center gap-2">
          {header.search && (
            <div className="flex-1">
              <SearchInput
                search={header.search.value}
                placeholder={header.search.placeholder}
              />
            </div>
          )}
          {header.additionalControls && (
            <div className="flex-shrink-0">
              {header.additionalControls}
            </div>
          )}
          {filters?.showFilterIcon && (
            <div className="flex-shrink-0">
              <UniversalFilters filters={filters} isMobileCompact={true} />
            </div>
          )}
        </div>

        {/* Full Filter Content - faqat ochilganda */}
        {filters?.showFilter && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <UniversalFilters filters={filters} />
          </div>
        )}
      </div>
    </CardHeader>
  );
};
