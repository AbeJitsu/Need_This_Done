import { fireEvent, render, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LivePageCheck from '@/components/home/LivePageCheck';

expect.extend(toHaveNoViolations);

const result = {
  page: { id: 'work', label: 'Selected work', path: '/work' },
  checkedAt: '2026-09-25T16:00:00.000Z',
  title: 'Selected Work | NeedThisDone',
  mainHeading: 'Working features and real projects.',
  headings: [{ tag: 'h1', text: 'Working features and real projects.' }],
  links: 12,
  checks: [{ label: 'Page title', passed: true, detail: 'A descriptive browser tab title is present.' }],
};

describe('live portfolio page check', () => {
  afterEach(() => vi.restoreAllMocks());

  it('lets a visitor select a page and see an accessible server response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    }));
    const view = render(<LivePageCheck />);
    expect(await axe(view.container)).toHaveNoViolations();
    fireEvent.click(view.getByRole('button', { name: /Selected work/ }));
    expect(view.getByRole('button', { name: /Selected work/ })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(view.getByRole('button', { name: 'Run live check' }));

    await waitFor(() => expect(view.getByText('Selected Work | NeedThisDone')).toBeVisible());
    expect(fetchMock).toHaveBeenCalledWith('/api/portfolio/page-check?page=work');
    expect(view.getByText('12 links found', { exact: false })).toBeVisible();
    expect(await axe(view.container)).toHaveNoViolations();
  });

  it('keeps a useful retry path when the server is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'Please try again shortly.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    }));
    const view = render(<LivePageCheck />);
    fireEvent.click(view.getByRole('button', { name: 'Run live check' }));
    expect(await view.findByRole('alert')).toHaveTextContent('Please try again shortly.');
    expect(view.getByRole('button', { name: 'Run live check' })).toBeEnabled();
  });
});
