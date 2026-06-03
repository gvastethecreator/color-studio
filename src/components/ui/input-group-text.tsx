'use client';

import type * as React from 'react';
import { cn } from '@/lib/utils';

export function InputGroupText({
  className,
  ...props
}: React.ComponentProps<'span'>): React.ReactElement {
  return (
    <span
      className={cn(
        "line-clamp-1 flex items-center gap-2 whitespace-nowrap text-muted-foreground leading-none in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4.5 sm:in-[[data-slot=input-group]:has([data-slot=input-control],[data-slot=textarea-control])]:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5",
        className,
      )}
      {...props}
    />
  );
}
