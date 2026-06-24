// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { ETACalculator } from '@/utils/etaCalculator';

describe('ETACalculator', () => {
  beforeEach(() => localStorage.clear());

  it('estimates zero with no recorded metrics', () => {
    const c = new ETACalculator();
    expect(c.getAverageSpeed()).toBe(0);
    expect(c.calculateETA([{ width: 1000, height: 1000 }])).toBe(0);
  });

  it('derives speed and ETA from a recorded metric', () => {
    const c = new ETACalculator();
    c.addMetric(1000, 1000, 1000); // 1 MP processed in 1 s -> 1 MP/s
    expect(c.getAverageSpeed()).toBeCloseTo(1, 5);
    // one more 1 MP file -> ~1 s
    expect(c.calculateETA([{ width: 1000, height: 1000 }])).toBeCloseTo(1, 5);
  });

  it('returns zero ETA when there are no remaining files', () => {
    const c = new ETACalculator();
    c.addMetric(2000, 1000, 1000);
    expect(c.calculateETA([])).toBe(0);
  });

  it('persists metrics across instances and clears them', () => {
    const a = new ETACalculator();
    a.addMetric(1000, 1000, 1000);
    const b = new ETACalculator(); // loads persisted metrics
    expect(b.getAverageSpeed()).toBeCloseTo(1, 5);
    b.clearMetrics();
    expect(b.getAverageSpeed()).toBe(0);
    expect(new ETACalculator().getAverageSpeed()).toBe(0);
  });
});
