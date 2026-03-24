import { generatePalettes } from '@/lib/color';
import { generateCSSVariables, generateTailwind4CSS, generateTokenJson } from '@/lib/exports';
import { createDefaultSettings } from '@/types/palette';

describe('export helpers', () => {
  const palette = generatePalettes(createDefaultSettings()).slice(0, 1);

  it('generates CSS variables from stable family ids', () => {
    const output = generateCSSVariables(palette);

    expect(output).toContain(':root {');
    expect(output).toContain('--flamingo-1:');
  });

  it('generates Tailwind theme variables', () => {
    const output = generateTailwind4CSS(palette);

    expect(output).toContain('@theme {');
    expect(output).toContain('--color-flamingo-1:');
  });

  it('generates JSON tokens for downstream tooling', () => {
    const output = generateTokenJson(palette);

    expect(output).toContain('"flamingo"');
    expect(output).toContain('"1"');
  });

  it('keeps export outputs stable through snapshot regression coverage', () => {
    expect({
      css: generateCSSVariables(palette),
      tailwind: generateTailwind4CSS(palette),
      json: generateTokenJson(palette),
    }).toMatchSnapshot();
  });
});
