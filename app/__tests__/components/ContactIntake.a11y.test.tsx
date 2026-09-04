import { fireEvent, render, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ContactPage from '@/app/contact/page';

const { searchParams } = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams }));
expect.extend(toHaveNoViolations);

describe('guided vision intake', () => {
  beforeEach(() => { searchParams.delete('offer'); vi.restoreAllMocks(); vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 })); });

  it('exposes progress semantics and an accessible first step', async () => {
    const { container, getByRole, getByText } = render(<ContactPage />);
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(getByText('Step 1 of 4')).toBeVisible();
    expect(getByRole('textbox', { name: /idea or situation/i })).toBeRequired();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('preserves answers through Back and provides an editable visitor echo', async () => {
    const view = render(<ContactPage />);
    fireEvent.change(view.getByRole('textbox', { name: /idea or situation/i }), { target: { value: 'Requests keep getting lost between inboxes.' } });
    fireEvent.change(view.getByRole('textbox', { name: /pattern that keeps happening/i }), { target: { value: 'Customers follow up more than once.' } });
    fireEvent.click(view.getByRole('button', { name: /continue/i }));
    expect(await view.findByText('Step 2 of 4')).toBeVisible();
    fireEvent.click(view.getByRole('button', { name: /back/i }));
    expect(view.getByRole('textbox', { name: /idea or situation/i })).toHaveValue('Requests keep getting lost between inboxes.');
  });

  it('keeps an offer optional when it is preselected by an alias', async () => {
    searchParams.set('offer', 'website-fix');
    render(<ContactPage />);
    await waitFor(() => expect(searchParams.get('offer')).toBe('website-fix'));
  });
});
