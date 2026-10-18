# RFC 01: 64-bit Einstein Tile

| | |
| :--- | :--- |
| **Status** | Draft: layout NOT frozen |
| **Spec version** | 0.1.0 |
| **Vectors** | `einstein_tiles_forms_0_15` (draft) |
| **Reference** | `SHD-CCP/geometric-engine` `tile_codec.py` |

Key words MUST, SHOULD and MAY follow RFC 2119.

## Scope

The 64-bit wire word that every SHD-CCP system speaks: the South Halo, the Gate Byte and Forms 0–15 (monograph §6.1).

## Pinned fields

So far only these fields have a fixed position. Bit 0 is the least significant bit.

| Bits | Field | Width | Notes |
| :--- | :--- | ---: | :--- |
| 56–63 | **South Halo** | 8 | `tile >> 56` gives a one-instruction L1 pre-filter |
| 36–39 | **Form ID** | 4 | Master routing switch, Forms 0–15 |
| all other bits | payload | 52 | Opaque until the per-Form layouts below are specified |

Conforming decoders MUST extract `form_id = (tile >> 36) & 0xF` and `south_halo = tile >> 56`, and MUST treat `tile & 0x00FF_FF0F_FFFF_FFFF` as the payload.

## Open items before this RFC can become normative

- [ ] Position and semantics of the **Gate Byte**
- [ ] Per-Form field structures for Forms 0–15. Known so far: Forms 0–2 standard scaling, Form 3 high-precision lossless correction, Form 5 geometric pointer / codex amplification.
- [ ] Form 1 prime certification against the static 2,017-byte prime bitmap
- [ ] Replace `payload` in the vectors with the decoded per-Form fields

Changing a pinned field after this RFC becomes normative requires a major spec version.
