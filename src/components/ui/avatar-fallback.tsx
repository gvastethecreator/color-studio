'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import type * as React from 'react';
import { cn } from '@/lib/utils';

export function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Fallback
      className={cn('flex size-full items-center justify-center rounded-full bg-muted', className)}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}
