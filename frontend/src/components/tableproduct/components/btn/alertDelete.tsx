import { useState } from 'react';
import { toast } from 'react-toastify';
import { ReloadIcon } from '@radix-ui/react-icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteProductMutation } from '@/api/products';

type Data = {
  id: string | undefined;
  name: string;
};

export function DeleteAlertDialog({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: Data;
}) {
  const [loading, setLoading] = useState(false);
  const [deleteProduct] = useDeleteProductMutation();

  const handleCancel = (e: any) => {
    e.stopPropagation();
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);

    const isOnline = navigator.onLine;

    if (!isOnline) {
      toast.error('siz oflayn. Iltimos, internet ulanishingizni tekshiring.');
      setLoading(false);
      return;
    }

    try {
      if (!data?.id) {
        toast.error("Mahsulot ID noto'g'ri.");
        return;
      }

      await deleteProduct(data.id).unwrap();

      toast.success(`${data.name} muvaffaqiyatli o'chirildi.`);
      onClose();
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Mahsulotni o'chirishda xatolik yuz berdi.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className="text-red-500">{data.name}</span>ni o'chirishga
            tayyormisiz?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Haqiqatda o'chirishga rozimisiz
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Bekor qilish
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="text-gray-100"
          >
            {loading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                kutib turing...
              </>
            ) : (
              "O'chirish"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
