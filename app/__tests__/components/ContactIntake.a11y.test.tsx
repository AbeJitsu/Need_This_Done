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
    fireEvent.change(view.getByRole('textbox', { name: /what keeps happening/i }), { target: { value: 'Customers follow up more than once.' } });
    fireEvent.click(view.getByRole('button', { name: /continue/i }));
    expect(await view.findByText('Step 2 of 4')).toBeVisible();
    fireEvent.click(view.getByRole('button', { name: /back/i }));
    expect(view.getByRole('textbox', { name: /idea or situation/i })).toHaveValue('Requests keep getting lost between inboxes.');
  });

  it('keeps an offer optional when it is preselected by an alias', async () => {
    searchParams.set('offer', 'website-fix');
    const view = render(<ContactPage />);
    fireEvent.click(view.getByRole('button', { name: /^Step 4:/ }));
    await waitFor(() => expect(view.getByRole('radio', { name: 'Website Fix', exact: true })).toBeChecked());
    fireEvent.click(view.getByRole('radio', { name: 'No service selected' }));
    expect(view.getByRole('radio', { name: 'No service selected' })).toBeChecked();
  });
});

describe('discovery review and recovery', () => {
  beforeEach(() => {
    searchParams.delete('offer');
    vi.restoreAllMocks();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
  });

  it('reviews all discovery answers, follows source edits, and preserves a custom confirmation', async () => {
    const view = render(<ContactPage />);
    const go = (n: number) => fireEvent.click(view.getByRole('button', { name: new RegExp('^Step ' + n + ':') }));
    const answer = (name: RegExp, value: string) => fireEvent.change(view.getByRole('textbox', { name }), { target: { value } });
    answer(/idea or situation/i, 'Requests disappear between inboxes.');
    answer(/what keeps happening/i, 'People follow up twice.');
    answer(/past context/i, 'This started last spring.');
    go(2);
    answer(/what have you tried/i, 'A shared inbox. It was confusing.');
    answer(/hoping those attempts/i, 'Keep requests together.');
    answer(/how would you like/i, 'One quiet daily review.');
    answer(/what frustrates/i, 'Please avoid more alerts.');
    fireEvent.click(view.getByRole('radio', { name: 'stuck', exact: true }));
    answer(/describe it yourself/i, 'Tired of checking.');
    go(3);
    answer(/what needs to be different/i, 'Every request has a clear next step.');
    answer(/what might happen next/i, 'We might grow, but people might resist the change.');
    answer(/future you can already picture/i, 'A calm morning.');
    fireEvent.click(view.getByRole('radio', { name: 'clear', exact: true }));
    answer(/describe it yourself/i, 'Ready for the day.');
    go(4);
    for (const value of ['People follow up twice.', 'This started last spring.', 'A shared inbox. It was confusing.', 'Keep requests together.', 'One quiet daily review.', 'Please avoid more alerts.', 'Tired of checking.', 'We might grow, but people might resist the change.', 'A calm morning.', 'Ready for the day.']) {
      expect(view.getByText(value)).toBeVisible();
    }
    expect(view.getByRole('textbox', { name: /change you want us/i })).toHaveValue('Every request has a clear next step.');
    fireEvent.click(view.getByRole('button', { name: 'Edit The change you want', exact: true }));
    answer(/what needs to be different/i, 'Every request has an owner and a next step.');
    go(4);
    expect(view.getByRole('textbox', { name: /change you want us/i })).toHaveValue('Every request has an owner and a next step.');
    answer(/change you want us/i, 'Help us agree on a daily review.');
    go(3);
    answer(/what needs to be different/i, 'Make every next step visible.');
    go(4);
    expect(view.getByRole('textbox', { name: /change you want us/i })).toHaveValue('Help us agree on a daily review.');
    expect(view.getByRole('radio', { name: 'No service selected' })).toBeChecked();
    expect(await axe(view.container)).toHaveNoViolations();
    answer(/^name$/i, 'Alex');
    answer(/^email$/i, 'alex@example.com');
    vi.mocked(fetch).mockImplementation(async (url) => {
      if (url === '/api/projects') throw new Error('offline');
      return new Response('{}', { status: 200 });
    });
    fireEvent.click(view.getByRole('button', { name: 'Share Your Vision', exact: true }));
    expect(await view.findByRole('alert')).toHaveTextContent('Your answers are still here');
    expect(view.getByRole('textbox', { name: /change you want us/i })).toHaveValue('Help us agree on a daily review.');
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 200 }));
    fireEvent.click(view.getByRole('button', { name: 'Share Your Vision', exact: true }));
    await view.findByRole('heading', { name: 'Thank you for sharing it.' });
    const submission = [...vi.mocked(fetch).mock.calls].reverse().find(([url]) => url === '/api/projects');
    const body = submission?.[1]?.body as FormData;
    expect(JSON.parse(String(body.get('intakeContext')))).toMatchObject({
      version: 1, petPeeves: 'Please avoid more alerts.', offer: null,
      sharedPurpose: 'Help us agree on a daily review.',
    });
  });

  it('explains missing answers after direct navigation without discarding entries', async () => {
    const view = render(<ContactPage />);
    fireEvent.click(view.getByRole('button', { name: /^Step 4:/ }));
    fireEvent.change(view.getByRole('textbox', { name: /change you want us/i }), { target: { value: 'Keep every request visible.' } });
    fireEvent.change(view.getByRole('textbox', { name: /^name$/i }), { target: { value: 'Alex' } });
    fireEvent.change(view.getByRole('textbox', { name: /^email$/i }), { target: { value: 'alex@example.com' } });
    fireEvent.click(view.getByRole('button', { name: 'Share Your Vision', exact: true }));
    expect(await view.findByRole('alert')).toHaveTextContent('Please check your answers');
    expect(view.getByText('Step 1 of 4')).toBeVisible();
  });
});

it('explains the combined message limit and allows recovery without losing answers', async () => {
  const view = render(<ContactPage />);
  const go = (n: number) => fireEvent.click(view.getByRole('button', { name: new RegExp('^Step ' + n + ':') }));
  const answer = (name: RegExp, value: string) => fireEvent.change(view.getByRole('textbox', { name }), { target: { value } });
  answer(/idea or situation/i, 's'.repeat(1200));
  answer(/what keeps happening/i, 'r'.repeat(800));
  go(2);
  answer(/what have you tried/i, 'p'.repeat(1000));
  answer(/what frustrates/i, 'f'.repeat(800));
  go(3);
  answer(/what needs to be different/i, 'd'.repeat(1200));
  go(4);
  answer(/^name$/i, 'Alex');
  answer(/^email$/i, 'alex@example.com');
  fireEvent.click(view.getByRole('button', { name: 'Share Your Vision', exact: true }));
  expect(await view.findByRole('alert')).toHaveTextContent('together are too long');
  fireEvent.click(view.getByRole('button', { name: 'Edit The change you want', exact: true }));
  answer(/what needs to be different/i, 'A clear next step for each request.');
  go(2);
  answer(/what have you tried/i, '');
  go(4);
  expect(view.getByText('f'.repeat(800))).toBeVisible();
  expect(view.queryByRole('alert')).toBeNull();
});
