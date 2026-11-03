#include <stdio.h>

#include "gengine/gengine.h"

static int failures;
#define CHECK(cond) do { if (!(cond)) { fprintf(stderr, "%s:%d: CHECK(%s)\n", __FILE__, __LINE__, #cond); failures++; } } while (0)

int main(void) {
    ge_tile_t t;
    CHECK(ge_tile_pack(5, 0xA5, 0x0123456789ull, &t));
    CHECK(ge_tile_form_id(t) == 5 && ge_tile_south_halo(t) == 0xA5 && ge_tile_payload(t) == 0x0123456789ull);
    CHECK(!ge_tile_pack(16, 0, 0, &t));
    CHECK(!ge_tile_pack(0, 0, GE_FORM_ID_MASK, &t));

    for (uint32_t n = 0; n < 200000; n += 7) {
        uint16_t r[3];
        ge_crt_encode(n, r);
        CHECK(ge_crt_decode(r) == n);
    }
    uint16_t top[3];
    ge_crt_encode(GE_CRT_M - 1, top);
    CHECK(ge_crt_decode(top) == GE_CRT_M - 1);

    ge_point_t o = {0, 0}, a = {3, 0}, b = {0, 4};
    CHECK(ge_gram_tqf(o, a, b) == 576);
    CHECK(ge_is_collinear((ge_point_t){0, 0}, (ge_point_t){2, 2}, (ge_point_t){-5, -5}));

    if (failures == 0) puts("unit: ok");
    return failures != 0;
}
