package io.github.shdccp.gengine;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class UnitTest {
    @Test
    void tileRoundTrip() {
        long t = EinsteinTile.pack(5, 0xA5, 0x01_2345_6789L);
        assertEquals(5, EinsteinTile.formId(t));
        assertEquals(0xA5, EinsteinTile.southHalo(t));
        assertEquals(0x01_2345_6789L, EinsteinTile.payload(t));
        assertThrows(IllegalArgumentException.class, () -> EinsteinTile.pack(0, 0, EinsteinTile.FORM_ID_MASK));
    }

    @Test
    void crtRoundTrip() {
        for (int n = 0; n < 200_000; n += 7) {
            assertEquals(n, GarnerCrt.decode(GarnerCrt.r881(n), GarnerCrt.r883(n), GarnerCrt.r887(n)));
        }
        int top = GarnerCrt.M - 1;
        assertEquals(top, GarnerCrt.decode(GarnerCrt.r881(top), GarnerCrt.r883(top), GarnerCrt.r887(top)));
    }

    @Test
    void tqfRightTriangle() {
        assertEquals(new GramTqf.U128(0, 576), GramTqf.compute(0, 0, 3, 0, 0, 4));
        assertTrue(GramTqf.isCollinear(0, 0, 2, 2, -5, -5));
    }
}
