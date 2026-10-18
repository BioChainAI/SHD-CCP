#include "gengine/gengine.h"

/* C12 = 881^-1 mod 883, C123 = (881 * 883)^-1 mod 887. */
#define C12 441u
#define C123 37u

void ge_crt_encode(uint32_t n, uint16_t residues[3]) {
    residues[0] = (uint16_t)(n % 881u);
    residues[1] = (uint16_t)(n % 883u);
    residues[2] = (uint16_t)(n % 887u);
}

uint32_t ge_crt_decode(const uint16_t residues[3]) {
    uint32_t r1 = residues[0], r2 = residues[1], r3 = residues[2];
    uint32_t v2 = ((r2 + 883u - r1 % 883u) % 883u) * C12 % 883u;
    uint32_t t = (r1 + 881u * v2) % 887u;
    uint32_t v3 = ((r3 + 887u - t) % 887u) * C123 % 887u;
    return r1 + 881u * v2 + 777923u * v3;
}
