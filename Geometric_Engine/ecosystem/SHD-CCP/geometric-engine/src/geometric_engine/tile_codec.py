"""Reference 64-bit Einstein Tile pack/unpack (RFC 01).

DRAFT LAYOUT. Only two fields are pinned so far:

    bits 56-63  South Halo  (top byte; cheap L1 pre-filter via ``tile >> 56``)
    bits 36-39  Form ID     (0-15, master routing switch)

Every other bit is reported as an opaque ``payload`` until RFC 01 fixes the
Gate Byte and the per-Form field structures.
"""

TILE_BITS = 64
TILE_MASK = (1 << TILE_BITS) - 1

FORM_ID_SHIFT = 36
FORM_ID_MASK = 0xF << FORM_ID_SHIFT

SOUTH_HALO_SHIFT = 56
SOUTH_HALO_MASK = 0xFF << SOUTH_HALO_SHIFT

PAYLOAD_MASK = TILE_MASK & ~(FORM_ID_MASK | SOUTH_HALO_MASK)


def _check_tile(tile: int) -> int:
    if not 0 <= tile <= TILE_MASK:
        raise ValueError(f"tile out of range for u64: {tile!r}")
    return tile


def form_id(tile: int) -> int:
    return (_check_tile(tile) >> FORM_ID_SHIFT) & 0xF


def south_halo(tile: int) -> int:
    return _check_tile(tile) >> SOUTH_HALO_SHIFT


def payload(tile: int) -> int:
    return _check_tile(tile) & PAYLOAD_MASK


def pack(form: int, halo: int, body: int) -> int:
    if not 0 <= form <= 0xF:
        raise ValueError(f"form id out of range: {form}")
    if not 0 <= halo <= 0xFF:
        raise ValueError(f"south halo out of range: {halo}")
    if body & ~PAYLOAD_MASK:
        raise ValueError("payload overlaps reserved Form ID / South Halo bits")
    return (halo << SOUTH_HALO_SHIFT) | (form << FORM_ID_SHIFT) | body


def unpack(tile: int) -> dict:
    return {"form_id": form_id(tile), "south_halo": south_halo(tile), "payload": payload(tile)}
