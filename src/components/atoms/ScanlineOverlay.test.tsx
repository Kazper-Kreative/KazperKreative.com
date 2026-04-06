import { render } from '@testing-library/react';
import ScanlineOverlay from './ScanlineOverlay';

jest.mock('@/components/utilities/usePerformanceConfig', () => ({
  usePerformanceConfig: jest.fn(),
}));

import { usePerformanceConfig } from '@/components/utilities/usePerformanceConfig';

describe('ScanlineOverlay', () => {
  it('renders scanlines when motion is allowed', () => {
    (usePerformanceConfig as jest.Mock).mockReturnValue({ reducedMotion: false });
    const { container } = render(<ScanlineOverlay />);
    expect(container.firstChild).not.toBeNull();
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders nothing when reduced motion is preferred', () => {
    (usePerformanceConfig as jest.Mock).mockReturnValue({ reducedMotion: true });
    const { container } = render(<ScanlineOverlay />);
    expect(container.firstChild).toBeNull();
  });
});
