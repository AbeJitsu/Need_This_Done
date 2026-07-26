import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

type ResolvedAddress = { address: string };
type ResolveHostname = (hostname: string) => Promise<ResolvedAddress[]>;

const resolveHostname: ResolveHostname = async (hostname) =>
  lookup(hostname, { all: true, verbatim: true });

function isPrivateIpv4(address: string): boolean {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return true;
  }

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && (second === 0 || second === 168)) ||
    (first === 198 && (second === 18 || second === 19)) ||
    first >= 224
  );
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();

  if (normalized === '::' || normalized === '::1') return true;

  // IPv4-mapped IPv6 addresses must obey the IPv4 rules too.
  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedIpv4) return isPrivateIpv4(mappedIpv4[1]);

  return (
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('ff')
  );
}

export function isPublicIpAddress(address: string): boolean {
  const normalized = address.replace(/^\[|\]$/g, '');
  const family = isIP(normalized);

  if (family === 4) return !isPrivateIpv4(normalized);
  if (family === 6) return !isPrivateIpv6(normalized);
  return false;
}

/**
 * Parses a URL that is safe for the server-side site analyzer to request.
 *
 * A hostname must resolve only to public IP addresses. Call this before every
 * request, including redirects, so a public-looking hostname cannot direct the
 * analyzer to loopback, private, link-local, or metadata-network addresses.
 */
export async function parsePublicHttpUrl(
  value: string,
  resolve: ResolveHostname = resolveHostname
): Promise<URL> {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Enter a valid website URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('URL must start with http:// or https://.');
  }

  if (url.username || url.password) {
    throw new Error('Website URLs cannot include credentials.');
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Enter a publicly reachable website URL.');
  }

  if (isIP(hostname)) {
    if (!isPublicIpAddress(hostname)) {
      throw new Error('Enter a publicly reachable website URL.');
    }
    return url;
  }

  let addresses: ResolvedAddress[];
  try {
    addresses = await resolve(hostname);
  } catch {
    throw new Error('Website hostname could not be resolved.');
  }

  if (addresses.length === 0 || addresses.some(({ address }) => !isPublicIpAddress(address))) {
    throw new Error('Enter a publicly reachable website URL.');
  }

  return url;
}
