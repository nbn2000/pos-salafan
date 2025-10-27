import { useDeleteProductBatchMutation } from '@/api/products/product-batch';
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
import { ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { toast } from 'react-toastify';

export function DeleteAlertDialog({
  open,
  onClose,
  id,
}: {
  open: boolean;
  onClose: () => void;
  id: string;
}) {
  const [loading, setLoading] = useState(false);
  const [deleteProductBatch] = useDeleteProductBatchMutation();

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
      if (!id) {
        toast.error("Mahsulot ID noto'g'ri.");
        return;
      }

      await deleteProductBatch(id).unwrap();

      toast.success(`Partiya o'chirildi.`);
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
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Partiya ni o'chirishga rozimisiz?</AlertDialogTitle>
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
                Kuting...
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
