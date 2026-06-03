'use client';

import { OTPFieldPreview as OTPFieldPrimitive } from '@base-ui/react/otp-field';
import type * as React from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function OTPFieldSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <OTPFieldPrimitive.Separator
      render={
        <Separator
          className={cn(
            'rounded-full bg-input data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-3',
            className,
          )}
          orientation="horizontal"
          {...props}
        />
      }
    />
  );
}
