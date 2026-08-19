import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { enhanceStaggerChildren } from '@/components/motion/StaggerContainer';
import { StaggerItem } from '@/components/motion/StaggerItem';

describe('StaggerContainer child enhancement', () => {
  it('does not pass animation props to native DOM children', () => {
    const child = createElement('div', null, 'plain child');
    const [enhancedChild] = enhanceStaggerChildren([child], 0.08, true) as React.ReactElement[];

    expect(enhancedChild.props.staggerIndex).toBeUndefined();
    expect(enhancedChild.props.staggerDelay).toBeUndefined();
    expect(enhancedChild.props.triggerOnScroll).toBeUndefined();
  });

  it('passes animation props to StaggerItem children', () => {
    const child = createElement(StaggerItem, null, 'animated child');
    const [enhancedChild] = enhanceStaggerChildren([child], 0.08, true) as React.ReactElement[];

    expect(enhancedChild.props.staggerIndex).toBe(0);
    expect(enhancedChild.props.staggerDelay).toBe(0.08);
    expect(enhancedChild.props.triggerOnScroll).toBe(true);
  });
});
