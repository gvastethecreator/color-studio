import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import ControlPanel from '@/components/ControlPanel';
import type { GeneratorSettings } from '@/types/palette';
import { createDefaultSettings } from '@/types/palette';

function ControlPanelHarness({ initialSettings }: { initialSettings?: GeneratorSettings }) {
  const [settings, setSettings] = useState(initialSettings ?? createDefaultSettings());

  return (
    <>
      <ControlPanel
        settings={settings}
        setSettings={setSettings}
        onReset={() => setSettings(createDefaultSettings())}
        activeFamilyId="flamingo"
        activeFamilyDisplayName="Flamingo"
      />
      <output data-testid="settings-state">{JSON.stringify(settings)}</output>
    </>
  );
}

const readSettingsState = (): GeneratorSettings => {
  const content = screen.getByTestId('settings-state').textContent;
  return JSON.parse(content ?? '{}') as GeneratorSettings;
};

const openPresetSelect = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByTestId('preset-select-trigger'));
  await waitFor(() => {
    expect(screen.getByRole('option', { name: /tailwind-ish/i })).toBeInTheDocument();
  });
};

describe('ControlPanel', () => {
  it('updates global and local controls through state setters', async () => {
    const user = userEvent.setup();
    render(
      <ControlPanelHarness
        initialSettings={{
          ...createDefaultSettings(),
          overrides: {
            flamingo: { hueShift: 5, chromaScale: 1, lightnessScale: 1 },
          },
        }}
      />,
    );

    await openPresetSelect(user);
    await user.click(screen.getByRole('option', { name: /tailwind-ish/i }));

    const hueThumb = document.querySelector<HTMLElement>(
      'button[data-slot="slider-control"] + [data-slot="slider-thumb"], [data-slot="slider-thumb"]',
    );
    const sliderThumbs = Array.from(
      document.querySelectorAll<HTMLElement>('[data-slot="slider-thumb"]'),
    );
    expect(sliderThumbs.length).toBeGreaterThan(0);

    const firstThumb = sliderThumbs[0]!;
    firstThumb.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');

    await waitFor(() => {
      const settings = readSettingsState();
      expect(settings.preset).toBe('tailwind');
    });

    expect(screen.getByRole('button', { name: /reset family override/i })).toBeInTheDocument();

    void hueThumb;
  });

  it('resets local override and global state', async () => {
    const user = userEvent.setup();
    render(
      <ControlPanelHarness
        initialSettings={{
          ...createDefaultSettings(),
          preset: 'tailwind',
          hueShift: 45,
          chromaScale: 1.25,
          lightnessScale: 1.1,
          overrides: {
            flamingo: {
              hueShift: 10,
              chromaScale: 1.4,
              lightnessScale: 1.2,
            },
          },
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: /reset family override/i }));
    expect(readSettingsState().overrides).toEqual({});

    await user.click(screen.getByRole('button', { name: /reset all/i }));
    expect(readSettingsState()).toEqual(createDefaultSettings());
  });

  it('triggers the external reset callback', async () => {
    const user = userEvent.setup();
    const setSettings = vi.fn();
    const onReset = vi.fn();

    render(
      <ControlPanel
        settings={createDefaultSettings()}
        setSettings={setSettings}
        onReset={onReset}
        activeFamilyId="flamingo"
        activeFamilyDisplayName="Flamingo"
      />,
    );

    await user.click(screen.getByRole('button', { name: /reset all/i }));
    expect(onReset).toHaveBeenCalled();
  });

  it('forwards imported preset files through the callback', async () => {
    const user = userEvent.setup();
    const onImportPreset = vi.fn().mockResolvedValue(undefined);

    render(
      <ControlPanel
        settings={createDefaultSettings()}
        setSettings={vi.fn()}
        onReset={vi.fn()}
        activeFamilyId="flamingo"
        activeFamilyDisplayName="Flamingo"
        onImportPreset={onImportPreset}
      />,
    );

    const input = screen.getByTestId('preset-import-input');
    const file = new File(
      [
        JSON.stringify({
          id: 'aurora',
          name: 'Aurora',
          description: 'Imported preset',
          families: [{ id: 'glacier', name: 'Glacier', baseHue: 210 }],
        }),
      ],
      'aurora.json',
      { type: 'application/json' },
    );

    await user.upload(input, file);

    await waitFor(() => {
      expect(onImportPreset).toHaveBeenCalledWith(file);
    });
  });
});
