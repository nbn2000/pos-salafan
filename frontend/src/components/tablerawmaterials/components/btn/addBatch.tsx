import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SheetAddParty } from './sheetAddParty';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useParams } from 'react-router-dom';

// AddBatchButtonComponent to render a button for adding a new batch
function AddBatchButtonComponent(): React.ReactNode {
  const { id } = useParams<{ id: string }>();
  const [addOpen, setAddOpen] = useState(false);

  // Close the add sheet
  const handleAddClose = () => {
    setAddOpen(false);
  };

  // Open the add sheet
  const handleAddClick = () => {
    setAddOpen(true);
  };

  return (
    <>
      {/* Button for adding a new batch */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-4 py-2 h-10"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Partiya qo'shish</span>
              <Plus className="h-4 w-4 sm:hidden" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Yangi partiya qo'shish</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* SheetAddParty component to add a new batch */}
      {id && (
        <SheetAddParty
          open={addOpen}
          onClose={handleAddClose}
          rawMaterialId={id}
        />
      )}
    </>
  );
}

export default AddBatchButtonComponent;
