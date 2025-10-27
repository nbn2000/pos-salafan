import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

import { useLocation, useNavigate } from 'react-router-dom';
import { generatePagination } from '@/lib/utils';

interface PaginationDemoProps {
  totalPages: number;
}

export function PaginationDemo({ totalPages }: PaginationDemoProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: string | number) => {
    searchParams.set('page', pageNumber.toString());
    return `${location.pathname}?${searchParams.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem hidden={currentPage === 1}>
          <PaginationPrevious
            onClick={() =>
              currentPage !== 1 && navigate(createPageURL(currentPage - 1))
            }
            hidden={currentPage === 1}
            className="cursor-pointer"
          />
        </PaginationItem>
        {allPages.map((page, index) => (
          <PaginationItem key={index}>
            {typeof page === 'number' ? (
              <PaginationLink
                onClick={() => navigate(createPageURL(page))}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            ) : (
              <PaginationEllipsis>{page}</PaginationEllipsis>
            )}
          </PaginationItem>
        ))}
        <PaginationItem hidden={currentPage === totalPages}>
          <PaginationNext
            onClick={() =>
              currentPage !== totalPages &&
              navigate(createPageURL(currentPage + 1))
            }
            hidden={currentPage === totalPages}
            className="cursor-pointer"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
