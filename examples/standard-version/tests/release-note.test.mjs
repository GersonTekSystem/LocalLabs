import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatReleaseNote } from '../dist/release-note.js';

test('resume uma descrição de entrega e recusa textos vazios', () => {
  assert.equal(formatReleaseNote('  Nova funcionalidade  '), 'Entrega: Nova funcionalidade');
  assert.throws(() => formatReleaseNote('   '), /descrição/);
});
