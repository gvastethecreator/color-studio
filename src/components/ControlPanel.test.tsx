import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

describe('ControlPanel', () => {
  it('updates global and local controls through state setters', () => {
    render(<ControlPanelHarness />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'tailwind' },
    });

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0]!, { target: { value: '120' } });
    fireEvent.change(sliders[1]!, { target: { value: '1.35' } });
    fireEvent.change(sliders[2]!, { target: { value: '1.15' } });
    fireEvent.change(sliders[3]!, { target: { value: '12' } });
    fireEvent.change(sliders[4]!, { target: { value: '1.5' } });
    fireEvent.change(sliders[5]!, { target: { value: '1.2' } });

    const settings = readSettingsState();

    expect(settings.preset).toBe('tailwind');
    expect(settings.hueShift).toBe(120);
    expect(settings.chromaScale).toBe(1.35);
    expect(settings.lightnessScale).toBe(1.15);
    expect(settings.overrides.flamingo).toEqual({
      hueShift: 12,
      chromaScale: 1.5,
      lightnessScale: 1.2,
    });

    expect(screen.getByTitle('Reset Family')).toBeInTheDocument();
  });

  it('resets local override and global state', () => {
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

    fireEvent.click(screen.getByTitle('Reset Family'));
    expect(readSettingsState().overrides).toEqual({});

    fireEvent.click(screen.getByRole('button', { name: /reset all global & local/i }));

    expect(readSettingsState()).toEqual(createDefaultSettings());
    expect(screen.getByText(/select a row in the grid/i)).toBeInTheDocument();
  });

  it('uses functional setters and triggers the external reset callback', () => {
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

    fireEvent.change(screen.getByDisplayValue('Prism Spectrum'), {
      target: { value: 'tailwind' },
    });

    expect(setSettings).toHaveBeenCalled();
    expect(typeof setSettings.mock.calls[0]?.[0]).toBe('function');

    fireEvent.click(screen.getByRole('button', { name: /reset all global & local/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
