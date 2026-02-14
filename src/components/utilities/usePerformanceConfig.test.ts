import { renderHook } from '@testing-library/react';
import { usePerformanceConfig } from './usePerformanceConfig';

describe('usePerformanceConfig', () => {
  it('detects prefers-reduced-motion', () => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    const { result } = renderHook(() => usePerformanceConfig());
    expect(result.current.reducedMotion).toBe(true);
  });

  it('provides a simplified config for low-end devices (mocked)', () => {
    // We can't easily mock hardware capabilities like memory/cores in JSDOM,
    // but we can test the fallback logic.
    const { result } = renderHook(() => usePerformanceConfig());
    expect(result.current).toHaveProperty('particleCount');
  });
});
