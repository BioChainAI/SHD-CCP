package io.github.shdccp.gengine;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;

/**
 * Runs the binding against geometric-engine-spec/test_vectors/*.bin (SHDGEV01).
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

    static long[][] load(String suite, int fields) throws IOException {
        ByteBuffer b = ByteBuffer.wrap(Files.readAllBytes(vectorsDir().resolve(suite + ".bin"))).order(ByteOrder.LITTLE_ENDIAN);
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

    @Test
    void einsteinTiles() throws IOException {
        for (long[] r : load("einstein_tiles_forms_0_15", 4)) {
            assertEquals(r[1], EinsteinTile.formId(r[0]));
            assertEquals(r[2], EinsteinTile.southHalo(r[0]));
            assertEquals(r[3], EinsteinTile.payload(r[0]));
        }
    }

    @Test
    void garnerCrt() throws IOException {
        for (long[] r : load("garner_crt_881_883_887", 4)) {
            int n = (int) r[0];
            assertArrayEquals(new int[] {(int) r[1], (int) r[2], (int) r[3]},
                    new int[] {GarnerCrt.r881(n), GarnerCrt.r883(n), GarnerCrt.r887(n)});
            assertEquals(n, GarnerCrt.decode((int) r[1], (int) r[2], (int) r[3]));
        }
    }

    @Test
    void gramTqf() throws IOException {
        for (long[] r : load("gram_tqf_collinearity", 9)) {
            assertEquals(new GramTqf.U128(r[7], r[6]), GramTqf.compute(r[0], r[1], r[2], r[3], r[4], r[5]));
            assertEquals(r[8] != 0, GramTqf.isCollinear(r[0], r[1], r[2], r[3], r[4], r[5]));
        }
    }
}
