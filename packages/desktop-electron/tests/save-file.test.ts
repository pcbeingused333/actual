import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, test } from 'vitest';

import { writeSaveFile } from '../save-file';

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'actual-save-file-'));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

test('writes only the bytes of a pooled Buffer, not the slab around them', async () => {
  // Small Buffers are carved out of Node's shared pool, like the export
  // contents that reach the save dialog handler.
  Buffer.from('other data in the same slab');
  const contents = Buffer.from('PK\x03\x04 zip bytes');
  assert.ok(contents.buffer.byteLength > contents.byteLength);

  const filePath = join(dir, 'export.zip');
  await writeSaveFile(filePath, contents);

  assert.deepEqual(await readFile(filePath), contents);
});

test('writes only the bytes of a Uint8Array view', async () => {
  const backing = new Uint8Array([9, 9, 1, 2, 3, 9]);
  const contents = new Uint8Array(backing.buffer, 2, 3);

  const filePath = join(dir, 'view.bin');
  await writeSaveFile(filePath, contents);

  assert.deepEqual([...(await readFile(filePath))], [1, 2, 3]);
});

test('writes strings as text', async () => {
  const filePath = join(dir, 'export.csv');
  await writeSaveFile(filePath, 'a,b\n1,2\n');

  assert.equal(await readFile(filePath, 'utf8'), 'a,b\n1,2\n');
});
