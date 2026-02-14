import { renderHook, act } from '@testing-library/react';
import { useScrollProgress } from './useScrollProgress';

describe('useScrollProgress', () => {
  it('returns 0 initially', () => {
    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('updates progress on scroll', () => {
    const { result } = renderHook(() => useScrollProgress());
    
    // Mock scroll height and position
    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true });
    
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    // progress = scrollY / (scrollHeight - innerHeight) = 500 / (2000 - 1000) = 0.5
    expect(result.current).toBe(0.5);
  });
});
