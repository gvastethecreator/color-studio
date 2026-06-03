import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { IconPalette } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { AccentPaletteId } from '@/types/palette';
import './BrandLogo.css';

interface BrandLogoProps {
  paletteId: AccentPaletteId;
  onCycle: () => void;
  className?: string;
}

const PARTICLES = 8;
const PULSE_DURATION = 600;
const BURST_DURATION = 720;
const RIPPLE_DURATION = 600;

export function BrandLogo({ paletteId, onCycle, className }: BrandLogoProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [isRippling, setIsRippling] = useState(false);

  const timeoutsRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timeoutsRef.current) {
      window.clearTimeout(id);
    }
    timeoutsRef.current = [];
  }, []);

  const queueTimer = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter((value) => value !== id);
      callback();
    }, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const triggerColorCycle = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      clearTimers();
      setIsPulsing(false);
      setIsBursting(false);
      setIsRippling(false);
      window.requestAnimationFrame(() => {
        setIsPulsing(true);
        setIsBursting(true);
        setIsRippling(true);
      });
      onCycle();
      queueTimer(() => setIsPulsing(false), PULSE_DURATION);
      queueTimer(() => setIsRippling(false), RIPPLE_DURATION);
      queueTimer(() => setIsBursting(false), BURST_DURATION);
    },
    [clearTimers, onCycle, queueTimer],
  );

  return (
    <button
      type="button"
      onClick={triggerColorCycle}
      data-pulse={isPulsing}
      data-burst={isBursting}
      data-ripple={isRippling}
      data-accent={paletteId}
      aria-label="Cycle accent color"
      title="Cycle accent color"
      className={cn('brand-logo', className)}
    >
      <span className="brand-logo__ripple" aria-hidden="true" />
      <span aria-hidden="true" className="inline-flex items-center justify-center">
        <IconPalette className="size-3.5" />
      </span>
      <span className="brand-logo__particles" aria-hidden="true">
        {Array.from({ length: PARTICLES }, (_, index) => (
          <span key={index} className="brand-logo__particle" />
        ))}
      </span>
    </button>
  );
}
