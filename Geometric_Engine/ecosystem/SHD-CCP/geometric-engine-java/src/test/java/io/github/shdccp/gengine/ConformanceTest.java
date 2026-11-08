package io.github.shdccp.gengine;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assumptions.abort;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;

/**
 * Runs the binding against every suite in geometric-engine-spec/test_vectors/.
 *
 * <p>The suites are discovered from the {@code .json} files in test_vectors/ (CONFORMANCE.md): each
 * file's {@code suite} and {@code status} are read, a suite with a handler below runs against its
 * SHDGEV01 {@code .bin} mirror, a normative suite without a handler fails, a draft suite without a
 * handler is reported as skipped, and a pending suite is skipped. A handler whose suite is missing
 * fails.
 *
 * <p>Spec location: -Dge.spec.dir, $GE_SPEC_DIR, ./spec (submodule), or ../geometric-engine-spec.
 */
class ConformanceTest {
    static Path vectorsDir() {
        return Stream.of(System.getProperty("ge.spec.dir"), System.getenv("GE_SPEC_DIR"), "spec", "../geometric-engine-spec")
                .filter(p -> p != null && !p.isEmpty())
                .map(p -> Path.of(p, "test_vectors"))
                .filter(Files::isDirectory)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("geometric-engine-spec not found (set GE_SPEC_DIR or add the spec submodule at ./spec)"));
    }

    static long[][] load(Path dir, String suite, int fields) throws IOException {
        ByteBuffer b = ByteBuffer.wrap(Files.readAllBytes(dir.resolve(suite + ".bin"))).order(ByteOrder.LITTLE_ENDIAN);
        byte[] magic = new byte[8];
        b.get(magic);
        assertEquals("SHDGEV01", new String(magic, StandardCharsets.US_ASCII), suite + ": magic");
        assertEquals(fields, b.getInt(), suite + ": field count");
        long[][] records = new long[b.getInt()][fields];
        for (long[] r : records) {
            for (int i = 0; i < fields; i++) r[i] = b.getLong();
        }
        assertFalse(b.hasRemaining(), suite + ": trailing bytes");
        return records;
    }

    static void einsteinTiles(Path dir) throws IOException {
        for (long[] r : load(dir, "einstein_tiles_forms_0_15", 4)) {
            assertEquals(r[1], EinsteinTile.formId(r[0]));
            assertEquals(r[2], EinsteinTile.southHalo(r[0]));
            assertEquals(r[3], EinsteinTile.payload(r[0]));
        }
    }

    static void garnerCrt(Path dir) throws IOException {
        for (long[] r : load(dir, "garner_crt_881_883_887", 4)) {
            int n = (int) r[0];
            assertArrayEquals(new int[] {(int) r[1], (int) r[2], (int) r[3]},
                    new int[] {GarnerCrt.r881(n), GarnerCrt.r883(n), GarnerCrt.r887(n)});
            assertEquals(n, GarnerCrt.decode((int) r[1], (int) r[2], (int) r[3]));
        }
    }

    static void gramTqf(Path dir) throws IOException {
        for (long[] r : load(dir, "gram_tqf_collinearity", 9)) {
            assertEquals(new GramTqf.U128(r[7], r[6]), GramTqf.compute(r[0], r[1], r[2], r[3], r[4], r[5]));
            assertEquals(r[8] != 0, GramTqf.isCollinear(r[0], r[1], r[2], r[3], r[4], r[5]));
        }
    }

    interface Handler {
        void run(Path dir) throws IOException;
    }

    static final Map<String, Handler> HANDLERS = Map.<String, Handler>of(
            "einstein_tiles_forms_0_15", ConformanceTest::einsteinTiles,
            "garner_crt_881_883_887", ConformanceTest::garnerCrt,
            "gram_tqf_collinearity", ConformanceTest::gramTqf);

    /**
     * Reads a top-level string member of a suite envelope. Only the text before the {@code "cases"}
     * member is searched, so a key inside a case object is never taken for an envelope key.
     */
    static Optional<String> envelopeString(String json, String key) {
        int end = json.indexOf("\"cases\"");
        String head = end < 0 ? json : json.substring(0, end);
        Matcher m = Pattern.compile("[{,]\\s*\"" + Pattern.quote(key) + "\"\\s*:\\s*\"([^\"\\\\]*)\"").matcher(head);
        return m.find() ? Optional.of(m.group(1)) : Optional.empty();
    }

    static List<Path> suiteFiles(Path dir) throws IOException {
        try (Stream<Path> files = Files.list(dir)) {
            return files.filter(p -> {
                String name = p.getFileName().toString();
                return name.endsWith(".json") && !name.equals("schema.json");
            }).sorted().toList();
        }
    }

    @TestFactory
    Stream<DynamicTest> everySuiteInTestVectors() throws IOException {
        Path dir = vectorsDir();
        return suiteFiles(dir).stream().map(file -> {
            String name = file.getFileName().toString().replaceFirst("\\.json$", "");
            return DynamicTest.dynamicTest(name, () -> {
                String json = Files.readString(file);
                String suite = envelopeString(json, "suite").orElseGet(() -> fail(file + ": cannot read its suite"));
                String status = envelopeString(json, "status").orElseGet(() -> fail(file + ": cannot read its status"));
                assertEquals(name, suite, file + " declares suite " + suite);
                Handler handler = HANDLERS.get(suite);
                if (status.equals("pending")) abort("pending, no cases");
                if (handler != null) {
                    handler.run(dir);
                } else if (status.equals("draft")) {
                    abort("no handler for draft suite " + suite);
                } else {
                    fail("no handler for " + status + " suite " + suite);
                }
            });
        });
    }

    @Test
    void everyHandlerHasASuite() throws IOException {
        Path dir = vectorsDir();
        List<String> present = suiteFiles(dir).stream().map(p -> p.getFileName().toString().replaceFirst("\\.json$", "")).toList();
        List<String> missing = HANDLERS.keySet().stream().filter(s -> !present.contains(s)).sorted().toList();
        assertEquals(List.of(), missing, "suites not found in " + dir);
    }

    @Test
    void envelopeKeysAreReadFromTheEnvelopeOnly() {
        String json = "{\n  \"suite\": \"a_b\",\n  \"description\": \"the \\\"status\\\" key\",\n  \"status\": \"draft\",\n  \"cases\": [{\"status\": \"normative\"}]\n}";
        assertEquals(Optional.of("a_b"), envelopeString(json, "suite"));
        assertEquals(Optional.of("draft"), envelopeString(json, "status"));
        assertEquals(Optional.empty(), envelopeString("{\"cases\": [{\"suite\": \"x\"}], \"suite\": \"y\"}", "suite"));
    }
}
