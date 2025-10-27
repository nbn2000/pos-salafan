import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Package } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// AddButtonComponent to render a button for adding a new item
function AddButtonComponent(): React.ReactNode {
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
      {/* Enhanced Button for adding a new item */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold shadow-lg gap-2 h-10 px-4"
            >
              <Plus className="h-4 w-4" />
              Mahsulot qo'shish
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Yangi mahsulot qo'shish</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}

export default AddButtonComponent;
