import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { buildBreadcrumbItems } from '@/lib/utils';

function Bread() {
  const location = useLocation();

  // useMemo bilan breadcrumb elementlarini hisoblash
  const breadcrumbItems = useMemo(
    () => buildBreadcrumbItems(location.pathname),
    [location.pathname]
  );

  // Render breadcrumb items
  const renderedBreadcrumbItems = breadcrumbItems.map((item, index) => (
    <React.Fragment key={item.path}>
      <BreadcrumbItem>
        {item.isLast ? (
          <BreadcrumbPage className="text-primary font-medium">
            {item.name}
          </BreadcrumbPage>
        ) : (
          <BreadcrumbLink asChild>
            <Link
              to={item.path}
              className="text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {item.name}
            </Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
      {index < breadcrumbItems.length - 1 && (
        <BreadcrumbSeparator className="text-muted-foreground/50" />
      )}
    </React.Fragment>
  ));

  return (
    <div className="w-full flex-1">
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList className="flex items-center gap-2 text-sm">
          {renderedBreadcrumbItems.length > 0 ? (
            renderedBreadcrumbItems
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage className="text-primary font-medium">
                Asosiy
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default Bread;
