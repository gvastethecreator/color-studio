'use client';

import type { ReactElement } from 'react';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import type { ThemeMode } from '@/types/palette';

interface ThemeToggleProps {
  theme: ThemeMode;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps): ReactElement {
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onToggle}
            aria-label={label}
            title={label}
          >
            {isDark ? <IconSun aria-hidden="true" /> : <IconMoon aria-hidden="true" />}
          </Button>
        }
      />
      <TooltipPopup side="bottom" sideOffset={6}>
        {label}
      </TooltipPopup>
    </Tooltip>
  );
}
