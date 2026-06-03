'use client';

import { Input, type InputProps } from '@/components/ui/input';

export function InputGroupInput({ className, ...props }: InputProps): React.ReactElement {
  return <Input className={className} unstyled {...props} />;
}
