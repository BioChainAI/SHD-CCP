// 64-bit Einstein Tile (RFC 01, draft layout): Form ID bits 36-39, South Halo bits 56-63.

export const TILE_MASK = (1n << 64n) - 1n;
export const FORM_ID_SHIFT = 36n;
export const FORM_ID_MASK = 0xfn << FORM_ID_SHIFT;
export const SOUTH_HALO_SHIFT = 56n;
export const SOUTH_HALO_MASK = 0xffn << SOUTH_HALO_SHIFT;
export const PAYLOAD_MASK = TILE_MASK & ~(FORM_ID_MASK | SOUTH_HALO_MASK);

function checkTile(tile) {
  if (typeof tile !== "bigint" || tile < 0n || tile > TILE_MASK) {
    throw new RangeError(`tile must be a u64 bigint, got ${tile}`);
  }
  return tile;
}

export const formId = (tile) => Number((checkTile(tile) >> FORM_ID_SHIFT) & 0xfn);
export const southHalo = (tile) => Number(checkTile(tile) >> SOUTH_HALO_SHIFT);
export const payload = (tile) => checkTile(tile) & PAYLOAD_MASK;

export function pack(form, halo, body) {
  if (!Number.isInteger(form) || form < 0 || form > 0xf) throw new RangeError(`form id out of range: ${form}`);
  if (!Number.isInteger(halo) || halo < 0 || halo > 0xff) throw new RangeError(`south halo out of range: ${halo}`);
  if ((body & ~PAYLOAD_MASK) !== 0n) throw new RangeError("payload overlaps reserved bits");
  return (BigInt(halo) << SOUTH_HALO_SHIFT) | (BigInt(form) << FORM_ID_SHIFT) | body;
}
