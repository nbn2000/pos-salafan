import TablePartner from '@/components/tablepartners/table';
import ErrorBoundary from '@/components/toaster/toaster';
import RootLayout from '@/layout';

const page = () => {
  return (
    <RootLayout>
      <div className="w-full h-full min-h-0 flex flex-col ">
        <div className=" w-full h-full flex flex-col">
          <ErrorBoundary>
            <TablePartner />
          </ErrorBoundary>
        </div>
      </div>
    </RootLayout>
  );
};

export default page;
