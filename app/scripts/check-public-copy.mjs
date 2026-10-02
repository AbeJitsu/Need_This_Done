import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const emDash = /\u2014|&mdash;|&#(?:0*8212|x0*2014);/i;

/** Inspect rendered text and decoded literals, not developer comments. */
export function findEmDashes(source, filename) {
  const findings = [];
  const syntax = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const record = (text, offset) => {
    if (!emDash.test(text)) return;
    const { line, character } = syntax.getLineAndCharacterOfPosition(offset);
    findings.push({ file: filename, line: line + 1, column: character + 1 });
  };

  if (/\.(?:svg|html|css)$/i.test(filename)) {
    const clean = source.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g, match => ' '.repeat(match.length));
    if (/\.css$/i.test(filename)) {
      for (const match of clean.matchAll(/(["'])(?:\\.|(?!\1)[\s\S])*?\1/g)) {
        record(match[0].replace(/\\0*2014\s?/gi, '\u2014'), match.index);
      }
    } else {
      const pattern = new RegExp(emDash.source, 'gi');
      for (const match of clean.matchAll(pattern)) record(match[0], match.index);
    }
    return findings;
  }

  const visit = node => {
    if (ts.isStringLiteralLike(node) || ts.isJsxText(node)
      || node.kind === ts.SyntaxKind.TemplateHead
      || node.kind === ts.SyntaxKind.TemplateMiddle
      || node.kind === ts.SyntaxKind.TemplateTail) {
      record(node.text, node.getStart(syntax));
    }
    ts.forEachChild(node, visit);
  };
  visit(syntax);
  return findings;
}

/** Discover new application files automatically so new pages inherit the rule. */
export function auditApplicationCopy(root = appRoot) {
  const findings = [];
  const walk = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (/\.(?:tsx?|jsx?|json|svg|html|css)$/i.test(entry.name)) {
        findings.push(...findEmDashes(readFileSync(path, 'utf8'), relative(root, path)));
      }
    }
  };
  for (const directory of ['app', 'components', 'lib', 'content', 'public']) {
    walk(join(root, directory));
  }
  return findings;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const findings = auditApplicationCopy();
  if (findings.length) {
    console.error('Em dashes are prohibited in application copy. Use a sentence, comma, or ordinary hyphen.');
    for (const finding of findings) console.error(`${finding.file}:${finding.line}:${finding.column}`);
    process.exitCode = 1;
  } else {
    console.log('Application copy check passed: no em dashes.');
  }
}
