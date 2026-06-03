import { createContext } from 'react';

export const NumberFieldContext: React.Context<{
  fieldId: string;
} | null> = createContext<{
  fieldId: string;
} | null>(null);
