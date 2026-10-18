#include "gengine/gengine.h"

static __int128 quadrance(ge_point_t a, ge_point_t b) {
    __int128 dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

unsigned __int128 ge_gram_tqf(ge_point_t p1, ge_point_t p2, ge_point_t p3) {
    __int128 q1 = quadrance(p2, p3), q2 = quadrance(p1, p3), q3 = quadrance(p1, p2);
    __int128 s = q1 + q2 + q3;
    return (unsigned __int128)(s * s - 2 * (q1 * q1 + q2 * q2 + q3 * q3));
}
