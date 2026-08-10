import assert from 'node:assert/strict';
import test from 'node:test';
import { extractUrls } from '../lib.js';

test('extracts Markdown, HTML, and plain-text URLs', () => {
  const markdown = [
    '[Example](https://example.com/docs)',
    '<a href="https://example.com/html">HTML</a>',
    'Read https://example.com/plain.',
  ].join('\n');

  assert.deepEqual(extractUrls(markdown), [
    'https://example.com/docs',
    'https://example.com/html',
    'https://example.com/plain',
  ]);
});

test('keeps matched parentheses that are part of an URL', () => {
  assert.deepEqual(
    extractUrls('[Wikipedia](https://en.wikipedia.org/wiki/Function_(mathematics))'),
    ['https://en.wikipedia.org/wiki/Function_(mathematics)'],
  );
});

test('ignores URLs inside inline and fenced code blocks', () => {
  const markdown = [
    '`https://ignored.example/inline`',
    '```text',
    'https://ignored.example/fenced',
    '```',
    'https://kept.example/',
  ].join('\n');

  assert.deepEqual(extractUrls(markdown), ['https://kept.example/']);
});

test('deduplicates URLs and removes terminal Markdown punctuation', () => {
  assert.deepEqual(
    extractUrls('https://example.com/path). https://example.com/path'),
    ['https://example.com/path'],
  );
});
