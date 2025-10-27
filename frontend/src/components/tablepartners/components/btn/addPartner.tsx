import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { SheetAdd } from './sheetAdd';
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
      {/* Button for adding a new item */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleAddClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-4 py-2 h-10"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Hamkor qo'shish</span>
              <Plus className="h-4 w-4 sm:hidden" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Yangi hamkor qo'shish</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* SheetAdd component to add a new item */}
      <SheetAdd open={addOpen} onClose={handleAddClose} />
    </>
  );
}

export default AddButtonComponent;
