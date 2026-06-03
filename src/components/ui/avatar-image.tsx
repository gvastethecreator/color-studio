'use client';

import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
import type * as React from 'react';
import { cn } from '@/lib/utils';

export function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.Image.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Image
      className={cn('size-full object-cover', className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}
