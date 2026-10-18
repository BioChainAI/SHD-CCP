package io.github.shdccp.gengine;

/**
 * Exact 128-bit Gram-TQF collinearity (RFC 02).
 *
 * <p>{@code A = (Q1+Q2+Q3)^2 - 2(Q1^2+Q2^2+Q3^2) = 16 * area^2}, computed with
 * {@link Math#multiplyHigh} on primitive longs instead of {@code BigInteger}. Coordinates must satisfy
 * {@code |c| <= COORD_MAX}.
 */
public final class GramTqf {
    public static final long COORD_MAX = 1L << 20;

    /** Unsigned 128-bit result. */
    public record U128(long hi, long lo) {
        public boolean isZero() {
            return hi == 0 && lo == 0;
        }
    }

    private GramTqf() {}

    public static U128 compute(long x1, long y1, long x2, long y2, long x3, long y3) {
        long q1 = quadrance(x2, y2, x3, y3), q2 = quadrance(x1, y1, x3, y3), q3 = quadrance(x1, y1, x2, y2);
        long s = q1 + q2 + q3;
        // sum of squares, then doubled
        long sqLo = 0, sqHi = 0;
        for (int i = 0; i < 3; i++) {
            long q = i == 0 ? q1 : i == 1 ? q2 : q3;
            long lo = q * q, hi = Math.multiplyHigh(q, q);
            long nLo = sqLo + lo;
            sqHi += hi + (Long.compareUnsigned(nLo, sqLo) < 0 ? 1 : 0);
            sqLo = nLo;
        }
        sqHi = (sqHi << 1) | (sqLo >>> 63);
        sqLo <<= 1;
        long sLo = s * s, sHi = Math.multiplyHigh(s, s);
        long lo = sLo - sqLo;
        long hi = sHi - sqHi - (Long.compareUnsigned(sLo, sqLo) < 0 ? 1 : 0);
        return new U128(hi, lo);
    }

    public static boolean isCollinear(long x1, long y1, long x2, long y2, long x3, long y3) {
        // A == 0 iff the doubled signed area is 0; no 128-bit work needed for the predicate.
        return (x2 - x1) * (y3 - y1) - (x3 - x1) * (y2 - y1) == 0;
    }

    private static long quadrance(long ax, long ay, long bx, long by) {
        long dx = ax - bx, dy = ay - by;
        return dx * dx + dy * dy;
    }
}
