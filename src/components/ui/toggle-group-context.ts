import type { VariantProps } from 'class-variance-authority';
import { createContext } from 'react';
import type { toggleVariants } from '@/components/ui/toggle-variants';

export const ToggleGroupContext: React.Context<VariantProps<typeof toggleVariants>> = createContext<
  VariantProps<typeof toggleVariants>
>({
  size: 'default',
  variant: 'default',
});
