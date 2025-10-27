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
import { Trash2, AlertTriangle, Box } from 'lucide-react';
import { useDeleteRawMaterialsMutation } from '@/api/raw-materials';

type Data = {
  id: string;
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
  const [deleteRawProduct] = useDeleteRawMaterialsMutation();

  const handleDelete = async () => {
    if (!data?.id) {
      toast.error('Homashyo ID topilmadi');
      return;
    }

    try {
      setLoading(true);
      await deleteRawProduct(data.id).unwrap();
      toast.success("Homashyo o'chirildi");
      onClose();
    } catch (error: any) {
      console.error('Raw material delete error:', error);
      console.error('Error data structure:', JSON.stringify(error, null, 2));

      const message =
        error?.data?.message ||
        error?.message ||
        "O'chirishda xatolik yuz berdi";
      console.log('Displaying error message:', message);
      toast.error(message);
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
                Homashyoni o'chirish
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Bu amalni qaytarib bo'lmaydi
              </AlertDialogDescription>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Box className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{data.name}</p>
              </div>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 bg-background/80 hover:bg-background/90 border-border/50"
            disabled={loading}
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
