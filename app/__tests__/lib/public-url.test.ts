import { describe, expect, it } from 'vitest';
import { isPublicIpAddress, parsePublicHttpUrl } from '@/lib/public-url';

const resolvePublic = async () => [{ address: '93.184.216.34' }];

describe('isPublicIpAddress', () => {
  it.each([
    '127.0.0.1',
    '10.0.0.1',
    '100.64.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.1',
    '::1',
    'fc00::1',
    'fe80::1',
    '::ffff:127.0.0.1',
  ])('rejects non-public address %s', (address) => {
    expect(isPublicIpAddress(address)).toBe(false);
  });

  it('accepts a public IPv4 address', () => {
    expect(isPublicIpAddress('93.184.216.34')).toBe(true);
  });
});

describe('parsePublicHttpUrl', () => {
  it('accepts a public HTTP(S) URL', async () => {
    await expect(parsePublicHttpUrl('https://example.com/audit', resolvePublic)).resolves.toMatchObject({
      href: 'https://example.com/audit',
    });
  });

  it.each([
    'ftp://example.com',
    'https://user:password@example.com',
    'http://127.0.0.1',
    'http://169.254.169.254/latest/meta-data',
    'http://[::1]',
    'http://localhost',
    'http://internal.local',
  ])('rejects unsafe target %s', async (value) => {
    await expect(parsePublicHttpUrl(value, resolvePublic)).rejects.toThrow();
  });

  it('rejects a hostname that resolves to any private address', async () => {
    await expect(
      parsePublicHttpUrl('https://example.com', async () => [
        { address: '93.184.216.34' },
        { address: '10.0.0.8' },
      ])
    ).rejects.toThrow('publicly reachable');
  });

  it('rejects an unresolvable hostname', async () => {
    await expect(
      parsePublicHttpUrl('https://example.com', async () => {
        throw new Error('not found');
      })
    ).rejects.toThrow('could not be resolved');
  });
});
