import { fireEvent, render, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ContactPage from '@/app/contact/page';

const { searchParams } = vi.hoisted(() => ({
  searchParams: new URLSearchParams('offer=website-improvement'),
}));

vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams }));

expect.extend(toHaveNoViolations);

describe('Contact intake accessibility', () => {
  it('labels the targeted-fix intake and its selected radio option', async () => {
    const { container, getByRole } = render(<ContactPage />);
    expect(getByRole('radio', { name: /targeted fix/i })).toBeChecked();
    expect(getByRole('textbox', { name: /website url/i })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('keeps the automation questions labeled after switching paths', async () => {
    const { getByRole, queryByRole } = render(<ContactPage />);
    await waitFor(() => expect(getByRole('radio', { name: /targeted fix/i })).toBeChecked());
    fireEvent.click(getByRole('radio', { name: /automation system setup/i }));
    await waitFor(() => expect(getByRole('textbox', { name: /where does work get stuck/i })).toBeInTheDocument());
    expect(queryByRole('textbox', { name: /website url/i })).not.toBeInTheDocument();
  });
});
