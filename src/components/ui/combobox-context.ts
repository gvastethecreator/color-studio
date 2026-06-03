import type React from 'react';
import { createContext } from 'react';

export const ComboboxContext: React.Context<{
  chipsRef: React.RefObject<Element | null> | null;
  multiple: boolean;
}> = createContext<{
  chipsRef: React.RefObject<Element | null> | null;
  multiple: boolean;
}>({
  chipsRef: null,
  multiple: false,
});
