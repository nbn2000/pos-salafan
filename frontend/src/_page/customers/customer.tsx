import TableCustomer from '@/components/tablecustomers/table';
import RootLayout from '@/layout';

const page = () => {
  return (
    <RootLayout>
      <div className="w-full h-full min-h-0 flex flex-col ">
        <div className=" w-full h-full flex flex-col">
          <TableCustomer />
        </div>
      </div>
    </RootLayout>
  );
};

export default page;
