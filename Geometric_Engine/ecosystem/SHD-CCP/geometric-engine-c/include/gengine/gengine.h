/*
 * libgengine — SHD-CCP Geometric Engine, C99/C11 binding.
 *
 * Conforms to geometric-engine-spec test vectors:
 *   einstein_tiles_forms_0_15 (draft), garner_crt_881_883_887, gram_tqf_collinearity.
 */
#ifndef GENGINE_H
#define GENGINE_H

#include <stdbool.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define GENGINE_SPEC_VERSION "0.1.0"

/* ── 64-bit Einstein Tile (RFC 01, draft layout) ────────────────────────── */

typedef uint64_t ge_tile_t;

#define GE_FORM_ID_SHIFT    36
#define GE_FORM_ID_MASK     ((uint64_t)0xF << GE_FORM_ID_SHIFT)
#define GE_SOUTH_HALO_SHIFT 56
#define GE_SOUTH_HALO_MASK  ((uint64_t)0xFF << GE_SOUTH_HALO_SHIFT)
#define GE_PAYLOAD_MASK     (~(GE_FORM_ID_MASK | GE_SOUTH_HALO_MASK))

static inline unsigned ge_tile_form_id(ge_tile_t t) { return (unsigned)((t >> GE_FORM_ID_SHIFT) & 0xF); }
static inline unsigned ge_tile_south_halo(ge_tile_t t) { return (unsigned)(t >> GE_SOUTH_HALO_SHIFT); }
static inline uint64_t ge_tile_payload(ge_tile_t t) { return t & GE_PAYLOAD_MASK; }

/* Returns false if any argument is out of range or the payload overlaps reserved bits. */
bool ge_tile_pack(unsigned form_id, unsigned south_halo, uint64_t payload, ge_tile_t *out);

/* ── Garner CRT over (881, 883, 887) (RFC 02) ───────────────────────────── */

#define GE_CRT_M 690017701u

/* n must be < GE_CRT_M. */
void ge_crt_encode(uint32_t n, uint16_t residues[3]);
/* Residues must satisfy r[0] < 881, r[1] < 883, r[2] < 887. */
uint32_t ge_crt_decode(const uint16_t residues[3]);

/* ── 128-bit Gram-TQF (RFC 02) ──────────────────────────────────────────── */

/* Coordinates must satisfy |c| <= GE_TQF_COORD_MAX for the result to be exact. */
#define GE_TQF_COORD_MAX (INT64_C(1) << 20)

typedef struct {
    int64_t x, y;
} ge_point_t;

/* A = (Q1+Q2+Q3)^2 - 2(Q1^2+Q2^2+Q3^2) = 16 * area^2, exact in __int128. */
unsigned __int128 ge_gram_tqf(ge_point_t p1, ge_point_t p2, ge_point_t p3);

static inline bool ge_is_collinear(ge_point_t p1, ge_point_t p2, ge_point_t p3) {
    return ge_gram_tqf(p1, p2, p3) == 0;
}

#ifdef __cplusplus
}
#endif

#endif /* GENGINE_H */
