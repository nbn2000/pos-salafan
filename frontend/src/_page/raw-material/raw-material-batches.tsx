import TableRawMaterialsBatches from '@/components/tablerawmaterials/table-batches';
import ErrorBoundary from '@/components/toaster/toaster';
import RootLayout from '@/layout';

const RawMaterialBatches = () => {
  return (
    <RootLayout>
      <ErrorBoundary>
        <TableRawMaterialsBatches />
      </ErrorBoundary>
    </RootLayout>
  );
};

export default RawMaterialBatches;
