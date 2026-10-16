import { writeFile } from 'node:fs/promises';

// `contents` is a view (a Buffer or Uint8Array) that can share a larger
// ArrayBuffer, such as a slab of Node's buffer pool. Writing the view itself
// writes exactly its bytes; wrapping `contents.buffer` would write the whole
// slab around them.
export async function writeSaveFile(
  filePath: string,
  contents: string | Uint8Array,
): Promise<void> {
  await writeFile(filePath, contents);
}
