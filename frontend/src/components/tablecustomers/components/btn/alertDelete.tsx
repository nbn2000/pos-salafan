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

import { useDeleteClientMutation } from '@/api/clients';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { AlertTriangle, Trash2, Users } from 'lucide-react';

type Data = {
  id: string;
  name: string;
};
type BackendErrorResponse = {
  error?: string;
};

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

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
  const [deleteCustomer] = useDeleteClientMutation();

  const handleCancel = () => {
    onClose();
  };
  const handleDelete = async () => {
    setLoading(true);

    const isOnline = navigator.onLine;

    if (!isOnline) {
      toast.error('Siz oflayn. Iltimos, internet ulanishingizni tekshiring.');
      setLoading(false);
      return;
    }

    try {
      if (data.id === undefined) {
        throw new Error("Mijoz ID noto'g'ri.");
      }

      await deleteCustomer(data.id).unwrap();

      toast.success(`${data.name} muvaffaqiyatli o'chirildi.`);
      onClose();
    } catch (error: unknown) {
      let message = "Noma'lum xatolik";

      if (isFetchBaseQueryError(error)) {
        message =
          (error.data as BackendErrorResponse)?.error ||
          `Server xatosi (status: ${error.status})`;
      } else if (isSerializedError(error)) {
        message = error.message || 'Serialized xatolik';
      } else if (error instanceof Error) {
        message = error.message;
      }

      console.error('Xatolik: ', error);
      toast.error(`Xatolik ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold">
                Mijozni o'chirish
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Bu amalni qaytarib bo'lmaydi
              </AlertDialogDescription>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{data.name}</p>
                <p className="text-sm text-muted-foreground">ID: #{data.id}</p>
              </div>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel
            onClick={handleCancel}
            className="flex-1 bg-background/80 hover:bg-background/90 border-border/50"
          >
            Bekor qilish
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
          >
            {loading ? (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                O'chirilmoqda...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                O'chirish
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
