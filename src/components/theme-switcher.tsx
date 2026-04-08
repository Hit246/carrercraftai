'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Paintbrush } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [color, setColor] = useState("blue");

  useEffect(() => {
    document.documentElement.setAttribute("data-color", color);
  }, [color]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Paintbrush className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40 space-y-2 p-2">

        {/* Theme */}
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <div className="h-px bg-border my-1" />

        {/* Color */}
        <DropdownMenuRadioGroup value={color} onValueChange={setColor}>
          <DropdownMenuRadioItem value="blue">Blue</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="violet">Violet</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="green">Green</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="orange">Orange</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}