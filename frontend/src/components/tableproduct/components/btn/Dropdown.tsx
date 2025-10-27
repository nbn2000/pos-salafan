import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowUpRight,
  EyeIcon,
  MoreHorizontal,
  PenIcon,
  PlusIcon,
  Settings,
  TrashIcon,
} from 'lucide-react';
import React, { useState } from 'react';
import { DeleteAlertDialog } from './alertDelete';

interface ProductDropdownProps {
  item: ProductWithBatches;
  onShowDetail?: () => void;
  onNavigate?: () => void;
}

const Dropdown = ({ item, onShowDetail, onNavigate }: ProductDropdownProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addSkuOpen, setAddSkuOpen] = useState(false);

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleAddSkuClose = () => {
    setAddSkuOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-haspopup="true"
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-muted/50 transition-colors duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-background/95 backdrop-blur-sm border border-border/50 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-sm font-semibold">
            <Settings className="h-4 w-4 text-primary" />
            Mahsulot amallari
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onShowDetail?.();
            }}
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <EyeIcon className="h-4 w-4 text-blue-600" />
              <span>Batafsil ko'rish</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <PenIcon className="h-4 w-4 text-green-600" />
              <span>Tahrirlash</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setAddSkuOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4 text-purple-600" />
              <span>Partiya qo'shish</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate?.();
            }}
          >
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span>Sahifaga o'tish</span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="flex items-center justify-between gap-4 cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOpen(true);
            }}
          >
            <div className="flex items-center gap-2">
              <TrashIcon className="h-4 w-4 text-red-600" />
              <span>O'chirish</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        data={{ id: item.id, name: item.name }}
      />
    </>
  );
};

export default Dropdown;
