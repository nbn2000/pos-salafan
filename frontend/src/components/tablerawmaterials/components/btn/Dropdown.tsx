import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RawMaterial } from '@/interfaces/raw-material/raw-materials';
import {
  ArrowUpRight,
  Eye,
  MoreHorizontal,
  PenIcon,
  PlusIcon,
  Settings,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteAlertDialog } from './alertDelete';
import { SheetEdit } from './sheetEdit';
import { SheetAddParty } from './sheetAddParty';

interface RawMaterialDropdownProps {
  item: RawMaterial;
  onShowDetail?: () => void;
  onNavigate?: () => void;
}

const Dropdown = ({
  item,
  onShowDetail,
  onNavigate,
}: RawMaterialDropdownProps) => {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addPartyOpen, setAddPartyOpen] = useState(false);

  const goToDetailPage = () => {
    if (onNavigate) {
      onNavigate();
    } else {
      navigate(`/raw-materials/${item.material.id}`);
    }
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
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Amallar</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="dropdown-ignore w-52 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4 text-primary" />
            Amallar
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onShowDetail?.()}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Eye className="h-4 w-4 text-primary" />
            Tafsilotlar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setAddPartyOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <PlusIcon className="h-4 w-4 text-purple-600" />
            Partiya qo'shish
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={goToDetailPage}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4 text-primary" />
            Sahifaga o'tish
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <PenIcon className="h-4 w-4 text-blue-500" />
            Tahrirlash
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash className="h-4 w-4" />
            O'chirish
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAlertDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        data={{
          id: item.material.id,
          name: item.material.name,
        }}
      />
      <SheetEdit
        open={editOpen}
        onClose={() => setEditOpen(false)}
        material={item.material}
      />
      <SheetAddParty
        open={addPartyOpen}
        onClose={() => setAddPartyOpen(false)}
        rawMaterialId={item.material.id}
      />
    </>
  );
};

export default Dropdown;
