import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Detail from './components/detail';
import { Button } from '@/components/ui/button';
import { ReceiptText, Sheet, Plus, Trash2 } from 'lucide-react';
import { DialogAdd } from './components/dialogAdd';
import axios from 'axios';
import { TransactionData } from '@/types/transaction';
import eventBus from '@/lib/even';
import { ReloadIcon } from '@radix-ui/react-icons';
import { AlertDialogDeletetransaction } from './components/dialogDelete';
import { toast } from 'react-toastify';
import { UniversalPage } from '../common/UniversalPage';
import { UniversalContent } from '../common/UniversalContent';

export function Orders() {
  const [dialogAddOpen, setDialogAddOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [showTable, setShowTable] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedTransactionId = localStorage.getItem('transactionId');
    if (typeof window !== 'undefined' && storedTransactionId) {
      setTransactionId(storedTransactionId);
    }
  }, []);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        if (!transactionId) {
          setTransactionData([]);
          return;
        }

        const isOnline = navigator.onLine;
        if (!isOnline) {
          toast.error(
            'You are offline. Please check your internet connection.'
          );
          return;
        }

        const response = await axios.get(`/api/transactions/${transactionId}`);
        if (response.status === 200) {
          const data = response.data;
          setTransactionData(Array.isArray(data) ? data : [data]);
        } else {
          console.error('Failed to fetch transaction data');
        }
      } catch (error: any) {
        if (error.response?.status === 405) {
          localStorage.removeItem('transactionId');
          setTransactionId(null);
          toast.warn('Transaction not found in the database.');
        } else if (error.response?.status === 404) {
          setTransactionData([]);
        } else {
          toast.error(
            'An error occurred while fetching transaction data: ' + error
          );
        }
      }
    };

    fetchTransactionData();

    const handleEventBusEvent = () => {
      fetchTransactionData();
    };

    const handleEventBusEventClear = () => {
      setTransactionData([]);
    };

    eventBus.on('fetchTransactionData', handleEventBusEvent);
    eventBus.on('clearTransactionData', handleEventBusEventClear);

    return () => {
      eventBus.off('fetchTransactionData', handleEventBusEvent);
      eventBus.off('clearTransactionData', handleEventBusEventClear);
    };
  }, [transactionId]);

  const createTransaction = async () => {
    // Create new transaction if transactionId is not set
    if (!transactionId) {
      setLoading(true);
      try {
        // Check if the user is online
        const isOnline = navigator.onLine;

        if (!isOnline) {
          toast.error(
            'You are offline. Please check your internet connection.'
          );
          return;
        }

        const response = await axios.post('/api/transactions');
        if (response.status === 201) {
          const { id } = response.data;
          localStorage.setItem('transactionId', id);
          setTransactionId(id);
          setLoading(false);
        } else {
          toast.error('Failed to create transaction');
          setLoading(false);
          return;
        }
      } catch (error) {
        toast.error('An error occurred:' + error);
        setLoading(false);
        return;
      }
    }

    setDialogAddOpen(true);
  };

  const handleDialogAddOpen = () => {
    createTransaction();
  };

  const handleDialogDeleteOpen = () => {
    setDialogDeleteOpen(true);
  };

  const handleDialogAddClose = () => {
    setDialogAddOpen(false);
  };

  const handleDialogDeleteClose = async () => {
    setDialogDeleteOpen(false);
  };

  // Simple table implementation to replace the deleted components
  const TransactionTable = ({ data }: { data: TransactionData[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Mahsulot ID</TableHead>
          <TableHead>Miqdor</TableHead>
          <TableHead>Sotuv narxi</TableHead>
          <TableHead>Mahsulot nomi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-6">
              <div className="text-muted-foreground">
                Hech qanday tranzaksiya topilmadi
              </div>
            </TableCell>
          </TableRow>
        ) : (
          data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.id || '-'}</TableCell>
              <TableCell>{item.productId || '-'}</TableCell>
              <TableCell>{item.quantity || '-'}</TableCell>
              <TableCell>{item.product?.sellprice || '-'}</TableCell>
              <TableCell>{item.product?.productstock?.name || '-'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  // Custom actions for the header
  const CustomActions = () => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowTable(!showTable)}
        className="h-8 w-8"
      >
        {showTable ? (
          <ReceiptText className="h-4 w-4" />
        ) : (
          <Sheet className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        disabled={loading}
        onClick={handleDialogAddOpen}
        className="h-8 w-8"
      >
        {loading ? (
          <ReloadIcon className="animate-spin h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDialogDeleteOpen}
        disabled={!transactionId}
        className="h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <UniversalPage
      header={{
        title: 'Buyurtmalar',
        description:
          transactionId ||
          "Yangi buyurtma yaratish uchun qo'shish tugmasini bosing",
        icon: <ReceiptText className="w-5 h-5 text-primary" />,
        actions: <CustomActions />,
        showFullscreen: true,
      }}
      filters={{
        showFilter: false,
        onShowFilterChange: () => {},
      }}
      showBreadcrumb={true}
    >
      <UniversalContent
        isLoading={false}
        data={transactionData}
        showPagination={false}
      >
        {showTable ? (
          <TransactionTable data={transactionData} />
        ) : (
          <Detail
            data={transactionData}
            transactionId={transactionId}
            setTransactionId={setTransactionId}
          />
        )}
        <DialogAdd
          open={dialogAddOpen}
          onClose={handleDialogAddClose}
          transactionId={transactionId}
        />
        <AlertDialogDeletetransaction
          open={dialogDeleteOpen}
          onClose={handleDialogDeleteClose}
          transactionId={transactionId}
          setTransactionId={setTransactionId}
        />
      </UniversalContent>
    </UniversalPage>
  );
}
