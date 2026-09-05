import { fireEvent, render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import PublicHeader from '@/components/public/PublicHeader';
const route = vi.hoisted(() => ({ pathname: '/services' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
expect.extend(toHaveNoViolations);

it('marks the current route, returns focus on Escape, and closes on route changes', async () => {
  route.pathname = '/services';
  const view = render(<PublicHeader />);
  const trigger = view.getByRole('button', { name: 'Open navigation menu' });
  fireEvent.click(trigger);
  expect(view.getAllByRole('link', { name: 'What We Do' }).every(link => link.getAttribute('aria-current') === 'page')).toBe(true);
  view.getAllByRole('link', { name: 'What We Do' })[1].focus();
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(trigger).toHaveFocus();
  expect(view.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull();
  fireEvent.click(trigger);
  route.pathname = '/work';
  view.rerender(<PublicHeader />);
  expect(view.queryByRole('navigation', { name: 'Mobile navigation' })).toBeNull();
  expect(view.getByRole('link', { name: 'Examples' })).toHaveAttribute('aria-current', 'page');
  expect(await axe(view.container)).toHaveNoViolations();
});
