import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  PenIcon,
  Trash,
  Settings,
  PlusIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { MaterialBatchSummary } from '@/interfaces/raw-material/raw-materials';
import { DeleteAlertDialog } from './alertDelete';
import { SheetEdit } from './sheetEdit';
import { SheetEditBatch } from '@/components/tablerawmaterials/components/btn/sheetEditBatch';
import { BatchDeleteAlertDialog } from '@/components/tablerawmaterials/components/btn/alertDeleteBatch';

const BatchesDropdown = ({ product }: { product: MaterialBatchSummary }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addPartyOpen, setAddPartyOpen] = useState(false);
  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-haspopup="true"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-muted/50 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Amallar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="dropdown-ignore w-48 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4 text-primary" />
            Amallar
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <PenIcon className="h-4 w-4 text-blue-500" />
              Tahrirlash
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
          >
            <span className="flex items-center gap-2">
              <Trash className="h-4 w-4" />
              O'chirish
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <BatchDeleteAlertDialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        data={{
          id: product.id,
          name: product.rawMaterialName,
        }}
      />
      <SheetEditBatch
        open={editOpen}
        onClose={handleEditClose}
        rawMaterialId={product.rawMaterialId}
        batch={{
          id: product.id,
          amount: product.amount,
          buyPrice: product.buyPrice,
          paid: 0, // Default value since it's not in MaterialBatchSummary
        }}
      />
    </>
  );
};

export default BatchesDropdown;
