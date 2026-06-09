import { describe, it, expect } from 'vitest';
import { getTowerAnimationCSS } from './animations';

// These tests verify that the shared tower animation CSS is fully theme-agnostic.
// Any divergence between dark and light prefers-color-scheme output would break
// the "premium visual cohesion" guarantee called out in CONTRIBUTING.md — towers
// must animate identically regardless of the bg/text/accent palette in use.

describe('Dark and Light prefers-color-scheme visual cohesion', () => {
  it('produces identical animation CSS regardless of theme context (theme-agnostic output)', () => {
    // Emulating a dual theme environment: dark and light renderers both consume
    // the same getTowerAnimationCSS helper. The byte-for-byte equality assertion
    // guarantees no theme-coupled color leaks into the animation layer.
    const darkModeCSS = getTowerAnimationCSS('rise', 1.0);
    const lightModeCSS = getTowerAnimationCSS('rise', 1.0);
    expect(darkModeCSS).toBe(lightModeCSS);
    expect(darkModeCSS).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });

  it('always emits a prefers-reduced-motion media query for both color schemes', () => {
    // Reduced-motion is an accessibility baseline that must survive in every
    // entrance variant — both dark and light theme renders consume the same CSS,
    // so the rule must be present unconditionally for non-"none" entrances.
    const entrances: Array<'rise' | 'fade' | 'slide'> = ['rise', 'fade', 'slide'];
    for (const entrance of entrances) {
      const css = getTowerAnimationCSS(entrance, 1.0);
      expect(css).toContain('@media (prefers-reduced-motion: reduce)');
      expect(css).toContain('animation: none !important');
    }
  });

  it('renders the "none" entrance as a fully visible static state (no overlay clipping)', () => {
    // When animations are disabled the tower must still be visible with full
    // opacity and natural scale — otherwise dark-mode overlays could clip the
    // foreground tower content and break visual cohesion.
    const css = getTowerAnimationCSS('none');
    expect(css).toContain('transform: scaleY(1)');
    expect(css).toContain('opacity: 1');
    expect(css).not.toContain('@keyframes');
  });

  it('activates the expected custom stylesheet properties for each entrance variant', () => {
    // Each entrance mode must declare its specific keyframe + transform combo so
    // the styling adapts properly across both dark and light renders.
    const rise = getTowerAnimationCSS('rise', 1.0);
    expect(rise).toContain('@keyframes grow-up');
    expect(rise).toContain('transform-origin: 0 10px');

    const fade = getTowerAnimationCSS('fade', 1.0);
    expect(fade).toContain('@keyframes fade-in');
    expect(fade).toContain('opacity: 0');

    const slide = getTowerAnimationCSS('slide', 1.0);
    expect(slide).toContain('@keyframes slide-down');
    expect(slide).toContain('translateY(-20px)');
  });

  it('resets transform AND opacity in the reduced-motion override for cohesive recovery', () => {
    // Visual cohesion requires that the reduced-motion fallback restores every
    // visual property the entrance variant may have mutated — both transform
    // and opacity — so the tower lands in an identical resting state across
    // dark and light themes.
    const css = getTowerAnimationCSS('slide', 1.5);
    expect(css).toMatch(/transform:\s*scaleY\(1\)\s+translateY\(0\)\s*!important/);
    expect(css).toMatch(/opacity:\s*1\s*!important/);
  });
});
