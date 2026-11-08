/* Runs libgengine against every suite in geometric-engine-spec/test_vectors/.
 *
 * The suites are discovered from the .json files in test_vectors/ (CONFORMANCE.md): each file's
 * "suite" and "status" are read, a suite with a handler below runs against its SHDGEV01 .bin mirror, a
 * normative suite without a handler fails, a draft suite without a handler is reported as
 * skipped, and a pending suite is skipped. A handler whose suite is missing also fails.
 *
 * The verdict line covers the normative suites only (CONFORMANCE.md rule 2). A failing draft case
 * is reported next to the verdict and still makes the run exit non-zero. */
#define _POSIX_C_SOURCE 200809L

#include <dirent.h>
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
        free(v->data);
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

static const struct {
    const char *suite;
    int (*run)(const char *dir);
} handlers[] = {
    {"einstein_tiles_forms_0_15", einstein_tiles},
    {"garner_crt_881_883_887", garner_crt},
    {"gram_tqf_collinearity", gram_tqf},
};
#define N_HANDLERS (sizeof handlers / sizeof handlers[0])

/* ── Suite discovery ─────────────────────────────────────────────────────────── */

static char *read_text(const char *path) {
    FILE *f = fopen(path, "rb");
    if (!f) return NULL;
    size_t cap = 1 << 16, len = 0;
    char *buf = malloc(cap + 1);
    size_t got;
    while (buf && (got = fread(buf + len, 1, cap - len, f)) > 0) {
        len += got;
        if (len == cap) {
            char *bigger = realloc(buf, 2 * cap + 1);
            if (!bigger) { free(buf); buf = NULL; break; }
            buf = bigger;
            cap *= 2;
        }
    }
    fclose(f);
    if (buf) buf[len] = '\0';
    return buf;
}

/* Reads a top-level string member of a suite envelope. Only the text before the "cases" member
 * is searched, so a key inside a case object is never taken for an envelope key. */
static int envelope_string(const char *json, const char *key, char *out, size_t outlen) {
    const char *end = strstr(json, "\"cases\"");
    size_t keylen = strlen(key);
    for (const char *p = json; (p = strstr(p, "\"")) != NULL && (!end || p < end); p++) {
        if (strncmp(p + 1, key, keylen) != 0 || p[1 + keylen] != '"') continue;
        const char *before = p;
        while (before > json && strchr(" \t\r\n", before[-1])) before--;
        if (before == json || (before[-1] != '{' && before[-1] != ',')) continue;
        const char *q = p + keylen + 2;
        while (*q && strchr(" \t\r\n", *q)) q++;
        if (*q++ != ':') continue;
        while (*q && strchr(" \t\r\n", *q)) q++;
        if (*q++ != '"') return -1;
        size_t n = 0;
        while (q[n] && q[n] != '"' && q[n] != '\\') n++;
        if (q[n] != '"' || n >= outlen) return -1;
        memcpy(out, q, n);
        out[n] = '\0';
        return 0;
    }
    return -1;
}

static int by_name(const void *a, const void *b) {
    return strcmp(*(char *const *)a, *(char *const *)b);
}

int main(int argc, char **argv) {
    if (argc != 2) {
        fprintf(stderr, "usage: %s <geometric-engine-spec/test_vectors>\n", argv[0]);
        return 2;
    }
    const char *dir = argv[1];
    DIR *d = opendir(dir);
    if (!d) { perror(dir); return 2; }
    char **names = NULL;
    size_t count = 0;
    for (struct dirent *e; (e = readdir(d)) != NULL;) {
        size_t len = strlen(e->d_name);
        if (len <= 5 || strcmp(e->d_name + len - 5, ".json") != 0 || strcmp(e->d_name, "schema.json") == 0) continue;
        char **grown = realloc(names, (count + 1) * sizeof *names);
        if (!grown || !(grown[count] = strdup(e->d_name))) { perror("discovery"); return 2; }
        names = grown;
        count++;
    }
    closedir(d);
    if (count) qsort(names, count, sizeof *names, by_name);

    int failed = 0, draft_failed = 0;
    int seen[N_HANDLERS] = {0};
    for (size_t i = 0; i < count; i++) {
        char path[4096], suite[256], status[64];
        snprintf(path, sizeof path, "%s/%s", dir, names[i]);
        char *json = read_text(path);
        int ok = json && envelope_string(json, "suite", suite, sizeof suite) == 0 &&
                 envelope_string(json, "status", status, sizeof status) == 0;
        free(json);
        size_t stem = strlen(names[i]) - 5;
        if (!ok || strlen(suite) != stem || strncmp(suite, names[i], stem) != 0) {
            printf("%-28s cannot read its suite and status  FAIL\n", names[i]);
            failed++;
            continue;
        }
        size_t h = 0;
        while (h < N_HANDLERS && strcmp(handlers[h].suite, suite) != 0) h++;
        if (h < N_HANDLERS) seen[h] = 1;
        if (strcmp(status, "pending") == 0) {
            printf("%-28s pending      skipped\n", suite);
        } else if (h < N_HANDLERS) {
            int bad = handlers[h].run(dir);
            if (strcmp(status, "draft") == 0) draft_failed += bad;
            else failed += bad;
        } else if (strcmp(status, "draft") == 0) {
            printf("%-28s no handler for draft suite  skipped\n", suite);
        } else {
            printf("%-28s no handler for this %s suite  FAIL\n", suite, status);
            failed++;
        }
    }
    for (size_t h = 0; h < N_HANDLERS; h++) {
        if (!seen[h]) {
            printf("%-28s not found in %s  FAIL\n", handlers[h].suite, dir);
            failed++;
        }
    }
    for (size_t i = 0; i < count; i++) free(names[i]);
    free(names);
    printf("SHD-CCP Spec v%s: %s", GENGINE_SPEC_VERSION, failed ? "NON-CONFORMANT" : "CONFORMANT");
    if (draft_failed) printf(" (draft suites failing: %d)", draft_failed);
    printf("\n");
    return failed + draft_failed != 0;
}
