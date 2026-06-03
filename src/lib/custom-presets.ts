import { PRESETS } from '@/data/presets';
import type { PresetDefinition, PresetFamilyDefinition, PresetRegistry } from '@/types/palette';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toPresetId = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeFamily = (family: unknown, index: number): PresetFamilyDefinition => {
  if (!isRecord(family)) {
    throw new Error(`Invalid family at index ${index + 1}.`);
  }

  const id = typeof family.id === 'string' ? toPresetId(family.id) : '';
  const name = typeof family.name === 'string' ? family.name.trim() : '';
  const baseHue = typeof family.baseHue === 'number' ? family.baseHue : Number.NaN;
  const intrinsicChroma =
    typeof family.intrinsicChroma === 'number' ? family.intrinsicChroma : undefined;

  if (!id || !name || Number.isNaN(baseHue)) {
    throw new Error(`Family ${index + 1} is missing required fields.`);
  }

  return {
    id,
    name,
    baseHue,
    ...(intrinsicChroma !== undefined ? { intrinsicChroma } : {}),
  };
};

const normalizePreset = (value: unknown, fallbackId?: string): [string, PresetDefinition] => {
  if (!isRecord(value)) {
    throw new Error('Preset payload must be an object.');
  }

  const rawId = typeof value.id === 'string' ? value.id : (fallbackId ?? value.name);
  const id = typeof rawId === 'string' ? toPresetId(rawId) : '';
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  const description =
    typeof value.description === 'string' && value.description.trim().length > 0
      ? value.description.trim()
      : 'Imported custom preset.';
  const rawFamilies = Array.isArray(value.families) ? value.families : null;

  if (!id || !name || !rawFamilies || rawFamilies.length === 0) {
    throw new Error('Each preset needs id or name, description, and at least one family.');
  }

  return [
    id,
    {
      name,
      description,
      families: rawFamilies.map((family, index) => normalizeFamily(family, index)),
    },
  ];
};

const collectPresetCandidates = (value: unknown): Array<[string | undefined, unknown]> => {
  if (Array.isArray(value)) {
    return value.map((entry) => [undefined, entry]);
  }

  if (!isRecord(value)) {
    throw new Error('Preset import must be an object or an array.');
  }

  if (Array.isArray(value.presets)) {
    return value.presets.map((entry) => [undefined, entry]);
  }

  if (Array.isArray(value.families) || typeof value.name === 'string') {
    return [[typeof value.id === 'string' ? value.id : undefined, value]];
  }

  return Object.entries(value);
};

export const parseCustomPresetData = (
  value: unknown,
  reservedIds: string[] = Object.keys(PRESETS),
): PresetRegistry => {
  const entries = collectPresetCandidates(value);

  if (entries.length === 0) {
    throw new Error('No presets were found in the provided JSON file.');
  }

  const registry: PresetRegistry = {};
  const reservedLookup = new Set(reservedIds);

  for (const [fallbackId, entry] of entries) {
    const [id, preset] = normalizePreset(entry, fallbackId);

    if (reservedLookup.has(id)) {
      throw new Error(`Preset id "${id}" collides with an existing built-in preset.`);
    }

    if (registry[id]) {
      throw new Error(`Preset id "${id}" appears more than once in the imported file.`);
    }

    registry[id] = preset;
  }

  return registry;
};

export const parseCustomPresetText = (
  text: string,
  reservedIds: string[] = Object.keys(PRESETS),
): PresetRegistry => {
  try {
    return parseCustomPresetData(JSON.parse(text), reservedIds);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('The selected file is not valid JSON.');
    }

    throw error;
  }
};
