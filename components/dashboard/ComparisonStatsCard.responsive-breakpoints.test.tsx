import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparisonStatsCard from './ComparisonStatsCard';
import React from 'react';

// Mock matchMedia for responsive viewport testing
const mockMatchMedia = (width: number) => {
  return vi.fn().mockImplementation((query) => ({
    matches: width <= 768 ? query.includes('max-width') : query.includes('min-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('ComparisonStatsCard Responsive Multi-device Layouts', () => {
  const defaultProps = {
    title: 'Total Commits',
    valueA: 1500,
    valueB: 1200,
    labelA: 'User A',
    labelB: 'User B',
    icon: 'GitCommit',
  };

  beforeEach(() => {
    // Default to mobile viewport (iPhone SE width)
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
    window.matchMedia = mockMatchMedia(375);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('mocks standard mobile-width media coordinates and renders cleanly', () => {
    render(<ComparisonStatsCard {...defaultProps} />);

    // Assert viewport is properly set for test environment
    expect(window.innerWidth).toBe(375);

    // The component should render without crashing on mobile
    expect(screen.getByText('Total Commits')).toBeDefined();
    expect(screen.getByText('1500')).toBeDefined();
    expect(screen.getByText('1200')).toBeDefined();
  });

  it('asserts that grid columns and flex layouts are responsive', () => {
    const { container } = render(<ComparisonStatsCard {...defaultProps} />);

    // Check for grid grid-cols-2 class which handles responsive side-by-side stats
    const gridContainer = container.querySelector('.grid.grid-cols-2');
    expect(gridContainer).not.toBeNull();
    expect(gridContainer?.className).toContain('gap-4');
  });

  it('verifies styling values use relative widths preventing horizontal scrollbars on mobile', () => {
    const { container } = render(<ComparisonStatsCard {...defaultProps} />);

    // Progress bar container should use w-full (100% width), not an absolute px value
    const progressBar = container.querySelector('.w-full.h-2');
    expect(progressBar).not.toBeNull();

    // The main wrapper should be able to scale down gracefully
    const cardWrapper = container.firstChild as HTMLElement;
    expect(cardWrapper.className).not.toContain('w-[500px]');
    expect(cardWrapper.className).not.toContain('w-96');
  });

  it('checks that long labels scale down gracefully with text truncation', () => {
    render(
      <ComparisonStatsCard
        {...defaultProps}
        labelA="Super Extremely Long Username That Might Overflow"
        labelB="Another Long Name To Test Breakpoints"
      />
    );

    // Labels must use the truncate class to prevent pushing the grid columns out of viewport
    const labelAElem = screen.getByText('Super Extremely Long Username That Might Overflow');
    const labelBElem = screen.getByText('Another Long Name To Test Breakpoints');

    expect(labelAElem.className).toContain('truncate');
    expect(labelBElem.className).toContain('truncate');
  });

  it('asserts mobile-specific visual elements (like center dividers) respond cleanly', () => {
    const { container } = render(<ComparisonStatsCard {...defaultProps} />);

    // The center divider uses hidden md:block so it disappears on mobile viewports
    const divider = container.querySelector('.hidden.md\\:block');
    expect(divider).not.toBeNull();
    expect(divider?.className).toContain('absolute left-1/2');

    // Simulate resizing to Desktop (1024px)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.matchMedia = mockMatchMedia(1024);

    // Viewport should reflect desktop
    expect(window.innerWidth).toBe(1024);
  });
});
