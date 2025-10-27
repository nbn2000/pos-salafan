import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PenIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeleteAlertDialog } from './alertDelete';
import { SheetEdit } from './sheetEdit';

const Dropdown = ({ product }: { product: ProductBatch }) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addSkuOpen, setAddSkuOpen] = useState(false);
  const navigate = useNavigate();

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
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tugmalar</DropdownMenuLabel>

          <DropdownMenuItem
            className="flex justify-between gap-4"
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            O'zgartirish <PenIcon className=" h-4 w-4" />
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex justify-between gap-4"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
          >
            O'chirish <TrashIcon className=" h-4 w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAlertDialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        id={product.id || ''}
      />
      <SheetEdit open={editOpen} onClose={handleEditClose} product={product} />
    </>
  );
};

export default Dropdown;
