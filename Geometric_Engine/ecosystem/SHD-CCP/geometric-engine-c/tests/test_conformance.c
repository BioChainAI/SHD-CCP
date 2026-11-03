/* Runs libgengine against geometric-engine-spec/test_vectors/*.bin (SHDGEV01). */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "gengine/gengine.h"

typedef struct {
    uint32_t fields, count;
    uint64_t *data;
} vectors_t;

static uint64_t le64(const unsigned char *p) {
    uint64_t v = 0;
    for (int i = 7; i >= 0; i--) v = (v << 8) | p[i];
    return v;
}

static uint32_t le32(const unsigned char *p) {
    return (uint32_t)p[0] | (uint32_t)p[1] << 8 | (uint32_t)p[2] << 16 | (uint32_t)p[3] << 24;
}

static int load(const char *dir, const char *suite, uint32_t want_fields, vectors_t *v) {
    char path[4096];
    snprintf(path, sizeof path, "%s/%s.bin", dir, suite);
    FILE *f = fopen(path, "rb");
    if (!f) { perror(path); return -1; }
    unsigned char hdr[16];
    if (fread(hdr, 1, 16, f) != 16 || memcmp(hdr, "SHDGEV01", 8) != 0) {
        fprintf(stderr, "%s: bad header\n", path);
        fclose(f);
        return -1;
    }
    v->fields = le32(hdr + 8);
    v->count = le32(hdr + 12);
    if (v->fields != want_fields) {
        fprintf(stderr, "%s: expected %u fields, got %u\n", path, want_fields, v->fields);
        fclose(f);
        return -1;
    }
    size_t n = (size_t)v->fields * v->count;
    unsigned char *raw = malloc(n * 8);
    v->data = malloc(n * sizeof *v->data);
    if (!raw || !v->data || fread(raw, 8, n, f) != n) {
        fprintf(stderr, "%s: truncated\n", path);
        free(raw);
        fclose(f);
        return -1;
    }
    for (size_t i = 0; i < n; i++) v->data[i] = le64(raw + 8 * i);
    free(raw);
    fclose(f);
    return 0;
}

static int report(const char *suite, uint32_t count, uint32_t bad) {
    printf("%-28s %5u cases  %s\n", suite, count, bad ? "FAIL" : "pass");
    return bad != 0;
}

static int einstein_tiles(const char *dir) {
    vectors_t v;
    if (load(dir, "einstein_tiles_forms_0_15", 4, &v)) return 1;
    uint32_t bad = 0;
    for (uint32_t i = 0; i < v.count; i++) {
        const uint64_t *r = v.data + 4 * i;
        if (ge_tile_form_id(r[0]) != r[1] || ge_tile_south_halo(r[0]) != r[2] || ge_tile_payload(r[0]) != r[3]) bad++;
    }
    free(v.data);
    return report("einstein_tiles_forms_0_15", v.count, bad);
}

static int garner_crt(const char *dir) {
    vectors_t v;
    if (load(dir, "garner_crt_881_883_887", 4, &v)) return 1;
    uint32_t bad = 0;
    for (uint32_t i = 0; i < v.count; i++) {
        const uint64_t *r = v.data + 4 * i;
        uint16_t res[3];
        ge_crt_encode((uint32_t)r[0], res);
        uint16_t want[3] = {(uint16_t)r[1], (uint16_t)r[2], (uint16_t)r[3]};
        if (memcmp(res, want, sizeof res) != 0 || ge_crt_decode(want) != r[0]) bad++;
    }
    free(v.data);
    return report("garner_crt_881_883_887", v.count, bad);
}

static int gram_tqf(const char *dir) {
    vectors_t v;
    if (load(dir, "gram_tqf_collinearity", 9, &v)) return 1;
    uint32_t bad = 0;
    for (uint32_t i = 0; i < v.count; i++) {
        const uint64_t *r = v.data + 9 * i;
        ge_point_t p1 = {(int64_t)r[0], (int64_t)r[1]}, p2 = {(int64_t)r[2], (int64_t)r[3]}, p3 = {(int64_t)r[4], (int64_t)r[5]};
        unsigned __int128 a = ge_gram_tqf(p1, p2, p3);
        if ((uint64_t)a != r[6] || (uint64_t)(a >> 64) != r[7] || ge_is_collinear(p1, p2, p3) != (r[8] != 0)) bad++;
    }
    free(v.data);
    return report("gram_tqf_collinearity", v.count, bad);
}

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s <geometric-engine-spec/test_vectors>\n", argv[0]);
        return 2;
    }
    int failed = einstein_tiles(argv[1]) + garner_crt(argv[1]) + gram_tqf(argv[1]);
    printf("SHD-CCP Spec v%s: %s\n", GENGINE_SPEC_VERSION, failed ? "NON-CONFORMANT" : "CONFORMANT");
    return failed != 0;
}
