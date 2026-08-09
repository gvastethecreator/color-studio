'use client';

import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import type * as React from 'react';

export function CollapsibleTrigger({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props): React.ReactElement {
  return (
    <CollapsiblePrimitive.Trigger
      className={className}
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}
