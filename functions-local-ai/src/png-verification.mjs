import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) { value ^= byte; for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0); }
  return (value ^ 0xffffffff) >>> 0;
}

export function verifyPng(bytes, width, height) {
  if (bytes.length > 8 * 1024 * 1024 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error('Output is not a PNG.');
  let offset = 8, header, ended = false; const data = [];
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset), end = offset + 12 + length;
    if (end > bytes.length) throw Error('Truncated PNG.');
    const kind = bytes.toString('ascii', offset + 4, offset + 8), content = bytes.subarray(offset + 8, end - 4);
    if (crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) throw Error('PNG integrity check failed.');
    if (!header && kind !== 'IHDR') throw Error('PNG header is missing.');
    if (kind === 'IHDR') { if (header || length !== 13) throw Error('Invalid PNG header.'); header = content; }
    if (kind === 'IDAT') data.push(content);
    if (kind === 'IEND') { if (length || end !== bytes.length) throw Error('Invalid PNG ending.'); ended = true; break; }
    offset = end;
  }
  if (!header || !ended || !data.length || header.readUInt32BE(0) !== width || header.readUInt32BE(4) !== height || header[8] !== 8 || ![2,6].includes(header[9]) || header[10] || header[11] || header[12]) throw Error('PNG dimensions or encoding do not match the approved preset.');
  const stride = width * (header[9] === 6 ? 4 : 3) + 1;
  const decoded = inflateSync(Buffer.concat(data), { maxOutputLength: stride * height });
  if (decoded.length !== stride * height) throw Error('Incomplete PNG pixels.');
  for (let y = 0; y < height; y++) if (decoded[y * stride] > 4) throw Error('Invalid PNG pixel filter.');
  return { width, height, size: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), mimeType: 'image/png' };
}
