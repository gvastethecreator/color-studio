'use client';

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import type * as React from 'react';
import { cn } from '@/lib/utils';

export function CollapsiblePanel({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props): React.ReactElement {
  return (
    <CollapsiblePrimitive.Panel
      className={cn(
        'h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0',
        className,
      )}
      data-slot="collapsible-panel"
      {...props}
    />
  );
}
