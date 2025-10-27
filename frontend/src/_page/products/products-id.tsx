import TableProductId from '@/components/table-product-id/table';
import ErrorBoundary from '@/components/toaster/toaster';
import RootLayout from '@/layout';

const ProductId = () => {
  return (
    <RootLayout>
      <ErrorBoundary>
        <TableProductId />
      </ErrorBoundary>
    </RootLayout>
  );
};

export default ProductId;
