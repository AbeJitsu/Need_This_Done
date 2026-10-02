import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { auditApplicationCopy, findEmDashes } from '../scripts/check-public-copy.mjs';

describe('production copy punctuation', () => {
  it('runs the copy check before the production build', () => {
    const { scripts } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(scripts.build).toMatch(/^npm run check:public-copy && /);
    expect(scripts['check:public-copy']).toBe('node scripts/check-public-copy.mjs');
  });
  it.each([
    ['literal JSX', '<p>Build\u2014and learn.</p>', 'page.tsx'],
    ['escaped string', String.raw`const title = "Build\u2014and learn";`, 'copy.ts'],
    ['escaped code point', String.raw`const title = "Build\u{2014}and learn";`, 'copy.ts'],
    ['template fragment', 'const title = `Build${name}\u2014and learn`;', 'copy.ts'],
    ['HTML entity', '<p>Build&mdash;and learn.</p>', 'page.tsx'],
    ['decimal entity', '<p>Build&#8212;and learn.</p>', 'page.tsx'],
    ['hex entity', '<p>Build&#x2014;and learn.</p>', 'page.tsx'],
    ['JSON content', '{"title":"Build\u2014and learn"}', 'posts.json'],
    ['SVG text', '<svg><text>Build&mdash;and learn</text></svg>', 'share.svg'],
    ['CSS content', String.raw`.label::after { content: "\2014"; }`, 'style.css'],
  ])('catches %s with a source location', (_name, source, path) => {
    expect(findEmDashes(source, path)).toEqual([
      expect.objectContaining({ file: path, line: 1, column: expect.any(Number) }),
    ]);
  });

  it('allows ordinary punctuation and ignores developer comments', () => {
    const source = '// A developer comment\u2014not rendered\nconst copy = "Build, test, and learn - together.";\n/* More\u2014comments */\nconst view = <p>React-based examples.</p>;';
    expect(findEmDashes(source, 'page.tsx')).toEqual([]);
    expect(findEmDashes('/* A comment\u2014only */ .label { color: green; }', 'style.css')).toEqual([]);
  });

  it('keeps all shipped application copy and metadata free of em dashes', () => {
    expect(auditApplicationCopy(), 'Replace the punctuation at each reported file and line.').toEqual([]);
  });
});
