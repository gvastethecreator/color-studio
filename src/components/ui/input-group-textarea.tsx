'use client';

import { Textarea, type TextareaProps } from '@/components/ui/textarea';

export function InputGroupTextarea({ className, ...props }: TextareaProps): React.ReactElement {
  return <Textarea className={className} unstyled {...props} />;
}
