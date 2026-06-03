'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import type * as React from 'react';
import { cn } from '@/lib/utils';

export function Avatar({ className, ...props }: AvatarPrimitive.Root.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-background align-middle font-medium text-xs',
        className,
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

export { AvatarPrimitive };
