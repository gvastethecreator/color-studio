import {
  IconActivity,
  IconChartBar,
  IconBell,
  IconDownload,
  IconChartPie,
  IconSearch,
  IconTrendingUp,
  IconUser,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardPanel } from '@/components/ui/card';
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

const KPI_DATA = [
  { id: 'revenue', label: 'Total Revenue', value: '$24,500', delta: '+12.5%', icon: IconChartBar },
  { id: 'active', label: 'Active Users', value: '1,284', delta: '+8.1%', icon: IconTrendingUp },
  { id: 'conversion', label: 'Conversion', value: '3.42%', delta: '+0.6%', icon: IconActivity },
] as const;

const BAR_HEIGHTS = [40, 70, 45, 90, 60, 80, 50, 75, 60, 85] as const;

export default function PreviewPanel({ activeFamily }: PreviewPanelProps) {
  const colors = activeFamily.steps;

  const bgMain = getStep(colors, 0).css;
  const bgCard = getStep(colors, 1).css;
  const border = getStep(colors, 3).css;
  const primary = getStep(colors, 5).css;
  const primaryHover = getStep(colors, 6).css;
  const mainText = getReadableTextColor(getStep(colors, 0).hex);
  const cardText = getReadableTextColor(getStep(colors, 1).hex);

  return (
    <Card
      className="h-full overflow-hidden border-0 p-0 text-[12px] leading-tight shadow-2xl ring-1 ring-border/40"
      style={{ backgroundColor: bgMain, color: mainText }}
    >
      <header
        className="flex h-10 shrink-0 items-center justify-between border-b px-3 transition-colors duration-500"
        style={{ backgroundColor: bgCard, borderColor: border, color: cardText }}
      >
        <div className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-md"
            style={{ backgroundColor: primary }}
          >
            <IconActivity aria-hidden="true" className="size-3.5" style={{ color: cardText }} />
          </span>
          <span className="font-semibold text-[12px]">
            Dash<span style={{ color: primary }}>UI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="hidden items-center gap-1 rounded-md border px-1.5 py-0.5 sm:flex"
            style={{ backgroundColor: bgMain, borderColor: border }}
          >
            <IconSearch aria-hidden="true" className="size-3 opacity-60" />
            <span className="text-[11px] opacity-60">Search…</span>
          </div>
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            aria-label="Notifications"
            style={{ color: cardText }}
          >
            <IconBell aria-hidden="true" />
          </Button>
          <span
            aria-hidden="true"
            className="size-6 rounded-full border-2 p-0.5"
            style={{ borderColor: primary, color: cardText }}
          >
            <IconUser aria-hidden="true" className="size-full" />
          </span>
        </div>
      </header>

      <CardPanel className="flex flex-col gap-2 p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="font-heading text-[15px] font-semibold tracking-tight">Overview</h1>
            <p className="text-[11px]" style={{ color: mainText, opacity: 0.7 }}>
              Live preview using the {activeFamily.name} family.
            </p>
          </div>
          <Badge
            variant="secondary"
            size="sm"
            className="border-0"
            style={{ backgroundColor: primary, color: cardText }}
          >
            <span className="size-1 rounded-full" style={{ backgroundColor: cardText }} />
            Live
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {KPI_DATA.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.id}
                className="gap-1 border-0 p-2.5 text-[12px] shadow-none"
                style={{ backgroundColor: bgCard, color: cardText }}
              >
                <div className="flex items-start justify-between">
                  <span
                    aria-hidden="true"
                    className="flex size-6 items-center justify-center rounded-md"
                    style={{ backgroundColor: bgMain, color: primary }}
                  >
                    <Icon aria-hidden="true" className="size-3" />
                  </span>
                  <Badge
                    variant="secondary"
                    size="sm"
                    className="border-0"
                    style={{ backgroundColor: bgMain, color: primary }}
                  >
                    {kpi.delta}
                  </Badge>
                </div>
                <div className="font-heading text-[16px] font-bold leading-tight">{kpi.value}</div>
                <div className="text-[10.5px] opacity-60">{kpi.label}</div>
              </Card>
            );
          })}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2 lg:grid-cols-3">
          <Card
            className="gap-2 border-0 p-2.5 text-[12px] shadow-none lg:col-span-2"
            style={{ backgroundColor: bgCard, color: cardText, borderColor: border }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[12px]">Traffic Analysis</h2>
              <Button type="button" size="xs" style={{ backgroundColor: primary, color: cardText }}>
                <IconDownload aria-hidden="true" />
                Export
              </Button>
            </div>
            <div
              className="flex h-28 items-end gap-1 rounded-md p-2 transition-colors duration-500"
              style={{ backgroundColor: bgMain }}
            >
              {BAR_HEIGHTS.map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  className="flex-1 rounded-sm transition-all duration-500 hover:opacity-80"
                  style={{
                    height: `${height}%`,
                    backgroundColor: index % 2 === 0 ? primary : primaryHover,
                  }}
                />
              ))}
            </div>
          </Card>

          <Card
            className="gap-2 border-0 p-2.5 text-[12px] shadow-none"
            style={{ backgroundColor: bgCard, color: cardText, borderColor: border }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-[12px]">Storage</h2>
              <IconChartPie aria-hidden="true" className="size-3 opacity-60" />
            </div>
            <div
              className="relative mx-auto flex size-20 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(${primary} 0 75%, ${bgMain} 75% 100%)`,
              }}
            >
              <div
                className="flex size-14 items-center justify-center rounded-full"
                style={{ backgroundColor: bgCard }}
              >
                <div className="text-center">
                  <div className="font-heading font-bold text-[12px]">75%</div>
                  <div className="text-[9px] opacity-60">Used</div>
                </div>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="xs"
              style={{ borderColor: primary, color: primary }}
            >
              Upgrade plan
            </Button>
          </Card>
        </div>
      </CardPanel>
    </Card>
  );
}
