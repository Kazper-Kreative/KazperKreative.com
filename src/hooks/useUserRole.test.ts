import { renderHook, act } from '@testing-library/react';
import { useUserRole, Role } from './useUserRole';

describe('useUserRole', () => {
  it('should initialize with GUEST role', () => {
    const { result } = renderHook(() => useUserRole());
    expect(result.current.role).toBe('GUEST');
  });

  it('should update role correctly', () => {
    const { result } = renderHook(() => useUserRole());
    act(() => {
      result.current.setRole('AGENT');
    });
    expect(result.current.role).toBe('AGENT');
  });

  it('should provide the correct theme color for the role', () => {
    const { result } = renderHook(() => useUserRole());
    
    act(() => {
      result.current.setRole('CLIENT');
    });
    expect(result.current.getThemeColor()).toBe('#10b981'); // Emerald
    
    act(() => {
      result.current.setRole('AGENT');
    });
    expect(result.current.getThemeColor()).toBe('#a855f7'); // Purple
  });
});
