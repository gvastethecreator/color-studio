import type { ColorFamily } from '@/types/palette';

const toTokenName = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const getFamilyTokenName = (family: ColorFamily): string => toTokenName(family.id || family.name);

export const generateCSSVariables = (palettes: ColorFamily[]): string => {
  const lines = palettes.flatMap((family) => {
    const familyName = getFamilyTokenName(family);
    return family.steps.map((step) => `  --${familyName}-${step.step}: ${step.css};`);
  });

  return [':root {', ...lines, '}'].join('\n');
};

export const generateTailwind4CSS = (palettes: ColorFamily[]): string => {
  const lines = palettes.flatMap((family) => {
    const familyName = getFamilyTokenName(family);
    return family.steps.map((step) => `  --color-${familyName}-${step.step}: ${step.css};`);
  });

  return ['@theme {', ...lines, '}'].join('\n');
};

export const generateTokenJson = (palettes: ColorFamily[]): string => {
  const payload = Object.fromEntries(
    palettes.map((family) => [
      getFamilyTokenName(family),
      Object.fromEntries(family.steps.map((step) => [step.step, step.css])),
    ]),
  );

  return JSON.stringify(payload, null, 2);
};
