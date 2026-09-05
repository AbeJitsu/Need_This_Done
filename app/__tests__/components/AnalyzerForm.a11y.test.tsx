import { fireEvent, render, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AnalyzerForm from '@/components/site-analyzer/AnalyzerForm';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
expect.extend(toHaveNoViolations);

beforeEach(() => { vi.restoreAllMocks(); push.mockClear(); });

it('labels inputs and announces validation before sending', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  const view = render(<AnalyzerForm />);
  fireEvent.click(view.getByRole('button'));
  expect(view.getByRole('alert')).toHaveTextContent('Enter a website address');
  expect(fetch).not.toHaveBeenCalled();
  expect(view.getByRole('textbox', { name: 'Website URL' })).toBeRequired();
  expect(await axe(view.container)).toHaveNoViolations();
});

it('shows truthful pending feedback, prevents duplicates, and opens the returned report', async () => {
  let finish!: (response: Response) => void;
  const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const view = render(<AnalyzerForm />);
  fireEvent.change(view.getByRole('textbox', { name: 'Website URL' }), { target: { value: 'example.com' } });
  fireEvent.change(view.getByRole('textbox', { name: 'Email address' }), { target: { value: 'owner@example.com' } });
  fireEvent.click(view.getByRole('button'));
  expect(view.getByRole('status')).toHaveTextContent('Your request is being processed');
  expect(view.getByRole('button')).toBeDisabled();
  fireEvent.submit(view.container.querySelector('form')!);
  expect(fetch).toHaveBeenCalledTimes(1);
  finish(new Response(JSON.stringify({ redirectUrl: '/report/test-report' }), { status: 200 }));
  await waitFor(() => expect(push).toHaveBeenCalledWith('/report/test-report'));
});

it.each([429, 500])('preserves entries and permits retry after status %s', async status => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status }));
  const view = render(<AnalyzerForm />);
  fireEvent.change(view.getByRole('textbox', { name: 'Website URL' }), { target: { value: 'example.com' } });
  fireEvent.change(view.getByRole('textbox', { name: 'Email address' }), { target: { value: 'owner@example.com' } });
  fireEvent.click(view.getByRole('button'));
  expect(await view.findByRole('alert')).toHaveTextContent(status === 429 ? 'tomorrow' : 'try again');
  expect(view.getByRole('textbox', { name: 'Website URL' })).toHaveValue('example.com');
  expect(view.getByRole('textbox', { name: 'Email address' })).toHaveValue('owner@example.com');
  expect(view.getByRole('button')).toBeEnabled();
});

it('announces an invalid email and recovers from a connection failure', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
  const view = render(<AnalyzerForm />);
  fireEvent.change(view.getByRole('textbox', { name: 'Website URL' }), { target: { value: 'example.com' } });
  fireEvent.click(view.getByRole('button'));
  expect(view.getByRole('alert')).toHaveTextContent('Enter an email address');
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(view.getByRole('textbox', { name: 'Email address' }), { target: { value: 'owner@example.com' } });
  fireEvent.click(view.getByRole('button'));
  expect(await view.findByRole('alert')).toHaveTextContent('could not connect');
  expect(view.getByRole('button')).toBeEnabled();
});
