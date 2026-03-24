import { Activity, BarChart3, Bell, PieChart, Search, User } from 'lucide-react';
import { getReadableTextColor } from '@/lib/accessibility';
import type { ColorFamily, ColorStep } from '@/types/palette';

interface PreviewPanelProps {
  activeFamily: ColorFamily;
}

const fallbackStep = (step: number): ColorStep => ({
  step,
  l: 0.5,
  c: 0,
  h: 0,
  hex: '#777777',
  css: 'oklch(0.5 0 0)',
});

const getStep = (steps: ColorStep[], index: number): ColorStep =>
  steps[index] ?? fallbackStep(index + 1);

export default function PreviewPanel({ activeFamily }: PreviewPanelProps) {
  const colors = activeFamily.steps;

  const bgMain = getStep(colors, 0).css;
  const bgCard = getStep(colors, 1).css;
  const border = getStep(colors, 3).css;
  const primary = getStep(colors, 5).css;
  const primaryHover = getStep(colors, 6).css;
  const mainText = getReadableTextColor(getStep(colors, 0).hex);
  const cardText = getReadableTextColor(getStep(colors, 1).hex);
  const primaryText = getReadableTextColor(getStep(colors, 5).hex);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border transition-colors duration-500"
      style={{ backgroundColor: bgMain, borderColor: border }}
    >
      <header
        className="flex h-16 items-center justify-between border-b px-6 transition-colors duration-500"
        style={{ backgroundColor: bgCard, borderColor: border }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-500"
            style={{ backgroundColor: primary }}
          >
            <Activity className="h-5 w-5" style={{ color: primaryText }} />
          </div>
          <span className="text-lg font-bold" style={{ color: cardText }}>
            Dash<span style={{ color: primary }}>UI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div
            className="hidden items-center rounded-full border px-3 py-1.5 transition-colors duration-500 md:flex"
            style={{ backgroundColor: bgMain, borderColor: border }}
          >
            <Search className="mr-2 h-4 w-4 opacity-50" style={{ color: mainText }} />
            <span className="text-sm opacity-50" style={{ color: mainText }}>
              Search...
            </span>
          </div>
          <Bell className="h-5 w-5 opacity-70" style={{ color: cardText }} />
          <div className="h-8 w-8 rounded-full border-2" style={{ borderColor: primary }}>
            <User className="h-full w-full p-1 opacity-80" style={{ color: cardText }} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-8">
          <h1
            className="mb-2 text-3xl font-bold transition-colors duration-500"
            style={{ color: mainText }}
          >
            Overview
          </h1>
          <p className="opacity-70" style={{ color: mainText }}>
            Welcome back. Here is your palette report.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <article
              key={item}
              className="rounded-xl border p-6 shadow-sm transition-colors duration-500"
              style={{ backgroundColor: bgCard, borderColor: border }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="rounded-lg p-2" style={{ backgroundColor: bgMain }}>
                  <BarChart3 className="h-5 w-5" style={{ color: primary }} />
                </div>
                <span
                  className="rounded-full px-2 py-1 text-xs font-medium"
                  style={{ backgroundColor: bgMain, color: primary }}
                >
                  +12.5%
                </span>
              </div>
              <div className="mb-1 text-2xl font-bold" style={{ color: cardText }}>
                $24,500
              </div>
              <div className="text-sm opacity-60" style={{ color: cardText }}>
                Total Revenue
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section
            className="rounded-xl border p-6 transition-colors duration-500 lg:col-span-2"
            style={{ backgroundColor: bgCard, borderColor: border }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-semibold" style={{ color: cardText }}>
                Traffic Analysis
              </h2>
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity duration-300 hover:opacity-85"
                style={{ backgroundColor: primary, color: primaryText }}
              >
                Export Data
              </button>
            </div>
            <div
              className="flex h-48 items-end gap-2 rounded-lg p-4 transition-colors duration-500"
              style={{ backgroundColor: bgMain }}
            >
              {[40, 70, 45, 90, 60, 80, 50, 75, 60, 85].map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  className="flex-1 rounded-t-sm transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${height}%`,
                    backgroundColor: index % 2 === 0 ? primary : primaryHover,
                  }}
                />
              ))}
            </div>
          </section>

          <section
            className="rounded-xl border p-6 transition-colors duration-500"
            style={{ backgroundColor: bgCard, borderColor: border }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-semibold" style={{ color: cardText }}>
                Storage
              </h2>
              <PieChart className="h-5 w-5 opacity-50" style={{ color: cardText }} />
            </div>
            <div
              className="relative mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-full border-16"
              style={{ borderColor: bgMain }}
            >
              <div
                className="absolute inset-0 rounded-full border-16 border-transparent"
                style={{
                  borderTopColor: primary,
                  borderRightColor: primary,
                  transform: 'rotate(45deg)',
                }}
              />
              <div className="text-center">
                <span className="block text-2xl font-bold" style={{ color: cardText }}>
                  75%
                </span>
                <span className="text-xs opacity-60" style={{ color: cardText }}>
                  Used
                </span>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-lg border py-2 text-sm font-medium transition-opacity duration-300 hover:opacity-80"
              style={{ borderColor: primary, color: primary }}
            >
              Upgrade Plan
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
