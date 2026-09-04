import { fireEvent, render, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ContactPage from '@/app/contact/page';

const { searchParams } = vi.hoisted(() => ({ searchParams: new URLSearchParams() }));
vi.mock('next/navigation', () => ({ useSearchParams: () => searchParams }));
expect.extend(toHaveNoViolations);

describe('vision-first contact intake', () => {
  beforeEach(() => {
    searchParams.delete('offer');
    searchParams.delete('offering');
    vi.restoreAllMocks();
  });

  it('renders a general inquiry with optional service selection', async () => {
    const { container, getByRole } = render(<ContactPage />);
    expect(getByRole('textbox', { name: /your vision/i })).toBeRequired();
    expect(getByRole('textbox', { name: /desired outcome/i })).toBeRequired();
    expect(getByRole('textbox', { name: /current obstacle/i })).not.toBeRequired();
    expect(getByRole('radio', { name: /website fix/i })).not.toBeChecked();
    expect(getByRole('radio', { name: /managed automation/i })).not.toBeChecked();
    expect(getByRole('button', { name: /share your vision/i })).toBeEnabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('preselects both retained offer aliases', async () => {
    searchParams.set('offer', 'website-fix');
    const first = render(<ContactPage />);
    await waitFor(() => expect(first.getByRole('radio', { name: /website fix/i })).toBeChecked());
    first.unmount();

    searchParams.set('offer', 'managed-automation');
    const second = render(<ContactPage />);
    await waitFor(() => expect(second.getByRole('radio', { name: /managed automation/i })).toBeChecked());
  });

  it('submits a general inquiry with no service field and shows success', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const { getByRole } = render(<ContactPage />);
    fireEvent.change(getByRole('textbox', { name: /^name$/i }), { target: { value: 'Jordan Owner' } });
    fireEvent.change(getByRole('textbox', { name: /^email$/i }), { target: { value: 'jordan@example.com' } });
    fireEvent.change(getByRole('textbox', { name: /your vision/i }), { target: { value: 'A clearer way for customers to get started.' } });
    fireEvent.change(getByRole('textbox', { name: /desired outcome/i }), { target: { value: 'Customers know the next step.' } });
    fireEvent.click(getByRole('button', { name: /share your vision/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get('service')).toBeNull();
    expect(body.get('message')).toContain('Vision:\nA clearer way for customers to get started.');
    expect(body.get('message')).toContain('Desired outcome:\nCustomers know the next step.');
    expect(await getByRole('heading', { name: /thank you for sharing it/i })).toBeVisible();
  });

  it('submits a preselected service and exposes an error state', async () => {
    searchParams.set('offer', 'website-fix');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }));
    const { getByRole } = render(<ContactPage />);
    fireEvent.change(getByRole('textbox', { name: /^name$/i }), { target: { value: 'Jordan Owner' } });
    fireEvent.change(getByRole('textbox', { name: /^email$/i }), { target: { value: 'jordan@example.com' } });
    fireEvent.change(getByRole('textbox', { name: /your vision/i }), { target: { value: 'A better landing page.' } });
    fireEvent.change(getByRole('textbox', { name: /desired outcome/i }), { target: { value: 'A clearer next action.' } });
    fireEvent.click(getByRole('button', { name: /share your vision/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = fetchMock.mock.calls[0][1]?.body as FormData;
    expect(body.get('service')).toBe('Website Fix');
    expect(await getByRole('alert')).toHaveTextContent(/could not send your vision/i);
  });
});
