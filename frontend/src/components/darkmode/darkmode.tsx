import * as React from 'react';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useTheme } from '@/components/theme-provider';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 text-muted-foreground hover:text-primary"
        >
          <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/95 backdrop-blur-sm border border-border/50"
      >
        <DropdownMenuItem
          className="flex justify-between cursor-pointer hover:bg-primary/10 hover:text-primary"
          onClick={() => theme !== 'light' && toggleTheme()}
        >
          Yorqin <SunIcon className="ml-2 h-4 w-4" />
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex justify-between cursor-pointer hover:bg-primary/10 hover:text-primary"
          onClick={() => theme !== 'dark' && toggleTheme()}
        >
          Qorong'u <MoonIcon className="ml-2 h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
