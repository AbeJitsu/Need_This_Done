import { fireEvent, render, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ContactPage from '@/app/contact/page';

vi.mock('@/lib/engagement', () => ({ recordEngagement: vi.fn() }));

const { searchParams } = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams }));
expect.extend(toHaveNoViolations);

describe('conversation form', () => {
  beforeEach(() => {
    searchParams.delete('offer');
    searchParams.delete('offering');
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
  });

  it('exposes a concise accessible form', async () => {
    const { container, getByRole, getByLabelText, getByText } = render(<ContactPage />);
    expect(getByRole('heading', { name: /what are you building or trying to fix/i })).toBeVisible();
    expect(getByLabelText(/^Your message/)).toBeRequired();
    expect(getByLabelText('Your name')).toBeRequired();
    expect(getByLabelText('Your email')).toBeRequired();
    expect(getByText('Is there a useful starting point?')).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('preselects a legacy offer alias without making it required', async () => {
    searchParams.set('offer', 'website-fix');
    const view = render(<ContactPage />);
    await waitFor(() => expect(view.getByRole('radio', { name: 'Website work', exact: true })).toBeChecked());
    expect(view.getByRole('radio', { name: 'Not sure yet', exact: true })).not.toBeChecked();
    fireEvent.click(view.getByRole('radio', { name: 'Not sure yet', exact: true }));
    expect(view.getByRole('radio', { name: 'Not sure yet', exact: true })).toBeChecked();
  });

  it('submits the plain message API contract and recovers from errors', async () => {
    const view = render(<ContactPage />);
    fireEvent.change(view.getByLabelText(/^Your message/), { target: { value: 'I need help connecting a dashboard to durable project data.' } });
    fireEvent.change(view.getByLabelText('Your name'), { target: { value: 'Alex' } });
    fireEvent.change(view.getByLabelText('Your email'), { target: { value: 'alex@example.com' } });

    vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));
    fireEvent.click(view.getByRole('button', { name: 'Start a conversation', exact: true }));
    expect(await view.findByRole('alert')).toHaveTextContent('offline');
    expect(view.getByLabelText(/^Your message/)).toHaveValue('I need help connecting a dashboard to durable project data.');

    vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }));
    fireEvent.click(view.getByRole('button', { name: 'Start a conversation', exact: true }));
    await waitFor(() => expect(view.getByRole('heading', { name: 'Thanks for reaching out.' })).toBeVisible());
    const submission = [...vi.mocked(fetch).mock.calls].reverse().find(([url]) => url === '/api/projects');
    const body = submission?.[1]?.body as FormData;
    expect(body.get('message')).toBe('I need help connecting a dashboard to durable project data.');
    expect(body.get('intakeContext')).toBeNull();
    expect(await axe(view.container)).toHaveNoViolations();
  });
});
